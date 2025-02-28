import { hash } from 'bcrypt';
import { writeFileSync } from 'fs';
import { randomBytes } from 'crypto';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupAdmin() {
  return new Promise((resolve) => {
    rl.question('Enter admin username: ', (username) => {
      rl.question('Enter admin password: ', async (password) => {
        // Hash the password
        const passwordHash = await hash(password, 10);
        
        // Generate a secure JWT secret
        const jwtSecret = randomBytes(32).toString('hex');
        
        // Create a .env.local file with these values
        const envContent = `
# Admin authentication
ADMIN_USERNAME=${username}
ADMIN_PASSWORD_HASH=${passwordHash}
JWT_SECRET=${jwtSecret}
`;
        
        writeFileSync('.env.local', envContent.trim(), 'utf8');
        console.log('Admin credentials set up successfully!');
        rl.close();
        resolve(null);
      });
    });
  });
}

setupAdmin().catch(console.error); 