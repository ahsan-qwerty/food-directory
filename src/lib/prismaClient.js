import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../app/generated/prisma/client';

function parseDatabaseUrl(connectionString) {
    try {
        if (!connectionString) return null;
        const u = new URL(connectionString);
        const database = (u.pathname || '').replace(/^\//, '') || '';
        return {
            host: u.hostname || 'localhost',
            port: u.port ? parseInt(u.port, 10) : 3306,
            user: decodeURIComponent(u.username || ''),
            password: decodeURIComponent(u.password || ''),
            database,
        };
    } catch {
        return null;
    }
}

function createPrismaClient() {
    // Railway provides MYSQL* variables when MySQL service is linked
    // Prefer explicit DB_* overrides, then Railway's MYSQL* vars, then defaults
    const dbHost =
        process.env.DB_HOST ||
        process.env.MYSQLHOST ||
        'yamabiko.proxy.rlwy.net';
    const dbPort = parseInt(
        process.env.DB_PORT ||
        process.env.MYSQLPORT ||
        '38666',
        10
    );
    const dbUser =
        process.env.DB_USER ||
        process.env.MYSQLUSER ||
        'root';
    const dbPassword =
        process.env.DB_PASSWORD ||
        process.env.MYSQLPASSWORD ||
        'SkWqshPLZhadSaMFlOjZLKlFBRqSneCC';
    const dbName =
        process.env.DB_NAME ||
        process.env.MYSQLDATABASE ||
        'railway';
    const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || '5', 10);

    const adapter = new PrismaMariaDb({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        connectionLimit,
        // Railway MySQL requires SSL for external connections
        ssl: {
            rejectUnauthorized: false, // Railway uses self-signed certificates
        },
        // Increase connection timeout for external connections
        connectTimeout: 30000, // 30 seconds
        socketTimeout: 30000, // 30 seconds
    });

    return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis;

function isStalePrismaClient(client) {
    // When the Prisma schema changes during `next dev`, Next can keep the old
    // global prisma instance. If a new model delegate is missing (like `event`,
    // `delegation`, or `seminar`), we recreate the client.
    return (
        !client ||
        !client.event ||
        typeof client.event.findMany !== 'function' ||
        !client.delegation ||
        typeof client.delegation.findMany !== 'function' ||
        !client.seminar ||
        typeof client.seminar.findMany !== 'function'
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

