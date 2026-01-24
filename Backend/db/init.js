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



        console.log('🎉 Database initialization complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
};

initDatabase();
