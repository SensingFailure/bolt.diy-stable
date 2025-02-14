import { redirect } from '@remix-run/cloudflare';
import { getSession } from './session.server';
import { getUserFromSession } from './db/user.server';
import type { User } from './db/user.server';

export async function requireUser(request: Request): Promise<User> {
  const session = await getSession(request.headers.get('Cookie'));
  const token = session.get('token');

  if (!token) {
    throw redirect('/login');
  }

  const user = await getUserFromSession(token);

  if (!user) {
    throw redirect('/login');
  }

  return user;
}

export async function getAuthUser(request: Request): Promise<User | null> {
  const session = await getSession(request.headers.get('Cookie'));
  const token = session.get('token');

  if (!token) {
    return null;
  }

  return getUserFromSession(token);
}
