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
    // Railway typically provides DATABASE_URL plus MYSQL* vars.
    // Prefer explicit DB_* overrides, then fall back to Railway's vars, then DATABASE_URL parsing.
    const parsedUrl =
        parseDatabaseUrl(process.env.DATABASE_URL) ||
        parseDatabaseUrl(process.env.MYSQL_URL) ||
        parseDatabaseUrl(process.env.MARIADB_URL);

    const dbHost =
        process.env.DB_HOST ||
        process.env.MYSQLHOST ||
        process.env.MARIADBHOST ||
        parsedUrl?.host ||
        'localhost';

    const dbPort = parseInt(
        process.env.DB_PORT ||
        process.env.MYSQLPORT ||
        process.env.MARIADBPORT ||
        String(parsedUrl?.port || '3306'),
        10
    );

    const dbUser =
        process.env.DB_USER ||
        process.env.MYSQLUSER ||
        process.env.MARIADBUSER ||
        parsedUrl?.user ||
        'root';

    const dbPassword =
        process.env.DB_PASSWORD ||
        process.env.MYSQLPASSWORD ||
        process.env.MARIADBPASSWORD ||
        parsedUrl?.password ||
        '';

    const dbName =
        process.env.DB_NAME ||
        process.env.MYSQLDATABASE ||
        process.env.MARIADBDATABASE ||
        parsedUrl?.database ||
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
    // global prisma instance. If a new model delegate is missing (like `event`),
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

