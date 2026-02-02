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

if (!dbPassword) {
    console.error('Error: DB_PASSWORD environment variable is required')
    process.exit(1)
}

const adapter = new PrismaMariaDb({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    connectionLimit: connectionLimit,
})

const prisma = new PrismaClient({ adapter })

const subsectorData: Prisma.SubSectorCreateInput[] = [
    // ROW 1
    { name: 'Live animals', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Fresh & frozen meat', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Poultry', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Dairy products', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Animal by-products', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 2
    { name: 'Fresh & frozen fish', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Crustaceans', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Molluscs', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Processed seafood', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Fish meal', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 3
    { name: 'Live plants', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Cut flowers', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Buds', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Ornamental foliage', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 4
    { name: 'Fresh, chilled, frozen, dried fruits & vegetables; edible plant parts', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 5
    { name: 'Whole and ground spices', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Seeds used as spices', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 6
    { name: 'Rice', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Wheat', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Maize', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Cereal flours', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Malt', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Starches', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 7
    { name: 'Oil seeds', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Oleaginous fruits', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Vegetable & animal oils and fats', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 8
    { name: 'Raw/refined sugar', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Sugar syrups', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Sugar confectionery', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Cocoa products', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 9
    { name: 'Bakery items', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Pasta', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Processed fruits & vegetables', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Sauces', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Beverages', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Non-alcoholic drinks', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 10
    { name: 'Preparations used in animal feeding', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Oil cake', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Feed supplements', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 11
    { name: 'Unmanufactured tobacco', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Manufactured tobacco products', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 12
    { name: 'Salt (table, industrial, edible)', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Pure sodium chloride', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 13
    { name: 'Food processing machinery', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Packing machines', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    { name: 'Agricultural machinery', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // ROW 14
    { name: 'Services', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    // Add more sub-sectors here with their hsCode and sector connections
    // Example:
    // { name: 'Wheat', hsCode: '1001', sector: { connect: { name: 'Cereals' } } },
]

export async function main() {
    try {
        console.log('Starting sub-sector seed...')
        for (const s of subsectorData) {
            await prisma.subSector.create({ data: s })
            console.log(`Created sub-sector: ${s.name}`)
        }
        console.log('Sub-sector seed completed successfully!')
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