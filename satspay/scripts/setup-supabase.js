#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Supabase local development environment...\n');

// Check if Docker is running
try {
  execSync('docker --version', { stdio: 'ignore' });
  console.log('✅ Docker is available');
} catch (error) {
  console.error('❌ Docker is not available. Please install Docker first.');
  process.exit(1);
}

// Check if docker-compose.yml exists
const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
if (!fs.existsSync(dockerComposePath)) {
  console.error('❌ docker-compose.yml not found');
  process.exit(1);
}

console.log('✅ Docker Compose configuration found');

// Start Supabase services
console.log('\n📦 Starting Supabase services...');
try {
  execSync('docker-compose up -d', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('✅ Supabase services started successfully');
} catch (error) {
  console.error('❌ Failed to start Supabase services');
  console.error(error.message);
  process.exit(1);
}

// Wait for services to be ready
console.log('\n⏳ Waiting for services to be ready...');
setTimeout(() => {
  console.log('\n🎉 Supabase local development environment is ready!');
  console.log('\n📋 Service URLs:');
  console.log('   • API Gateway: http://127.0.0.1:54321');
  console.log('   • Database: postgresql://postgres:your-super-secret-and-long-postgres-password@127.0.0.1:54322/postgres');
  console.log('   • Studio: http://127.0.0.1:54323');
  console.log('   • Inbucket (Email): http://127.0.0.1:54324');
  console.log('\n🔑 API Keys:');
  console.log('   • Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
  console.log('   • Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');
  console.log('\n💡 To stop services: docker-compose down');
  console.log('💡 To view logs: docker-compose logs -f');
}, 10000);