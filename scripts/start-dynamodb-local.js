import { execSync } from 'child_process';

// Stop any existing containers
try {
  execSync('docker-compose down', { stdio: 'inherit' });
} catch (error) {
  console.error('Error stopping containers:', error);
}

// Start DynamoDB container
try {
  execSync('docker-compose up dynamodb-local', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting DynamoDB:', error);
  process.exit(1);
}
