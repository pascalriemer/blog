#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function hashPassword(password, salt) {
  // Create a SHA-256 hash of the password with the salt
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
}

async function setupAdmin() {
  console.log('🔐 Setting up admin credentials for the blog post editor...\n');

  const username = await new Promise((resolve) => {
    rl.question('Enter admin username (default: admin): ', (input) => {
      resolve(input.trim() || 'admin');
    });
  });

  const password = await new Promise((resolve) => {
    rl.question('Enter admin password: ', (input) => {
      if (!input.trim()) {
        console.log('❌ Password cannot be empty!');
        process.exit(1);
      }
      resolve(input.trim());
    });
  });

  console.log('\nGenerating secure credentials...');
  
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash the password with the salt
  const passwordHash = hashPassword(password, salt);
  
  // Generate a secure JWT secret
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  
  // Create environment variables to add to .env file
  const envAdditions = `
# Admin authentication - generated on ${new Date().toISOString()}
ADMIN_USERNAME=${username}
ADMIN_PASSWORD_HASH=${passwordHash}
ADMIN_PASSWORD_SALT=${salt}
JWT_SECRET=${jwtSecret}
`;

  // Ensure scripts directory exists
  const scriptsDir = path.dirname(__filename);
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  // Also save to a separate file for reference
  fs.writeFileSync(path.join(scriptsDir, 'admin-credentials.txt'), envAdditions, 'utf8');
  
  console.log('\n✅ Admin credentials generated successfully!');
  console.log('\n📋 Add these lines to your .env file:');
  console.log(envAdditions);
  console.log('The credentials have also been saved to scripts/admin-credentials.txt for your reference.');
  console.log('\n⚠️ Important: Keep these credentials secure and do not share them!');
  
  rl.close();
}

setupAdmin().catch(err => {
  console.error('❌ Error setting up admin credentials:', err);
  process.exit(1);
}); 