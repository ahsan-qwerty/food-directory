import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../src/app/generated/prisma/client'

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
    ssl: { rejectUnauthorized: false },
    connectTimeout: 30000,
    socketTimeout: 30000,
})

const prisma = new PrismaClient({ adapter })

async function main() {
    try {
        console.log('🔍 Fetching all sectors and their subsectors...\n')

        // Get all sectors with their subsectors
        const sectors = await prisma.sector.findMany({
            select: {
                id: true,
                name: true,
                subSectors: {
                    select: { id: true, name: true },
                },
            },
        })

        // Build a map: sectorId -> subSector[]
        const sectorToSubSectors = new Map(
            sectors.map(s => [s.id, s.subSectors])
        )

        console.log('Sectors and their subsector counts:')
        sectors.forEach(s => {
            console.log(`  ${s.name} (ID: ${s.id}) → ${s.subSectors.length} subsectors`)
        })
        console.log()

        // Get all companies with their sector associations (legacy + junction)
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                name: true,
                sectorId: true,         // legacy FK
                subSectorId: true,      // legacy FK
                sectors: {
                    select: { sectorId: true },
                },
                subSectors: {
                    select: { subSectorId: true },
                },
            },
        })

        console.log(`Found ${companies.length} total companies\n`)

        let companiesProcessed = 0
        let companiesSkippedNoSector = 0
        let companiesSkippedNoSubsectors = 0
        let totalAssociationsCreated = 0
        let totalAssociationsSkipped = 0

        for (const company of companies) {
            // Collect all sector IDs for this company (legacy + junction)
            const sectorIds = new Set<number>()
            if (company.sectorId) sectorIds.add(company.sectorId)
            company.sectors.forEach(cs => sectorIds.add(cs.sectorId))

            if (sectorIds.size === 0) {
                companiesSkippedNoSector++
                continue
            }

            // Collect all subsectors from all sectors this company belongs to
            const allSubSectorsForCompany = new Map<number, string>()
            sectorIds.forEach(sectorId => {
                const subSectors = sectorToSubSectors.get(sectorId) || []
                subSectors.forEach(sub => allSubSectorsForCompany.set(sub.id, sub.name))
            })

            if (allSubSectorsForCompany.size === 0) {
                companiesSkippedNoSubsectors++
                continue
            }

            // Get existing subsector associations for this company
            const existingSubSectorIds = new Set<number>([
                ...(company.subSectorId ? [company.subSectorId] : []),
                ...company.subSectors.map(cs => cs.subSectorId),
            ])

            // Determine which subsectors need to be added
            const subsectorsToAdd: number[] = []
            allSubSectorsForCompany.forEach((_, subSectorId) => {
                if (!existingSubSectorIds.has(subSectorId)) {
                    subsectorsToAdd.push(subSectorId)
                }
            })

            if (subsectorsToAdd.length === 0) {
                totalAssociationsSkipped += existingSubSectorIds.size
                continue
            }

            // Create junction records
            try {
                await prisma.companySubSector.createMany({
                    data: subsectorsToAdd.map(subSectorId => ({
                        companyId: company.id,
                        subSectorId,
                    })),
                    skipDuplicates: true,
                })

                // Set legacy subSectorId to first subsector if currently null
                if (!company.subSectorId && subsectorsToAdd.length > 0) {
                    await prisma.company.update({
                        where: { id: company.id },
                        data: { subSectorId: subsectorsToAdd[0] },
                    })
                }

                totalAssociationsCreated += subsectorsToAdd.length
                companiesProcessed++
            } catch (error: any) {
                console.error(`  ❌ Error processing company "${company.name}" (ID: ${company.id}): ${error.message}`)
            }
        }

        console.log('═══════════════════════════════════════════════════════════')
        console.log('✅ DONE')
        console.log('═══════════════════════════════════════════════════════════')
        console.log(`  Companies updated:         ${companiesProcessed}`)
        console.log(`  Associations created:      ${totalAssociationsCreated}`)
        console.log(`  Skipped (already existed): ${totalAssociationsSkipped}`)
        console.log(`  Skipped (no sector):       ${companiesSkippedNoSector}`)
        console.log(`  Skipped (sector has no subsectors): ${companiesSkippedNoSubsectors}`)
        console.log()

    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main().catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
})
