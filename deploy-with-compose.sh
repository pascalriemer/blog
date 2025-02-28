#!/bin/bash
set -e

echo "🚀 Deploying blog with Docker Compose on AMD64 Linux server..."

# Make sure we have Docker Compose installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found! Please install it first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️ No .env file found. Creating one from .env.docker..."
    if [ -f ".env.docker" ]; then
        cp .env.docker .env
        echo "📝 Created .env file from .env.docker."
        echo "🔑 Please edit the .env file with your SMTP settings and custom admin credentials:"
        echo "    nano .env"
        echo ""
        echo "👤 Default admin credentials:"
        echo "    Username: admin"
        echo "    Password: changeme"
        echo "    Important: Change this password after first login!"
        echo ""
        echo "⚠️ IMPORTANT: Make sure to set ADMIN_EMAIL to your email address for password resets."
        echo ""
        echo "Then run this script again."
        exit 1
    else
        echo "❌ Error: .env.docker template file not found."
        echo "Please create an .env file with your SMTP settings manually."
        exit 1
    fi
fi

# Check for empty required variables
source .env
REQUIRED_VARS=("SMTP_HOST" "SMTP_PORT" "SMTP_USER" "SMTP_PASSWORD" "SMTP_FROM" "ADMIN_USERNAME" "ADMIN_PASSWORD_HASH" "ADMIN_PASSWORD_SALT" "JWT_SECRET" "ADMIN_EMAIL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Error: The following required environment variables are missing or empty:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo "Please edit your .env file to include these variables:"
    echo "nano .env"
    exit 1
fi

echo "✅ Environment variables verified."

# Check if the image exists, if not try to load it
if ! docker images | grep -q "blog-app" | grep -q "amd64-smtp"; then
    echo "🔍 Image blog-app:amd64-smtp not found locally."
    
    # Look for the tar file and load it if it exists
    if [ -f "blog-app-amd64-smtp.tar" ]; then
        echo "📦 Loading image from blog-app-amd64-smtp.tar..."
        docker load -i blog-app-amd64-smtp.tar
    else
        echo "❌ Image file blog-app-amd64-smtp.tar not found!"
        echo "Please transfer it to this directory first."
        exit 1
    fi
fi

# Ensure content directory exists
mkdir -p content

echo "🛑 Stopping any existing containers..."
docker-compose -f docker-compose.amd64.yml down || true

echo "🚀 Starting blog with Docker Compose..."
docker-compose -f docker-compose.amd64.yml up -d

echo "✅ Deployment completed!"
echo "Your blog should now be accessible at http://$(hostname -I | awk '{print $1}'):3000"
echo "The admin post editor is available at http://$(hostname -I | awk '{print $1}'):3000/admin/login"
echo "The contact form will send emails to pascal@riemer.digital using your SMTP settings."
echo "Password resets will be sent to $ADMIN_EMAIL"

# Show admin credentials info if using defaults
if [ "$ADMIN_USERNAME" = "admin" ] && [ "$ADMIN_PASSWORD_HASH" = "c73af9b33462f0ec13447ac89c70f9b72cb34ea95459d8979e19da83d188e8024db4d9d13a40c583a6489eb16af7cb57a66e0e73d51be31098b2459a33add77d" ]; then
    echo ""
    echo "⚠️ You are using the default admin credentials:"
    echo "   Username: admin"
    echo "   Password: changeme"
    echo ""
    echo "🔒 IMPORTANT: For security, change your password immediately after logging in,"
    echo "   and update your .env file with the new password hash shown in the UI."
fi 