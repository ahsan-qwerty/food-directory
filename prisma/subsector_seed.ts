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

const subsectorData: Prisma.SubSectorCreateInput[] = [
    { name: 'Rice', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
]

// const subsectorData: Prisma.SubSectorCreateInput[] = [
//     // ROW 1
//     { name: 'Live animals', hsCode: '0101', sector: { connect: { name: 'Meat' } } },
//     { name: 'Fresh & frozen meat', hsCode: '0102', sector: { connect: { name: 'Meat' } } },
//     { name: 'Poultry', hsCode: '0201', sector: { connect: { name: 'Poultry and Dairy' } } },
//     { name: 'Dairy products', hsCode: '0202', sector: { connect: { name: 'Poultry and Dairy' } } },
//     { name: 'Animal by-products', hsCode: '0203', sector: { connect: { name: 'Poultry and Dairy' } } },

//     // ROW 2
//     { name: 'Fresh & frozen fish', hsCode: '0301', sector: { connect: { name: 'SeaFood' } } },
//     { name: 'Crustaceans', hsCode: '0302', sector: { connect: { name: 'SeaFood' } } },
//     { name: 'Molluscs', hsCode: '0303', sector: { connect: { name: 'SeaFood' } } },
//     { name: 'Processed seafood', hsCode: '0304', sector: { connect: { name: 'SeaFood' } } },
//     { name: 'Fish meal', hsCode: '0305', sector: { connect: { name: 'SeaFood' } } },

//     // ROW 3
//     { name: 'Live plants', hsCode: '0401', sector: { connect: { name: 'Floriculture' } } },
//     { name: 'Cut flowers', hsCode: '0402', sector: { connect: { name: 'Floriculture' } } },
//     { name: 'Buds', hsCode: '0403', sector: { connect: { name: 'Floriculture' } } },
//     { name: 'Ornamental foliage', hsCode: '0404', sector: { connect: { name: 'Floriculture' } } },

//     // ROW 4
//     { name: 'Fresh, chilled, frozen, dried fruits & vegetables; edible plant parts', hsCode: '0501', sector: { connect: { name: 'Fruit and Vegetables' } } },

//     // ROW 5
//     { name: 'Whole and ground spices', hsCode: '0501', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Seeds used as spices', hsCode: '0502', sector: { connect: { name: 'Cereals' } } },

//     // ROW 6
//     { name: 'Rice', hsCode: '0601', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Wheat', hsCode: '0602', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Maize', hsCode: '0603', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Cereal flours', hsCode: '0604', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Malt', hsCode: '0605', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Starches', hsCode: '0606', sector: { connect: { name: 'Cereals' } } },

//     // ROW 7
//     { name: 'Oil seeds', hsCode: '0701', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Oleaginous fruits', hsCode: '0702', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Vegetable & animal oils and fats', hsCode: '0703', sector: { connect: { name: 'Cereals' } } },

//     // ROW 8
//     { name: 'Raw/refined sugar', hsCode: '0801', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Sugar syrups', hsCode: '0802', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Sugar confectionery', hsCode: '0803', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Cocoa products', hsCode: '0804', sector: { connect: { name: 'Cereals' } } },

//     // ROW 9
//     { name: 'Bakery items', hsCode: '0901', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Pasta', hsCode: '0902', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Processed fruits & vegetables', hsCode: '0903', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Sauces', hsCode: '0904', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Beverages', hsCode: '0905', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Non-alcoholic drinks', hsCode: '0906', sector: { connect: { name: 'Cereals' } } },

//     // ROW 10
//     { name: 'Preparations used in animal feeding', hsCode: '1001', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Oil cake', hsCode: '1002', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Feed supplements', hsCode: '1003', sector: { connect: { name: 'Cereals' } } },

//     // ROW 11
//     { name: 'Unmanufactured tobacco', hsCode: '1101', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Manufactured tobacco products', hsCode: '1102', sector: { connect: { name: 'Cereals' } } },

//     // ROW 12
//     { name: 'Salt (table, industrial, edible)', hsCode: '1201', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Pure sodium chloride', hsCode: '1202', sector: { connect: { name: 'Cereals' } } },

//     // ROW 13
//     { name: 'Food processing machinery', hsCode: '1301', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Packing machines', hsCode: '1302', sector: { connect: { name: 'Cereals' } } },
//     { name: 'Agricultural machinery', hsCode: '1303', sector: { connect: { name: 'Cereals' } } },

//     // ROW 14
//     { name: 'Services', hsCode: '1401', sector: { connect: { name: 'Cereals' } } },
//     // Add more sub-sectors here with their hsCode and sector connections
//     // Example:
//     // { name: 'Wheat', hsCode: '1001', sector: { connect: { name: 'Cereals' } } },
// ]

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