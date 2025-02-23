import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export interface User {
  email: string;
  name: string;
  password: string;
}

const client = new DynamoDBClient(
  process.env.NODE_ENV === 'production'
    ? {
        region: process.env.AWS_REGION || 'us-east-1',
      }
    : {
        region: 'local',
        endpoint: 'http://localhost:8000',
        credentials: {
          accessKeyId: 'local',
          secretAccessKey: 'local',
        },
      },
);

const docClient = DynamoDBDocument.from(client);

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user: User = {
    email,
    name,
    password: hashedPassword,
  };

  await docClient.put({
    TableName: 'provisionary_Users',
    Item: user,
    ConditionExpression: 'attribute_not_exists(email)',
  });

  return user;
}

export async function verifyLogin(email: string, password: string): Promise<User | null> {
  const result = await docClient.get({
    TableName: 'provisionary_Users',
    Key: { email },
  });

  const user = result.Item as User | undefined;

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return null;
  }

  return user;
}

export async function createUserSession(user: User): Promise<string> {
  const token = await new jose.SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

export async function getUserFromSession(token: string): Promise<User | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const result = await docClient.get({
      TableName: 'provisionary_Users',
      Key: { email: payload.email as string },
    });

    return (result.Item as User) || null;
  } catch {
    return null;
  }
}
