const https = require('https');
const { readFileSync } = require('fs');
const { join } = require('path');

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

async function getClerkUserId(username) {
  const env = loadEnv();
  const clerkSecretKey = env.CLERK_SECRET_KEY;

  if (!clerkSecretKey) {
    console.error('❌ Error: CLERK_SECRET_KEY not found in .env.local');
    process.exit(1);
  }

  console.log(`🔍 Getting Clerk User ID for: ${username}\n`);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: `/v1/users?username=${encodeURIComponent(username)}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const users = JSON.parse(data);
          if (users.length > 0) {
            const user = users[0];
            console.log('✅ User found in Clerk!');
            console.log(`   User ID: ${user.id}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Created: ${new Date(user.created_at).toLocaleString()}\n`);

            console.log('📋 Copy this JSON and add to Convex Database:\n');
            console.log('Go to: https://dashboard.convex.dev → Data → users table → Add Document\n');
            
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
            console.log('\n✅ After adding this, refresh your app and login again!\n');

            resolve(user);
          } else {
            console.log('❌ User not found in Clerk\n');
            reject(new Error('User not found'));
          }
        } else {
          console.error(`❌ Error: HTTP ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}`));
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

const username = process.argv[2] || 'manager';

getClerkUserId(username)
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });


