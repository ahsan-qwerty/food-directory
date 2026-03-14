import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../src/app/generated/prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Get database credentials from environment variables
const dbHost = process.env.DB_HOST || 'yamabiko.proxy.rlwy.net'
const dbPort = parseInt(process.env.DB_PORT || '38666', 10)
const dbUser = process.env.DB_USER || 'root'
const dbPassword = process.env.DB_PASSWORD || 'SkWqshPLZhadSaMFlOjZLKlFBRqSneCC'
const dbName = process.env.DB_NAME || 'railway'
const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || '5', 10)

const adapter = new PrismaMariaDb({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    connectionLimit: connectionLimit,
    ssl: {
        rejectUnauthorized: false,
    },
    connectTimeout: 30000,
    socketTimeout: 30000,
})

const prisma = new PrismaClient({ adapter })

/**
 * Export current company data to CSV for manual review/restoration
 */
async function exportCompanyData() {
    console.log('📤 Exporting company data for restoration...\n')

    const companies = await prisma.company.findMany({
        select: {
            id: true,
            name: true,
            sectorId: true,
            subSectorId: true,
            sector: { select: { name: true } },
            subSector: { select: { name: true } },
            subSectors: {
                select: {
                    subSector: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: { id: 'asc' },
    })

    // Create CSV content
    const csvLines = [
        'Company ID,Company Name,Legacy Sector ID,Legacy SubSector ID,Current Sector Name,Current SubSector Name,Many-to-Many SubSector IDs,Many-to-Many SubSector Names',
    ]

    for (const company of companies) {
        const junctionSubSectorIds = company.subSectors.map(js => js.subSector.id).join(';')
        const junctionSubSectorNames = company.subSectors.map(js => js.subSector.name).join(';')

        csvLines.push([
            company.id,
            `"${company.name.replace(/"/g, '""')}"`,
            company.sectorId || '',
            company.subSectorId || '',
            company.sector?.name || '',
            company.subSector?.name || '',
            junctionSubSectorIds || '',
            `"${junctionSubSectorNames.replace(/"/g, '""')}"`,
        ].join(','))
    }

    const csvContent = csvLines.join('\n')
    const exportPath = path.join(process.cwd(), 'prisma', 'company_subsector_export.csv')
    fs.writeFileSync(exportPath, csvContent, 'utf-8')

    console.log(`✅ Exported ${companies.length} companies to: ${exportPath}\n`)
    return exportPath
}

/**
 * Restore associations from a mapping file
 * Expected format: CSV with columns: companyId, subSectorName (or subSectorId)
 */
async function restoreFromMapping(mappingFilePath: string) {
    console.log(`📥 Restoring associations from: ${mappingFilePath}\n`)

    if (!fs.existsSync(mappingFilePath)) {
        throw new Error(`Mapping file not found: ${mappingFilePath}`)
    }

    const fileContent = fs.readFileSync(mappingFilePath, 'utf-8')
    const lines = fileContent.split('\n').filter(line => line.trim() && !line.startsWith('Company ID'))

    // Get all subsectors mapped by name
    const allSubsectors = await prisma.subSector.findMany({
        select: { id: true, name: true },
    })
    const subsectorNameToId = new Map(
        allSubsectors.map(s => [s.name.toLowerCase().trim(), s.id])
    )

    let restored = 0
    let skipped = 0
    const errors: string[] = []

    for (const line of lines) {
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''))
        if (parts.length < 2) continue

        const companyId = parseInt(parts[0])
        const subSectorName = parts[1]?.toLowerCase().trim()

        if (isNaN(companyId) || !subSectorName) {
            skipped++
            continue
        }

        const subSectorId = subsectorNameToId.get(subSectorName)
        if (!subSectorId) {
            errors.push(`Company ${companyId}: SubSector "${parts[1]}" not found`)
            skipped++
            continue
        }

        try {
            // Check if company exists
            const company = await prisma.company.findUnique({
                where: { id: companyId },
            })

            if (!company) {
                errors.push(`Company ${companyId}: Not found`)
                skipped++
                continue
            }

            // Check if association already exists
            const existing = await prisma.companySubSector.findFirst({
                where: {
                    companyId,
                    subSectorId,
                },
            })

            if (existing) {
                skipped++
                continue
            }

            // Create association
            await prisma.companySubSector.create({
                data: {
                    companyId,
                    subSectorId,
                },
            })

            // Also update legacy subSectorId if it's null
            if (!company.subSectorId) {
                await prisma.company.update({
                    where: { id: companyId },
                    data: { subSectorId: subSectorId },
                })
            }

            restored++
        } catch (error: any) {
            errors.push(`Company ${companyId}: ${error.message}`)
            skipped++
        }
    }

    console.log(`✅ Restored ${restored} associations`)
    console.log(`⏭️  Skipped ${skipped} entries`)
    if (errors.length > 0) {
        console.log(`\n❌ Errors (${errors.length}):`)
        errors.slice(0, 20).forEach(err => console.log(`   - ${err}`))
        if (errors.length > 20) {
            console.log(`   ... and ${errors.length - 20} more errors`)
        }
    }
}

/**
 * Create a template mapping file
 */
async function createMappingTemplate() {
    console.log('📝 Creating mapping template...\n')

    const companies = await prisma.company.findMany({
        where: {
            OR: [
                { subSectorId: null },
                { subSectors: { none: {} } },
            ],
        },
        select: {
            id: true,
            name: true,
        },
        orderBy: { id: 'asc' },
    })

    const allSubsectors = await prisma.subSector.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

    // Create template CSV
    const csvLines = [
        'Company ID,SubSector Name',
        '# Format: companyId,subSectorName',
        '# Example: 88,Rice',
        '#',
        '# Available SubSectors:',
    ]

    allSubsectors.forEach(sub => {
        csvLines.push(`#   - ${sub.name} (ID: ${sub.id})`)
    })

    csvLines.push('#')
    csvLines.push('# Companies needing associations:')

    companies.forEach(company => {
        csvLines.push(`${company.id},""`)
    })

    const csvContent = csvLines.join('\n')
    const templatePath = path.join(process.cwd(), 'prisma', 'subsector_restoration_template.csv')
    fs.writeFileSync(templatePath, csvContent, 'utf-8')

    console.log(`✅ Created template with ${companies.length} companies`)
    console.log(`   Template saved to: ${templatePath}\n`)
    console.log('📋 Instructions:')
    console.log('   1. Open the template file')
    console.log('   2. Fill in the SubSector Name for each company')
    console.log('   3. Run: pnpm tsx prisma/restore_subsector_associations.ts restore <template-file-path>')
}

export async function main() {
    const command = process.argv[2]
    const arg = process.argv[3]

    try {
        if (command === 'export') {
            await exportCompanyData()
        } else if (command === 'restore' && arg) {
            await restoreFromMapping(arg)
        } else if (command === 'template') {
            await createMappingTemplate()
        } else {
            console.log('🔧 Subsector Association Restoration Tool\n')
            console.log('Usage:')
            console.log('  pnpm tsx prisma/restore_subsector_associations.ts export')
            console.log('    - Export current company data to CSV')
            console.log('')
            console.log('  pnpm tsx prisma/restore_subsector_associations.ts template')
            console.log('    - Create a template CSV file for manual restoration')
            console.log('')
            console.log('  pnpm tsx prisma/restore_subsector_associations.ts restore <mapping-file.csv>')
            console.log('    - Restore associations from a mapping CSV file')
            console.log('    - CSV format: Company ID,SubSector Name')
            console.log('')
            console.log('Example:')
            console.log('  pnpm tsx prisma/restore_subsector_associations.ts template')
            console.log('  # Edit the template file, then:')
            console.log('  pnpm tsx prisma/restore_subsector_associations.ts restore prisma/subsector_restoration_template.csv')
        }
    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
})
