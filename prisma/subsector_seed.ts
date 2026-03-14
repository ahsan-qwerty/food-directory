import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient, Prisma } from '../src/app/generated/prisma/client'

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

const subsectorData: Prisma.SubSectorCreateInput[] = [
    // Cereals
    { name: 'Oats', hsCode: '1004', sector: { connect: { name: 'Cereals' } } },
    { name: 'Corn (Maize)', hsCode: '1005', sector: { connect: { name: 'Cereals' } } },

    // Oil & Ghee/Oil
    { name: 'Cooking Oils', hsCode: '1509', sector: { connect: { name: 'Oil & Ghee/Oil' } } },

    // Meat, Poultry & Diary
    { name: 'Frozen Red Meat', hsCode: '0201', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    { name: 'Frozen Poultry', hsCode: '0207', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    { name: 'Powdered Milk', hsCode: '0402', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    { name: 'Long-Life Milk (UHT)', hsCode: '0401', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    { name: 'Infant Milk Formula', hsCode: '1901', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    { name: 'Evaporated Milk', hsCode: '0402', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    { name: 'Table Eggs', hsCode: '0407', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    { name: 'Dairy and Yogurt Products', hsCode: '0403', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    { name: 'Cheese Products', hsCode: '0406', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    { name: 'Chilled Red Meat', hsCode: '0201', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    { name: 'Chilled Poultry', hsCode: '0207', sector: { connect: { name: 'Meat, Poultry & Diary' } } },

    // Processed Food, Bakery, Beverages, Juices
    { name: 'Baby Food', hsCode: '1901', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    { name: 'Tomato Paste', hsCode: '2002', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    { name: 'Canned Fruits & Vegetables, Pickles and Jam', hsCode: '2008', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    { name: 'Canned Meat and Fish', hsCode: '1604', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    { name: 'Light Energy-Dense Snack Meals', hsCode: '1905', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    { name: 'Mineral Water', hsCode: '2201', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    { name: 'Ready-to-Eat Meals', hsCode: '1604', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    { name: 'Nut Butter', hsCode: '2008', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    { name: 'Juices', hsCode: '2009', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    { name: 'Tea Products', hsCode: '0902', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    { name: 'Coffee Products', hsCode: '0901', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    { name: 'Pickles', hsCode: '2001', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },

    // Fruit and Vegetables
    { name: 'Frozen vegetables', hsCode: '0710', sector: { connect: { name: 'Fruit and Vegetables' } } },
    { name: 'Dates', hsCode: '0804', sector: { connect: { name: 'Fruit and Vegetables' } } },
    { name: 'Fresh vegetables', hsCode: '0701', sector: { connect: { name: 'Fruit and Vegetables' } } },
    { name: 'Fresh Fruits', hsCode: '0801', sector: { connect: { name: 'Fruit and Vegetables' } } },

    // Spices
    { name: 'Spices and Seasonings', hsCode: '0909', sector: { connect: { name: 'Spices' } } },

    // Salt
    { name: 'Mineral Salts', hsCode: '2501', sector: { connect: { name: 'Salt' } } },

    // Nuts & Dry Fruits
    { name: 'Seeds and Nuts', hsCode: '0802', sector: { connect: { name: 'Nuts & Dry Fruits' } } },

    // Machinery/Technology (Food & Agri)
    { name: 'Pesticides', hsCode: '3808', sector: { connect: { name: 'Machinery/Technology (Food & Agri)' } } },
    // Animal Feed
    { name: 'Green Fodder', hsCode: '1214', sector: { connect: { name: 'Animal Feed' } } },
    { name: 'Fish Feed', hsCode: '2309', sector: { connect: { name: 'Animal Feed' } } },

    // { name: 'Oil seeds', hsCode: '1006', sector: { connect: { name: 'Oil Seeds & Oils' } } },
    // { name: 'Oleaginous fruits', hsCode: '1006', sector: { connect: { name: 'Oil Seeds & Oils' } } },
    // { name: 'Vegetable & animal oils and fats', hsCode: '1006', sector: { connect: { name: 'Oil Seeds & Oils' } } },

    // { name: 'Rice', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    // { name: 'Maize', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    // { name: 'Wheat', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    // { name: 'Cereal flours', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    // { name: 'Malt', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },
    // { name: 'Starches', hsCode: '1006', sector: { connect: { name: 'Cereals' } } },

    // { name: 'Fruits', hsCode: '0811', sector: { connect: { name: 'Fruit and Vegetables' } } },
    // { name: 'Fresh, Chilled, Frozen, Dried Fruits & Vegetables;', hsCode: '0811', sector: { connect: { name: 'Fruit and Vegetables' } } },
    // { name: 'Edible Plant Parts', hsCode: '0811', sector: { connect: { name: 'Fruit and Vegetables' } } },

    // { name: 'Beverages', hsCode: '2206', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    // { name: 'Bakery items', hsCode: '2206', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    // { name: 'Pasta', hsCode: '2206', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    // { name: 'Processed fruits & vegetables', hsCode: '2206', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    // { name: 'Sauces', hsCode: '2206', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },
    // { name: 'Non-alcoholic drinks', hsCode: '2206', sector: { connect: { name: 'Processed Food, Bakery, Beverages, Juices' } } },

    // { name: 'Sugar Confectionary', hsCode: '1704', sector: { connect: { name: 'Sugar and Confectionary' } } },
    // { name: 'Raw/refined sugar', hsCode: '1703', sector: { connect: { name: 'Sugar and Confectionary' } } },
    // { name: 'Sugar syrups', hsCode: '1703', sector: { connect: { name: 'Sugar and Confectionary' } } },
    // { name: 'Cocoa products', hsCode: '1703', sector: { connect: { name: 'Sugar and Confectionary' } } },

    // { name: 'Oil & Ghee', hsCode: '1703', sector: { connect: { name: 'Oil & Ghee/Oil' } } },

    // { name: 'Salt', hsCode: '1703', sector: { connect: { name: 'Salt' } } },
    // { name: 'Salt(table, industrial, edible)', hsCode: '1703', sector: { connect: { name: 'Salt' } } },
    // { name: 'Pure sodium chloride', hsCode: '1703', sector: { connect: { name: 'Salt' } } },

    // { name: 'fisheries', hsCode: '1703', sector: { connect: { name: 'Sea Food & Fisheries' } } },

    // { name: 'Fresh & Frozen Fish', hsCode: '1703', sector: { connect: { name: 'Sea Food & Fisheries' } } },
    // { name: 'Crustaceans', hsCode: '1703', sector: { connect: { name: 'Sea Food & Fisheries' } } },
    // { name: 'Molluscs', hsCode: '1703', sector: { connect: { name: 'Sea Food & Fisheries' } } },
    // { name: 'Processed Seafood', hsCode: '1703', sector: { connect: { name: 'Sea Food & Fisheries' } } },
    // { name: 'Fish Meal', hsCode: '1703', sector: { connect: { name: 'Sea Food & Fisheries' } } },
    // { name: 'Spices', hsCode: '1703', sector: { connect: { name: 'FMCG' } } },

    // { name: 'Whole and Ground Spices', hsCode: '1703', sector: { connect: { name: 'Spices' } } },
    // { name: 'Seeds used as Spices', hsCode: '1703', sector: { connect: { name: 'Spices' } } },

    // { name: 'Poultry', hsCode: '1703', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    // { name: 'Live Animals', hsCode: '1703', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    // { name: 'Fresh & Frozen Meat', hsCode: '1703', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    // { name: 'Diary Products', hsCode: '1703', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    // { name: 'Animal By-Products', hsCode: '1703', sector: { connect: { name: 'Meat, Poultry & Diary' } } },
    // { name: 'Honey', hsCode: '1703', sector: { connect: { name: 'Honey' } } },

    // { name: 'Floriculture', hsCode: '1703', sector: { connect: { name: 'Floriculture' } } },
    // { name: 'Live Plants', hsCode: '1703', sector: { connect: { name: 'Floriculture' } } },
    // { name: 'Cut Flowers', hsCode: '1703', sector: { connect: { name: 'Floriculture' } } },
    // { name: 'Buds', hsCode: '1703', sector: { connect: { name: 'Floriculture' } } },
    // { name: 'Ornamental Foliage', hsCode: '1703', sector: { connect: { name: 'Floriculture' } } },

    // { name: 'Agritech', hsCode: '1703', sector: { connect: { name: 'Machinery/Technology (Food & Agri)' } } },
    // { name: 'Food Processing Machinery', hsCode: '1703', sector: { connect: { name: 'Machinery/Technology (Food & Agri)' } } },
    // { name: 'Packing Machines', hsCode: '1703', sector: { connect: { name: 'Machinery/Technology (Food & Agri)' } } },
    // { name: 'Agricultural Machinery', hsCode: '1703', sector: { connect: { name: 'Machinery/Technology (Food & Agri)' } } },

    // { name: 'Tobacco', hsCode: '1703', sector: { connect: { name: 'Tobacco' } } },
    // { name: 'Unmanufactured tobacco', hsCode: '1703', sector: { connect: { name: 'Tobacco' } } },
    // { name: 'Manufactured tobacco products', hsCode: '1703', sector: { connect: { name: 'Tobacco' } } },
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