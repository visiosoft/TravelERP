#!/usr/bin/env node

/**
 * Initial Setup Script for Travel Agency ERP
 * Run this after cloning the repository
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Travel Agency ERP - Initial Setup\n');

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
    console.error('❌ Error: Node.js 18 or higher is required');
    console.error(`   Current version: ${nodeVersion}`);
    process.exit(1);
}

console.log('✅ Node.js version check passed\n');

// Function to run command
function runCommand(command, cwd = process.cwd()) {
    console.log(`📦 Running: ${command}`);
    try {
        execSync(command, { cwd, stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`❌ Failed to execute: ${command}`);
        return false;
    }
}

// Function to copy env file
function setupEnvFile(dir, filename = '.env.example') {
    const envExample = path.join(dir, filename);
    const envFile = path.join(dir, '.env');

    if (fs.existsSync(envFile)) {
        console.log(`⚠️  .env already exists in ${dir.split(path.sep).pop()}`);
        return true;
    }

    if (fs.existsSync(envExample)) {
        fs.copyFileSync(envExample, envFile);
        console.log(`✅ Created .env in ${dir.split(path.sep).pop()}`);
        return true;
    }

    console.error(`❌ ${filename} not found in ${dir}`);
    return false;
}

// Main setup process
async function setup() {
    const backendDir = path.join(__dirname, 'backend');
    const frontendDir = path.join(__dirname, 'frontend');

    // Step 1: Install backend dependencies
    console.log('\n📦 Step 1: Installing backend dependencies...\n');
    if (!runCommand('npm install', backendDir)) {
        console.error('❌ Backend installation failed');
        process.exit(1);
    }

    // Step 2: Install frontend dependencies
    console.log('\n📦 Step 2: Installing frontend dependencies...\n');
    if (!runCommand('npm install', frontendDir)) {
        console.error('❌ Frontend installation failed');
        process.exit(1);
    }

    // Step 3: Setup environment files
    console.log('\n⚙️  Step 3: Setting up environment files...\n');
    setupEnvFile(backendDir);
    setupEnvFile(frontendDir);

    // Step 4: Check MongoDB
    console.log('\n🔍 Step 4: Checking MongoDB connection...\n');
    console.log('⚠️  Make sure MongoDB is running on your system');
    console.log('   Local: mongodb://localhost:27017');
    console.log('   Or update MONGODB_URI in backend/.env with your connection string\n');

    // Success message
    console.log('\n✅ Setup completed successfully!\n');
    console.log('📝 Next Steps:\n');
    console.log('   1. Update backend/.env with your MongoDB URI (if needed)');
    console.log('   2. Seed initial data: cd backend && node seedData.js');
    console.log('   3. Start backend: cd backend && npm run dev');
    console.log('   4. Start frontend: cd frontend && npm run dev');
    console.log('   5. Login with: admin@travelagency.com / Admin@123\n');
    console.log('📖 For more details, see QUICKSTART.md\n');
    console.log('🎉 Happy coding!\n');
}

// Run setup
setup().catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
});
