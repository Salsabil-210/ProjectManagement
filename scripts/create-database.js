const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
    // Connect to default postgres database first
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres' // Connect to default database
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL server');

        // Check if database exists
        const checkResult = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [process.env.DB_NAME || 'task_management']
        );

        if (checkResult.rows.length === 0) {
            // Create database
            await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'task_management'}`);
            console.log(`Database '${process.env.DB_NAME || 'task_management'}' created successfully`);
        } else {
            console.log(`Database '${process.env.DB_NAME || 'task_management'}' already exists`);
        }

    } catch (error) {
        console.error('Error creating database:', error.message);
    } finally {
        await client.end();
    }
}

createDatabase(); 