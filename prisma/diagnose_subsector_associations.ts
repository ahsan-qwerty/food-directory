import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../src/app/generated/prisma/client'

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

export async function main() {
    try {
        console.log('🔍 Diagnosing Company-Subsector Associations\n')
        console.log('═══════════════════════════════════════════════════════════\n')

        // Get all companies with their subsector associations
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                name: true,
                subSectorId: true,
                subSector: {
                    select: {
                        id: true,
                        name: true,
                        sector: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                subSectors: {
                    select: {
                        subSector: {
                            select: {
                                id: true,
                                name: true,
                                sector: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { id: 'asc' },
        })

        console.log(`Found ${companies.length} companies\n`)

        // Companies with legacy subSectorId
        const companiesWithLegacySubsector = companies.filter(c => c.subSectorId !== null)
        console.log(`Companies with legacy subSectorId: ${companiesWithLegacySubsector.length}`)

        if (companiesWithLegacySubsector.length > 0) {
            console.log('\n📋 Legacy subSectorId associations:')
            companiesWithLegacySubsector.forEach(company => {
                if (company.subSector) {
                    console.log(`  Company "${company.name}" (ID: ${company.id})`)
                    console.log(`    → SubSector ID ${company.subSectorId}: "${company.subSector.name}"`)
                    console.log(`      Sector: "${company.subSector.sector.name}"\n`)
                } else {
                    console.log(`  Company "${company.name}" (ID: ${company.id})`)
                    console.log(`    → SubSector ID ${company.subSectorId}: ❌ NOT FOUND\n`)
                }
            })
        }

        // Companies with many-to-many associations
        const companiesWithJunctionSubsectors = companies.filter(c => c.subSectors.length > 0)
        console.log(`\nCompanies with many-to-many subsector associations: ${companiesWithJunctionSubsectors.length}`)

        if (companiesWithJunctionSubsectors.length > 0) {
            console.log('\n📋 Many-to-many subsector associations:')
            companiesWithJunctionSubsectors.forEach(company => {
                console.log(`  Company "${company.name}" (ID: ${company.id})`)
                company.subSectors.forEach(({ subSector }) => {
                    console.log(`    → SubSector ID ${subSector.id}: "${subSector.name}"`)
                    console.log(`      Sector: "${subSector.sector.name}"`)
                })
                console.log()
            })
        }

        // Companies with no subsector associations
        const companiesWithoutSubsectors = companies.filter(
            c => c.subSectorId === null && c.subSectors.length === 0
        )
        console.log(`\nCompanies with NO subsector associations: ${companiesWithoutSubsectors.length}`)
        if (companiesWithoutSubsectors.length > 0 && companiesWithoutSubsectors.length <= 20) {
            console.log('\n📋 Companies without subsectors:')
            companiesWithoutSubsectors.forEach(company => {
                console.log(`  - "${company.name}" (ID: ${company.id})`)
            })
        } else if (companiesWithoutSubsectors.length > 20) {
            console.log(`\n  (Showing first 20 of ${companiesWithoutSubsectors.length})`)
            companiesWithoutSubsectors.slice(0, 20).forEach(company => {
                console.log(`  - "${company.name}" (ID: ${company.id})`)
            })
        }

        // Summary statistics
        console.log('\n═══════════════════════════════════════════════════════════')
        console.log('📊 SUMMARY STATISTICS')
        console.log('═══════════════════════════════════════════════════════════')
        console.log(`Total companies: ${companies.length}`)
        console.log(`  - With legacy subSectorId: ${companiesWithLegacySubsector.length}`)
        console.log(`  - With many-to-many associations: ${companiesWithJunctionSubsectors.length}`)
        console.log(`  - Without any subsector: ${companiesWithoutSubsectors.length}`)
        console.log(`  - With both legacy and many-to-many: ${companies.filter(c => c.subSectorId !== null && c.subSectors.length > 0).length}`)

        // Check for potential issues
        console.log('\n═══════════════════════════════════════════════════════════')
        console.log('⚠️  POTENTIAL ISSUES')
        console.log('═══════════════════════════════════════════════════════════')

        const issues: string[] = []

        // Check if companies have mismatched legacy and junction associations
        const mismatched = companies.filter(c => {
            if (c.subSectorId === null || c.subSectors.length === 0) return false
            const legacySubSectorId = c.subSectorId
            const junctionSubSectorIds = c.subSectors.map(js => js.subSector.id)
            return !junctionSubSectorIds.includes(legacySubSectorId!)
        })

        if (mismatched.length > 0) {
            issues.push(`${mismatched.length} companies have legacy subSectorId that doesn't match their many-to-many associations`)
        }

        if (issues.length === 0) {
            console.log('✅ No obvious issues detected!')
        } else {
            issues.forEach(issue => console.log(`  ⚠️  ${issue}`))
        }

        console.log('\n═══════════════════════════════════════════════════════════')
        console.log('💡 RECOMMENDATIONS')
        console.log('═══════════════════════════════════════════════════════════')

        if (companiesWithLegacySubsector.length > 0) {
            console.log('\n1. If subsector IDs changed after table recreation:')
            console.log('   - Companies may be pointing to wrong subsectors')
            console.log('   - Review the associations above to verify correctness')
            console.log('   - Use the fix script to update if needed')
        }

        if (companiesWithoutSubsectors.length > companies.length * 0.5) {
            console.log('\n2. Many companies are missing subsector associations')
            console.log('   - This might indicate data loss during table recreation')
            console.log('   - Consider restoring from backup if available')
        }

        console.log('\n')

    } catch (error) {
        console.error('❌ Error during diagnosis:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
})
