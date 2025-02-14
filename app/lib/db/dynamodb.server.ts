import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isProduction = process.env.NODE_ENV === 'production';

// Configure DynamoDB client
const client = new DynamoDBClient({
  region: 'local',
  endpoint: isProduction ? undefined : 'http://localhost:8000',
  credentials: isProduction
    ? undefined
    : {
        accessKeyId: 'local',
        secretAccessKey: 'local',
      },
});

export const dynamoDb = DynamoDBDocumentClient.from(client);

// Table names
export const TABLES = {
  USERS: 'Users',
} as const;

// Initialize tables for local development
export async function initializeLocalTables() {
  if (isProduction) {
    return;
  }

  const { CreateTableCommand: createTableCommand } = await import('@aws-sdk/client-dynamodb');

  try {
    await client.send(
      new createTableCommand({
        TableName: TABLES.USERS,
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
  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log('Users table already exists');
    } else {
      console.error('Error creating Users table:', error);
      throw error;
    }
  }
}
