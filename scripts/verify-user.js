/**
 * Verify User Script
 * 
 * Checks if a user exists in Clerk and shows their details.
 * 
 * Run with: node scripts/verify-user.js manager
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

async function verifyUser(username) {
  const env = loadEnv();
  const clerkSecretKey = env.CLERK_SECRET_KEY;

  if (!clerkSecretKey) {
    console.error('❌ Error: CLERK_SECRET_KEY not found in .env.local');
    process.exit(1);
  }

  if (!username) {
    console.error('❌ Error: Please provide a username');
    console.log('Usage: node scripts/verify-user.js <username>');
    process.exit(1);
  }

  console.log(`🔍 Checking for user: ${username}\n`);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: `/v1/users?username=${encodeURIComponent(username)}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          
          if (response.length > 0) {
            const user = response[0];
            console.log('✅ User found in Clerk!');
            console.log(`   User ID: ${user.id}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
            console.log(`   Public Metadata:`, JSON.stringify(user.public_metadata, null, 2));
            
            if (user.public_metadata?.role) {
              console.log(`\n   ✅ Role: ${user.public_metadata.role}`);
            } else {
              console.log(`\n   ⚠️  Warning: No role in public metadata!`);
              console.log(`   Add this to Clerk Dashboard → User → Metadata → Public metadata:`);
              console.log(`   { "role": "manager" }`);
            }
            
            resolve(user);
          } else {
            console.log('❌ User not found in Clerk');
            console.log('\nTo create the user, run:');
            console.log('   npm run create-manager\n');
            reject(new Error('User not found'));
          }
        } else {
          const error = JSON.parse(data);
          console.error('❌ Error:', error);
          reject(new Error(error.message || 'Unknown error'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Get username from command line
const username = process.argv[2] || 'manager';

verifyUser(username)
  .then(() => {
    console.log('\n✨ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  });

