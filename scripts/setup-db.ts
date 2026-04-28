import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import bcryptjs from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

async function setupDatabase() {
  try {
    console.log('[v0] Connecting to database...');
    const client = await pool.connect();

    console.log('[v0] Creating tables...');
    
    // Read and execute the schema SQL
    const schemaPath = path.join(__dirname, 'init-db.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await client.query(schema);
    console.log('[v0] Database schema created successfully');

    // Seed demo users
    console.log('[v0] Seeding demo users...');
    
    const users = [
      {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        password: 'password123',
      },
      {
        email: 'manager@example.com',
        name: 'Manager User',
        role: 'manager',
        password: 'password123',
      },
      {
        email: 'driver@example.com',
        name: 'Driver User',
        role: 'driver',
        password: 'password123',
      },
    ];

    for (const user of users) {
      const passwordHash = await bcryptjs.hash(user.password, 10);
      await client.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [user.email, passwordHash, user.name, user.role]
      );
      console.log(`[v0] Created user: ${user.email}`);
    }

    console.log('[v0] Database setup completed successfully!');
    console.log('[v0] Demo users created:');
    console.log('[v0]   - admin@example.com / password123');
    console.log('[v0]   - manager@example.com / password123');
    console.log('[v0]   - driver@example.com / password123');

    client.release();
  } catch (error) {
    console.error('[v0] Database setup error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
