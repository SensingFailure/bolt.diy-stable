import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

const isLocal = process.env.NODE_ENV !== 'production';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || (isLocal ? 'local' : 'us-east-1'),
  ...(isLocal && {
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local',
    },
  }),
  ...(!isLocal && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

async function waitForDynamoDB() {
  for (let i = 0; i < 10; i++) {
    try {
      await client.send(
        new CreateTableCommand({
          TableName: '_test',
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        }),
      );
      console.log('DynamoDB is ready');

      return true;
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log('DynamoDB is ready');
        return true;
      }

      console.log('Waiting for DynamoDB to be ready...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error('DynamoDB failed to start');
}

async function initializeLocalTables() {
  try {
    await waitForDynamoDB();

    // Create Users table
    await client.send(
      new CreateTableCommand({
        TableName: 'provisionary_Users',
        AttributeDefinitions: [
          {
            AttributeName: 'email',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'email',
            KeyType: 'HASH',
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      }),
    );
    console.log('Created Users table');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('Users table already exists');
    } else {
      console.error('Error creating Users table:', error);
      throw error;
    }
  }
}

initializeLocalTables().catch((error) => {
  console.error('Failed to initialize DynamoDB tables:', error);
  process.exit(1);
});
