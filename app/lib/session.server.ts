import { createCookieSessionStorage } from '@remix-run/cloudflare';

const sessionSecret = process.env.SESSION_SECRET || 'default-secret-key';

const storage = createCookieSessionStorage({
  cookie: {
    name: 'bolt_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
  },
});

export async function getSession(cookieHeader: string | null) {
  return storage.getSession(cookieHeader);
}

export async function commitSession(session: any) {
  return storage.commitSession(session);
}

export async function destroySession(session: any) {
  return storage.destroySession(session);
}
