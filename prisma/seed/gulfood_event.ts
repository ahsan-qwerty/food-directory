import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../../src/app/generated/prisma/client'

// Get database credentials from environment variables
const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = parseInt(process.env.DB_PORT || '3306', 10)
const dbUser = process.env.DB_USER || 'root'
const dbPassword = process.env.DB_PASSWORD || ''
const dbName = process.env.DB_NAME || 'food-directory'
const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || '5', 10)

const adapter = new PrismaMariaDb({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    connectionLimit,
})

const prisma = new PrismaClient({ adapter })

async function main() {
    try {
        console.log('Seeding single event...')

        const seedEvent = {
            name: 'Gulfood 2026',
            description:
                'Gulfood is one of the world’s largest annual food and beverage trade exhibitions. This seeded event is used to bootstrap the Events module in the TDAP Food Directory.',
            location: 'Dubai World Trade Centre, Dubai, UAE',
            // Use a deterministic date to keep seeds stable
            eventDate: new Date('2026-02-17T00:00:00.000Z'),
            feedbackFormUrl: null,
            finalRemarks: null,
        }

        const existing = await prisma.event.findFirst({
            where: {
                name: seedEvent.name,
                eventDate: seedEvent.eventDate,
            },
            select: { id: true },
        })

        if (existing) {
            console.log(`Event already exists (id=${existing.id}). Skipping.`)
            return
        }

        const created = await prisma.event.create({ data: seedEvent })
        console.log(`Created event id=${created.id}: ${created.name}`)
    } catch (error) {
        console.error('Event seed failed:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main().catch(() => process.exit(1))
