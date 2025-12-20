#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 * 
 * This script helps you set up all environment variables on Vercel
 * Run: node scripts/setup-vercel-env.js
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper to ask questions
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Helper to ask secret questions (hidden input)
function secretQuestion(query) {
  return new Promise(resolve => {
    process.stdout.write(query);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let input = '';
    process.stdin.on('data', (char) => {
      char = char.toString();
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(input);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f':
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          input += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

// Check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Check if logged in to Vercel
function checkVercelLogin() {
  try {
    execSync('vercel whoami', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Add environment variable to Vercel
function addEnvVar(key, value, environments = ['production', 'preview']) {
  try {
    for (const env of environments) {
      execSync(`echo "${value}" | vercel env add ${key} ${env}`, {
        stdio: 'pipe',
        input: value + '\n',
      });
    }
    return true;
  } catch (error) {
    console.error(`❌ Failed to add ${key}:`, error.message);
    return false;
  }
}

// Environment variables to configure
const envVars = [
  {
    key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    description: 'Clerk Publishable Key (pk_live_...)',
    secret: false,
    required: true,
  },
  {
    key: 'CLERK_SECRET_KEY',
    description: 'Clerk Secret Key (sk_live_...)',
    secret: true,
    required: true,
  },
  {
    key: 'NEXT_PUBLIC_CONVEX_URL',
    description: 'Convex URL (https://your-project.convex.cloud)',
    secret: false,
    required: true,
  },
  {
    key: 'R2_ACCOUNT_ID',
    description: 'Cloudflare R2 Account ID',
    secret: false,
    required: false,
  },
  {
    key: 'R2_ACCESS_KEY_ID',
    description: 'R2 Access Key ID',
    secret: false,
    required: false,
  },
  {
    key: 'R2_SECRET_ACCESS_KEY',
    description: 'R2 Secret Access Key',
    secret: true,
    required: false,
  },
  {
    key: 'R2_BUCKET_NAME',
    description: 'R2 Bucket Name',
    secret: false,
    required: false,
  },
  {
    key: 'R2_ENDPOINT',
    description: 'R2 Endpoint URL (optional)',
    secret: false,
    required: false,
  },
  {
    key: 'R2_PUBLIC_URL',
    description: 'R2 Public URL for images',
    secret: false,
    required: false,
  },
];

async function main() {
  console.log('🚀 Vercel Environment Variables Setup');
  console.log('=====================================\n');

  // Check Vercel CLI
  if (!checkVercelCLI()) {
    console.log('📦 Installing Vercel CLI...');
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to install Vercel CLI. Please install manually: npm install -g vercel');
      process.exit(1);
    }
  }

  // Check login
  if (!checkVercelLogin()) {
    console.log('🔐 Please login to Vercel...');
    try {
      execSync('vercel login', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to login to Vercel');
      process.exit(1);
    }
  }

  console.log('✅ Vercel CLI ready\n');

  // Check if .env.local exists and offer to use it
  const envLocalPath = path.join(process.cwd(), '.env.local');
  let useEnvLocal = false;
  
  if (fs.existsSync(envLocalPath)) {
    const answer = await question('📄 Found .env.local file. Use values from it? (y/n): ');
    useEnvLocal = answer.toLowerCase() === 'y';
  }

  let envValues = {};
  if (useEnvLocal) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envValues[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    console.log('✅ Loaded values from .env.local\n');
  }

  console.log('📋 Setting up environment variables...\n');

  const results = [];

  for (const envVar of envVars) {
    let value = envValues[envVar.key];

    if (!value) {
      if (envVar.secret) {
        value = await secretQuestion(`Enter ${envVar.description}: `);
      } else {
        value = await question(`Enter ${envVar.description}: `);
      }
    } else {
      console.log(`Using value from .env.local for ${envVar.key}`);
    }

    if (!value && envVar.required) {
      console.log(`⚠️  Warning: ${envVar.key} is required but empty. Skipping...\n`);
      continue;
    }

    if (value) {
      console.log(`Adding ${envVar.key} to Vercel...`);
      const success = addEnvVar(envVar.key, value);
      if (success) {
        console.log(`✅ Added ${envVar.key}\n`);
        results.push({ key: envVar.key, success: true });
      } else {
        results.push({ key: envVar.key, success: false });
      }
    } else {
      console.log(`⏭️  Skipping ${envVar.key} (empty value)\n`);
    }
  }

  rl.close();

  console.log('\n📊 Summary:');
  console.log('===========');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.key}`);
  });

  console.log('\n🎉 Setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Verify variables in Vercel Dashboard → Settings → Environment Variables');
  console.log('2. Deploy: vercel --prod');
  console.log('3. Or push to main branch to trigger automatic deployment\n');
}

main().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});

