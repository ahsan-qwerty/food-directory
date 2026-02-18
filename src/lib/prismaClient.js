import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../app/generated/prisma/client';

function createPrismaClient() {
    // Railway provides MYSQL* variables when MySQL service is linked
    // Prefer explicit DB_* overrides, then Railway's MYSQL* vars, then defaults
    const dbHost =
        process.env.DB_HOST ||
        process.env.MYSQLHOST ||
        'localhost';
    const dbPort = parseInt(
        process.env.DB_PORT ||
        process.env.MYSQLPORT ||
        '3306',
        10
    );
    const dbUser =
        process.env.DB_USER ||
        process.env.MYSQLUSER ||
        'root';
    const dbPassword =
        process.env.DB_PASSWORD ||
        process.env.MYSQLPASSWORD ||
        '';
    const dbName =
        process.env.DB_NAME ||
        process.env.MYSQLDATABASE ||
        'food-directory';
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
    // global prisma instance. If a new model delegate is missing (like `event` or `delegation`),
    // we recreate the client.
    return (
        !client ||
        !client.event ||
        typeof client.event.findMany !== 'function' ||
        !client.delegation ||
        typeof client.delegation.findMany !== 'function'
    );
}

let prisma = globalForPrisma.__tdapPrisma;

if (isStalePrismaClient(prisma)) {
    prisma = createPrismaClient();
}

export { prisma };

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__tdapPrisma = prisma;
}

