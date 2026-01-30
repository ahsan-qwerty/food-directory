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

const productData: Prisma.ProductCreateInput[] = [
    { name: 'Basmati Rice', subSector: { connect: { id: 1 } } },
]

export async function main() {
    for (const s of productData) {
        await prisma.product.create({ data: s })
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