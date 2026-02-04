import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient, Prisma } from '../src/app/generated/prisma/client'

// Get database credentials from environment variables
const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = parseInt(process.env.DB_PORT || '3306', 10)
const dbUser = process.env.DB_USER || 'root'
const dbPassword = process.env.DB_PASSWORD || ''
const dbName = process.env.DB_NAME || 'food-directory'
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
})

const prisma = new PrismaClient({ adapter })

const sectorData: Prisma.SectorCreateInput[] = [
    { name: 'Cereals', hsCode: '10' },
    // { name: 'Poultry and Dairy', hsCode: '02' },
    // { name: 'SeaFood', hsCode: '03' },
    // { name: 'Floriculture', hsCode: '04' },
    // { name: 'Fruit and Vegetables', hsCode: '05' },
    // { name: 'Spices', hsCode: '06' },
    // { name: 'Rice', hsCode: '07' },
    // { name: 'Maize Flour and Starches', hsCode: '08' },
    // { name: 'Oil Seeds & Oils', hsCode: '09' },
    // { name: 'Sugar and Confectionary', hsCode: '10' },
    // { name: 'Processed Food', hsCode: '11' },
    // { name: 'Bakery', hsCode: '12' },
    // { name: 'Beverages', hsCode: '13' },
    // { name: 'Juices', hsCode: '14' },
    // { name: 'Animal Feed', hsCode: '15' },
    // { name: 'Tobacco', hsCode: '16' },
    // { name: 'Salt', hsCode: '17' },
    // { name: 'Machinery (Food Processing and Agri)', hsCode: '18' },
    // { name: 'Certifications & Logistics', hsCode: '19' },
]

export async function main() {
    try {
        console.log('Starting sector seed...')
        const result = await prisma.sector.createMany({
            data: sectorData,
            skipDuplicates: true,
        })
        console.log(`Successfully created ${result.count} sectors (duplicates skipped)`)
        console.log('Sector seed completed successfully!')
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