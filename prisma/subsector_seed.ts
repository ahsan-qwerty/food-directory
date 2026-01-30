import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient, Prisma } from '../src/app/generated/prisma/client'

const adapter = new PrismaMariaDb({
    host: 'localhost',
    port: 3306,
    user: "root",        // e.g. 'root' or another MySQL user
    password: "",
    database: "food-directory",
    connectionLimit: 5,
    // allowPublicKeyRetrieval: true, // uncomment if your server requires this
})

const prisma = new PrismaClient({ adapter })

const subsectorData: Prisma.SubSectorCreateInput[] = [
    { name: 'Rice', sector: { connect: { name: 'Cereals' } } },
    // { name: 'Agritech & other Services', sector: { connect: { name: 'Machinery/Technology (Food & Agri)' } } },
    // { name: 'Agritech & other services', sector: { connect: { name: 'Machinery/Technology (Food & Agri)' } } },
    // { name: 'Animal Feed', sector: { connect: { name: 'Machinery/Technology (Food & Agri)' } } },
    // { name: 'Bakery Products', sector: { connect: { name: 'Machinery/Technology (Food & Agri)' } } },
    // { name: 'Beverages & Drinks', sector: { connect: { name: 'Machinery/Technology (Food & Agri)' } } },
    // { name: 'Beverages and Drinks', sector: { connect: { name: 'Machinery/Technology (Food & Agri)' } } },
]

export async function main() {
    for (const s of subsectorData) {
        await prisma.subSector.create({ data: s })
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })