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
        console.log('🔍 Analyzing broken subsector references...\n')

        // Get all current subsectors with their IDs
        const allSubsectors = await prisma.subSector.findMany({
            select: { id: true, name: true },
        })
        const subsectorMap = new Map(allSubsectors.map(s => [s.id, s.name]))
        const subsectorNameToId = new Map(allSubsectors.map(s => [s.name.toLowerCase(), s.id]))

        console.log(`Found ${allSubsectors.length} subsectors in database\n`)

        // 1. Check Company.subSectorId (legacy FK)
        console.log('📊 Checking Company.subSectorId references...')
        const companiesWithSubsector = await prisma.company.findMany({
            where: { subSectorId: { not: null } },
            select: { id: true, name: true, subSectorId: true },
        })

        const brokenCompanyRefs: Array<{ id: number; name: string; oldSubSectorId: number }> = []
        const validCompanyRefs: Array<{ id: number; name: string; subSectorId: number }> = []

        for (const company of companiesWithSubsector) {
            if (company.subSectorId && !subsectorMap.has(company.subSectorId)) {
                brokenCompanyRefs.push({
                    id: company.id,
                    name: company.name,
                    oldSubSectorId: company.subSectorId,
                })
            } else if (company.subSectorId) {
                validCompanyRefs.push({
                    id: company.id,
                    name: company.name,
                    subSectorId: company.subSectorId,
                })
            }
        }

        console.log(`  ✓ Valid references: ${validCompanyRefs.length}`)
        console.log(`  ✗ Broken references: ${brokenCompanyRefs.length}\n`)

        // 2. Check CompanySubSector junction table
        console.log('📊 Checking CompanySubSector junction table...')
        const allCompanySubSectors = await prisma.companySubSector.findMany({
            select: { id: true, companyId: true, subSectorId: true },
        })

        const brokenJunctionRefs: Array<{ id: number; companyId: number; oldSubSectorId: number }> = []
        const validJunctionRefs: Array<{ id: number; companyId: number; subSectorId: number }> = []

        for (const junction of allCompanySubSectors) {
            if (!subsectorMap.has(junction.subSectorId)) {
                brokenJunctionRefs.push({
                    id: junction.id,
                    companyId: junction.companyId,
                    oldSubSectorId: junction.subSectorId,
                })
            } else {
                validJunctionRefs.push({
                    id: junction.id,
                    companyId: junction.companyId,
                    subSectorId: junction.subSectorId,
                })
            }
        }

        console.log(`  ✓ Valid references: ${validJunctionRefs.length}`)
        console.log(`  ✗ Broken references: ${brokenJunctionRefs.length}\n`)

        // 3. Check Product.subSectorId
        console.log('📊 Checking Product.subSectorId references...')
        const productsWithSubsector = await prisma.product.findMany({
            select: { id: true, name: true, subSectorId: true },
        })

        const brokenProductRefs: Array<{ id: number; name: string; oldSubSectorId: number }> = []
        const validProductRefs: Array<{ id: number; name: string; subSectorId: number }> = []

        for (const product of productsWithSubsector) {
            if (!subsectorMap.has(product.subSectorId)) {
                brokenProductRefs.push({
                    id: product.id,
                    name: product.name,
                    oldSubSectorId: product.subSectorId,
                })
            } else {
                validProductRefs.push({
                    id: product.id,
                    name: product.name,
                    subSectorId: product.subSectorId,
                })
            }
        }

        console.log(`  ✓ Valid references: ${validProductRefs.length}`)
        console.log(`  ✗ Broken references: ${brokenProductRefs.length}\n`)

        // Summary
        const totalBroken = brokenCompanyRefs.length + brokenJunctionRefs.length + brokenProductRefs.length

        console.log('═══════════════════════════════════════════════════════════')
        console.log('📋 SUMMARY')
        console.log('═══════════════════════════════════════════════════════════')
        console.log(`Total broken references: ${totalBroken}`)
        console.log(`  - Company.subSectorId: ${brokenCompanyRefs.length}`)
        console.log(`  - CompanySubSector: ${brokenJunctionRefs.length}`)
        console.log(`  - Product.subSectorId: ${brokenProductRefs.length}\n`)

        if (totalBroken === 0) {
            console.log('✅ No broken references found! Everything looks good.')
            return
        }

        // Show broken references
        if (brokenCompanyRefs.length > 0) {
            console.log('\n🔴 Broken Company.subSectorId references:')
            brokenCompanyRefs.slice(0, 10).forEach(ref => {
                console.log(`  - Company "${ref.name}" (ID: ${ref.id}) -> SubSector ID: ${ref.oldSubSectorId} (does not exist)`)
            })
            if (brokenCompanyRefs.length > 10) {
                console.log(`  ... and ${brokenCompanyRefs.length - 10} more`)
            }
        }

        if (brokenJunctionRefs.length > 0) {
            console.log('\n🔴 Broken CompanySubSector references:')
            brokenJunctionRefs.slice(0, 10).forEach(ref => {
                console.log(`  - Junction ID: ${ref.id}, Company ID: ${ref.companyId} -> SubSector ID: ${ref.oldSubSectorId} (does not exist)`)
            })
            if (brokenJunctionRefs.length > 10) {
                console.log(`  ... and ${brokenJunctionRefs.length - 10} more`)
            }
        }

        if (brokenProductRefs.length > 0) {
            console.log('\n🔴 Broken Product.subSectorId references:')
            brokenProductRefs.slice(0, 10).forEach(ref => {
                console.log(`  - Product "${ref.name}" (ID: ${ref.id}) -> SubSector ID: ${ref.oldSubSectorId} (does not exist)`)
            })
            if (brokenProductRefs.length > 10) {
                console.log(`  ... and ${brokenProductRefs.length - 10} more`)
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════')
        console.log('🔧 FIXING BROKEN REFERENCES')
        console.log('═══════════════════════════════════════════════════════════\n')

        // Fix Company.subSectorId - set to NULL for broken references
        if (brokenCompanyRefs.length > 0) {
            console.log(`Fixing ${brokenCompanyRefs.length} Company.subSectorId references...`)
            for (const ref of brokenCompanyRefs) {
                await prisma.company.update({
                    where: { id: ref.id },
                    data: { subSectorId: null },
                })
            }
            console.log(`  ✅ Set ${brokenCompanyRefs.length} Company.subSectorId to NULL\n`)
        }

        // Fix CompanySubSector - delete broken junction entries
        if (brokenJunctionRefs.length > 0) {
            console.log(`Fixing ${brokenJunctionRefs.length} CompanySubSector references...`)
            const brokenIds = brokenJunctionRefs.map(ref => ref.id)
            await prisma.companySubSector.deleteMany({
                where: { id: { in: brokenIds } },
            })
            console.log(`  ✅ Deleted ${brokenJunctionRefs.length} broken CompanySubSector entries\n`)
        }

        // Fix Product.subSectorId - this is tricky, we'll need to set to NULL or delete
        // For now, let's set to NULL and log which products need manual fixing
        if (brokenProductRefs.length > 0) {
            console.log(`⚠️  Found ${brokenProductRefs.length} Product.subSectorId references that need attention`)
            console.log('   Products with broken subsector references:')
            brokenProductRefs.forEach(ref => {
                console.log(`     - Product ID ${ref.id}: "${ref.name}" (was pointing to SubSector ID ${ref.oldSubSectorId})`)
            })
            console.log('\n   ⚠️  Products cannot have NULL subSectorId (required field)')
            console.log('   You will need to manually reassign these products to valid subsectors or delete them.\n')

            // Note: We can't set Product.subSectorId to NULL because it's required
            // The user will need to manually fix these or we could delete them
            console.log('   Options:')
            console.log('   1. Manually reassign products to correct subsectors')
            console.log('   2. Delete products with broken references')
            console.log('   3. Create a mapping file to reassign based on product names\n')
        }

        console.log('═══════════════════════════════════════════════════════════')
        console.log('✅ Fix completed!')
        console.log('═══════════════════════════════════════════════════════════')
        console.log('\nNote: Products with broken subsector references need manual attention.')
        console.log('They cannot be automatically fixed because subSectorId is a required field.\n')

    } catch (error) {
        console.error('❌ Error during fix:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
})
