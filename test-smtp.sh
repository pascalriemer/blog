#!/bin/bash
set -e

echo "🔍 Testing SMTP configuration..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ No .env file found. Please create one first."
    exit 1
fi

# Load environment variables
source .env

echo "📧 Testing connection to SMTP server: $SMTP_HOST:$SMTP_PORT"
echo "👤 Using account: $SMTP_USER"

# Create temporary directory
mkdir -p tmp
cat > tmp/test-smtp.js << EOL
const nodemailer = require('nodemailer');

async function main() {
  // Create a test account if no credentials provided
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('Missing required SMTP environment variables');
    process.exit(1);
  }

  console.log('Creating transporter with provided credentials...');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  console.log('Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully ✅');
  } catch (error) {
    console.error('SMTP connection verification failed ❌');
    console.error(error);
    process.exit(1);
  }

  console.log('Sending test email...');
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: 'pascal@riemer.digital',
    subject: 'SMTP Test Email',
    text: 'This is a test email to verify SMTP settings',
    html: '<b>This is a test email to verify SMTP settings</b><p>If you received this, your SMTP configuration is working correctly!</p>'
  });

  console.log('Message sent successfully! ID:', info.messageId);
  console.log('✅ SMTP configuration test passed.');
}

main().catch(err => {
  console.error('Error occurred during test:', err);
  process.exit(1);
});
EOL

echo "🐳 Starting temporary container to test SMTP..."
docker run --rm -it \
  -v $(pwd)/tmp:/app \
  -w /app \
  -e SMTP_HOST="$SMTP_HOST" \
  -e SMTP_PORT="$SMTP_PORT" \
  -e SMTP_SECURE="$SMTP_SECURE" \
  -e SMTP_USER="$SMTP_USER" \
  -e SMTP_PASSWORD="$SMTP_PASSWORD" \
  -e SMTP_FROM="$SMTP_FROM" \
  node:18-alpine \
  sh -c "npm install nodemailer && node test-smtp.js"

rm -rf tmp
echo "�� Cleanup complete." 