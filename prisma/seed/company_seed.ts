import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../src/app/generated/prisma/client'
import * as path from 'path'
import * as XLSX from 'xlsx'

// Get database credentials from environment variables
const dbHost = process.env.DB_HOST || 'yamabiko.proxy.rlwy.net'
const dbPort = parseInt(process.env.DB_PORT || '38666', 10)
const dbUser = process.env.DB_USER || 'root'
const dbPassword = process.env.DB_PASSWORD || 'SkWqshPLZhadSaMFlOjZLKlFBRqSneCC'
const dbName = process.env.DB_NAME || 'railway'
const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || '5', 10)

// if (!dbPassword) {
//     console.error('Error: DB_PASSWORD environment variable is required')
//     process.exit(1)
// }

const adapter = new PrismaMariaDb({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    connectionLimit: connectionLimit,
    // Railway MySQL requires SSL for external connections
    ssl: {
        rejectUnauthorized: false, // Railway uses self-signed certificates
    },
    // Increase connection timeout for external connections
    connectTimeout: 30000, // 30 seconds
    socketTimeout: 30000, // 30 seconds
})

const prisma = new PrismaClient({ adapter })

// Helper function to clean value (handle "-" as null, empty strings as null)
function cleanValue(value: string): string | null {
    const cleaned = value.trim()
    if (cleaned === '' || cleaned === '-') {
        return null
    }
    return cleaned
}

function normalizeKey(key: string): string {
    return String(key).toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function getByHeader(row: Record<string, any>, header: string): string {
    const target = normalizeKey(header)
    for (const [k, v] of Object.entries(row)) {
        if (normalizeKey(k) === target) return String(v ?? '')
    }
    return ''
}

async function main() {
    try {
        console.log('Starting company seed from 5-dry_fruits.xlsx...')

        const xlsxPath = path.join(process.cwd(), 'data', '5-dry_fruits.xlsx')
        const workbook = XLSX.readFile(xlsxPath)
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
            throw new Error('No sheets found in 5-dry_fruits.xlsx')
        }

        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' })

        // Look up the related sector/sub-sector once (Sugar and Confectionary -> Dry Fruits)
        const dryFruitsSubSector = await prisma.subSector.findFirst({
            where: { name: 'Dry Fruits' },
            select: { id: true, sectorId: true },
        })

        if (!dryFruitsSubSector) {
            throw new Error('SubSector "Dry Fruits" not found. Run sector and subsector seeds before company seed.')
        }

        const companyData = rows
            .map((row) => {
                const name = getByHeader(row, 'Company Name')
                return {
                    name,
                    profile: cleanValue(getByHeader(row, 'Company Profile')),
                    address: cleanValue(getByHeader(row, 'Company Address')),
                    email: cleanValue(getByHeader(row, 'Company Email')),
                    website: cleanValue(getByHeader(row, 'Company Website')),
                    representativeName: cleanValue(getByHeader(row, 'Company Representative/Delegate Name')),
                    representativeTel: cleanValue(getByHeader(row, 'Representative Tel')),
                    representativeWhatsapp: cleanValue(getByHeader(row, 'Representative Whatsapp')),
                    representativeEmail: cleanValue(getByHeader(row, 'Representative Email')),
                    productsToBeDisplayed: cleanValue(getByHeader(row, 'Products To Be Displayed')),
                    sectorId: dryFruitsSubSector.sectorId,
                    subSectorId: dryFruitsSubSector.id,
                }
            })
            .filter((c) => (c.name || '').trim() !== '')

        console.log(`Parsed ${companyData.length} companies from XLSX`)

        // Insert companies
        const companyDelegate = (prisma as any).company
        if (!companyDelegate?.createMany) {
            throw new Error(
                'PrismaClient does not have `company` yet. Run `npx prisma migrate dev` (for Company) then `npx prisma generate`.'
            )
        }

        const result = await companyDelegate.createMany({
            data: companyData,
            skipDuplicates: true,
        })

        console.log(`Successfully created ${result.count} companies (duplicates skipped)`)
        console.log('Company seed completed successfully!')
    } catch (error) {
        console.error('Error during seed:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
})
