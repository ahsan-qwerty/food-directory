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

export const prisma = globalForPrisma.__tdapPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__tdapPrisma = prisma;
}

