/**
 * Create Default Manager Script
 * 
 * Creates a manager user with:
 * - Username: manager
 * - Password: manager
 * 
 * Run with: node scripts/create-default-manager.js
 */

const https = require('https');
const { readFileSync } = require('fs');
const { join } = require('path');

// Load environment variables
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return env;
  } catch (error) {
    console.error('Error loading .env.local:', error.message);
    return {};
  }
}

async function createManager() {
  const env = loadEnv();
  const clerkSecretKey = env.CLERK_SECRET_KEY;

  if (!clerkSecretKey) {
    console.error('❌ Error: CLERK_SECRET_KEY not found in .env.local');
    console.log('\nPlease add CLERK_SECRET_KEY to your .env.local file:');
    console.log('CLERK_SECRET_KEY=sk_test_...\n');
    process.exit(1);
  }

  console.log('🚀 Creating Default Manager Account...\n');
  console.log('Username: manager');
  console.log('Password: Manager@2024!\n');

  const userData = {
    username: 'manager',
    password: 'Manager@2024!',
    public_metadata: {
      role: 'manager',
    },
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(userData);

    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: '/v1/users',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const user = JSON.parse(data);
          console.log('✅ User created in Clerk!');
          console.log(`   Clerk User ID: ${user.id}`);
          console.log(`   Username: ${user.username}`);
          console.log(`   Role: manager (in public metadata)\n`);

          console.log('📝 Next Step: Create User in Convex\n');
          console.log('1. Go to Convex Dashboard → Data → users table');
          console.log('2. Click "Add Document"');
          console.log('3. Paste this JSON:\n');
          
          const convexUser = {
            clerkUserId: user.id,
            username: 'manager',
            fullName: 'System Manager',
            phoneNumber: '+1234567890',
            address: 'Admin Office',
            role: 'manager',
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          console.log(JSON.stringify(convexUser, null, 2));
          console.log('\n✅ Setup complete!');
          console.log('\nYou can now login with:');
          console.log('   Username: manager');
          console.log('   Password: Manager@2024!\n');
          
          resolve(user);
        } else {
          const error = JSON.parse(data);
          console.error('❌ Error creating user:', error);
          if (error.errors && error.errors.length > 0) {
            error.errors.forEach(err => {
              console.error(`   - ${err.message}`);
            });
          }
          reject(new Error(`HTTP ${res.statusCode}: ${error.message || 'Unknown error'}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run the script
createManager()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to create manager:', error.message);
    process.exit(1);
  });

