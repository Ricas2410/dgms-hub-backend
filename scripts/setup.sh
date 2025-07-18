#!/bin/bash

# DGMS Hub Setup Script
# This script sets up the development environment for DGMS Hub

set -e

echo "🚀 Setting up DGMS Hub Development Environment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}


# Check if running on supported OS
check_os() {
    print_status "Checking operating system..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_success "Linux detected"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_success "macOS detected"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
        print_success "Windows detected"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION is installed"
        
        # Check if version is 16 or higher
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
            print_error "Node.js version 16 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
}

# Check if PostgreSQL is installed
check_postgresql() {
    print_status "Checking PostgreSQL installation..."
    
    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version | awk '{print $3}')
        print_success "PostgreSQL $PG_VERSION is installed"
    else
        print_warning "PostgreSQL is not installed or not in PATH"
        print_status "Please install PostgreSQL 12 or higher"
        print_status "Visit: https://www.postgresql.org/download/"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw dgms_hub_dev; then
        print_warning "Database 'dgms_hub_dev' already exists"
        read -p "Do you want to recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            dropdb dgms_hub_dev 2>/dev/null || true
            print_status "Dropped existing database"
        else
            print_status "Skipping database creation"
            return
        fi
    fi
    
    # Create database
    createdb dgms_hub_dev
    print_success "Created database 'dgms_hub_dev'"
    
    # Run initialization script
    if [ -f "database/init.sql" ]; then
        psql dgms_hub_dev < database/init.sql
        print_success "Database initialized with schema and sample data"
    else
        print_warning "Database initialization script not found"
    fi
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    print_success "Backend dependencies installed"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating backend .env file..."
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please update the .env file with your configuration"
    else
        print_warning ".env file already exists"
    fi
    
    # Create uploads directory
    mkdir -p uploads
    print_success "Created uploads directory"
    
    cd ..
}

# Setup mobile app
setup_mobile() {
    print_status "Setting up mobile application..."
    
    cd mobile
    
    # Install dependencies
    print_status "Installing mobile app dependencies..."
    npm install
    print_success "Mobile app dependencies installed"
    
    # Check for React Native CLI
    if ! command -v react-native &> /dev/null; then
        print_warning "React Native CLI not found"
        print_status "Installing React Native CLI globally..."
        npm install -g @react-native-community/cli
        print_success "React Native CLI installed"
    fi
    
    cd ..
}

# Setup admin panel
setup_admin_panel() {
    print_status "Setting up admin panel..."
    
    cd admin-panel
    
    # Install dependencies
    print_status "Installing admin panel dependencies..."
    npm install
    print_success "Admin panel dependencies installed"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating admin panel .env file..."
        echo "REACT_APP_API_URL=http://localhost:3000/api" > .env
        print_success "Created .env file"
    else
        print_warning ".env file already exists"
    fi
    
    cd ..
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Create start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash

# Start DGMS Hub Development Environment

echo "Starting DGMS Hub Development Environment..."

# Function to cleanup on exit
cleanup() {
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start admin panel
echo "Starting admin panel..."
cd ../admin-panel && npm start &
ADMIN_PID=$!

echo ""
echo "🚀 DGMS Hub Development Environment Started!"
echo "============================================="
echo "Backend API: http://localhost:3000"
echo "Admin Panel: http://localhost:3001"
echo "Health Check: http://localhost:3000/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all background processes
wait
EOF

    chmod +x start-dev.sh
    print_success "Created start-dev.sh script"
    
    # Create build script
    cat > build.sh << 'EOF'
#!/bin/bash

# Build DGMS Hub for Production

echo "Building DGMS Hub for Production..."

# Build admin panel
echo "Building admin panel..."
cd admin-panel
npm run build
echo "Admin panel built successfully"

# Build mobile app (Android)
echo "Building mobile app for Android..."
cd ../mobile
npm run build:android
echo "Mobile app built successfully"

echo ""
echo "✅ Build completed successfully!"
echo "Admin panel build: admin-panel/build/"
echo "Mobile app APK: mobile/android/app/build/outputs/apk/release/"
EOF

    chmod +x build.sh
    print_success "Created build.sh script"
}

# Main setup function
main() {
    echo "Starting DGMS Hub setup..."
    echo ""
    
    # Check system requirements
    check_os
    check_node
    check_postgresql
    
    echo ""
    print_status "System requirements check completed"
    echo ""
    
    # Setup components
    setup_backend
    setup_mobile
    setup_admin_panel
    
    # Setup database (optional)
    echo ""
    read -p "Do you want to setup the database now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_database
    else
        print_warning "Skipping database setup"
        print_status "You can run 'psql dgms_hub_dev < database/init.sql' later"
    fi
    
    # Create development scripts
    create_dev_scripts
    
    echo ""
    print_success "🎉 DGMS Hub setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update backend/.env with your database credentials"
    echo "2. Run './start-dev.sh' to start the development environment"
    echo "3. Access the admin panel at http://localhost:3001"
    echo "4. Login with: admin@dgms.edu / admin123"
    echo "5. For mobile development, follow the React Native setup guide"
    echo ""
    echo "Documentation:"
    echo "- API Documentation: docs/api/README.md"
    echo "- Deployment Guide: docs/deployment/README.md"
    echo "- User Manual: docs/user-manual/admin-panel.md"
    echo ""
    print_warning "Remember to change the default admin password!"
}

# Run main function
main "$@"
