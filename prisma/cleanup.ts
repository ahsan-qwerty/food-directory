import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../src/app/generated/prisma/client'

// Get database credentials from environment variables
const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = parseInt(process.env.DB_PORT || '3306', 10)
const dbUser = process.env.DB_USER || 'root'
const dbPassword = process.env.DB_PASSWORD || ""
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

export async function main() {
    try {
        console.log('Starting database cleanup...')

        // // Delete in reverse order of dependencies (Product -> SubSector -> Sector)
        // console.log('Deleting all Products...')
        // const productCount = await prisma.product.deleteMany({})
        // console.log(`Deleted ${productCount.count} products`)

        // console.log('Deleting all SubSectors...')
        // const subsectorCount = await prisma.subSector.deleteMany({})
        // console.log(`Deleted ${subsectorCount.count} sub-sectors`)

        // console.log('Deleting all Sectors...')
        // const sectorCount = await prisma.sector.deleteMany({})
        // console.log(`Deleted ${sectorCount.count} sectors`)

        console.log('Deleting all Companies...')
        const companyCount = await prisma.company.deleteMany({})
        console.log(`Deleted ${companyCount.count} companies`)

        console.log('Database cleanup completed successfully!')
        console.log('All tables have been cleared. IDs will reset on next insert.')
    } catch (error) {
        console.error('Error during cleanup:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((error) => {
    console.error('Cleanup failed:', error)
    process.exit(1)
})
