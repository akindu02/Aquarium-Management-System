/**
 * Database Initialization Script
 * Runs the schema and optionally seeds the database
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('../config/db');

const initDatabase = async () => {
    try {
        console.log('🚀 Starting database initialization...');

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📋 Creating tables...');
        await pool.query(schema);
        console.log('✅ Schema applied successfully');

        // Ask if we should seed the database
        const shouldSeed = process.argv.includes('--seed');

        if (shouldSeed) {
            const seedPath = path.join(__dirname, 'seed.sql');
            const seed = fs.readFileSync(seedPath, 'utf8');

            console.log('🌱 Seeding database...');
            await pool.query(seed);
            console.log('✅ Seed data inserted successfully');
        }

        console.log('🎉 Database initialization complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
};

initDatabase();
