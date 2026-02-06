import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../app/generated/prisma/client';

function createPrismaClient() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'food-directory';
    const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || '5', 10);

    const adapter = new PrismaMariaDb({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        connectionLimit,
    });

    return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis;

function isStalePrismaClient(client) {
    // When the Prisma schema changes during `next dev`, Next can keep the old
    // global prisma instance. If a new model delegate is missing (like `event`),
    // we recreate the client.
    return !client || !client.event || typeof client.event.findMany !== 'function';
}

let prisma = globalForPrisma.__tdapPrisma;

if (isStalePrismaClient(prisma)) {
    prisma = createPrismaClient();
}

export { prisma };

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__tdapPrisma = prisma;
}

