import { json, redirect } from '@remix-run/cloudflare';
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { useActionData } from '@remix-run/react';
import { useState } from 'react';
import { createUser, createUserSession, getUserFromSession, verifyLogin } from '~/lib/db/user.server';
import { getSession, commitSession } from '~/lib/session.server';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));
  const token = session.get('token');

  if (token) {
    const user = await getUserFromSession(token);

    if (user) {
      return redirect('/');
    }
  }

  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const isSignUp = formData.get('isSignUp') === 'true';
  const name = formData.get('name') as string;

  try {
    let user;

    if (isSignUp) {
      if (!name) {
        return json({ error: 'Name is required' }, { status: 400 });
      }

      console.log('Creating new user:', { email, name });
      user = await createUser(email, password, name);
      console.log('User created successfully');
    } else {
      console.log('Verifying login:', { email });
      user = await verifyLogin(email, password);

      if (!user) {
        return json({ error: 'Invalid email or password' }, { status: 401 });
      }

      console.log('Login verified successfully');
    }

    console.log('Creating user session');

    const token = await createUserSession(user);
    const session = await getSession(request.headers.get('Cookie'));
    session.set('token', token);

    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (error: any) {
    console.error('Authentication error:', error);

    if (error.name === 'ConditionalCheckFailedException') {
      return json({ error: 'Email already exists' }, { status: 400 });
    }

    return json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
};

export default function LoginRoute() {
  const actionData = useActionData<{ error?: string }>();
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex min-h-screen bg-bolt-background relative overflow-hidden">
      <BackgroundRays className="absolute inset-0 z-0" />
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-bolt-text">Welcome to ProVisionary AI</h1>
            <p className="mt-2 text-sm text-bolt-text-subtle">
              {isSignUp ? 'Create your account' : 'Please sign in to continue'}
            </p>
          </div>

          <form method="post" className="mt-8 space-y-6">
            <input type="hidden" name="isSignUp" value={isSignUp.toString()} />
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-bolt-text">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-bolt-background-subtle border border-bolt-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolt-active focus:border-bolt-active text-bolt-text"
                />
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-bolt-text">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-bolt-background-subtle border border-bolt-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolt-active focus:border-bolt-active text-bolt-text"
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-bolt-text">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-bolt-background-subtle border border-bolt-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolt-active focus:border-bolt-active text-bolt-text"
                />
              </div>
            </div>

            {actionData?.error && <div className="text-bolt-error text-sm">{actionData.error}</div>}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSignUp ? 'Sign up' : 'Sign in'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-blue-600 hover:text-blue-500 bg-transparent"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
