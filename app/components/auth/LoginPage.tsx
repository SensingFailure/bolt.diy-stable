import { Form, useActionData, useNavigation } from '@remix-run/react';
import { useState } from 'react';
import BackgroundRays from '~/components/ui/BackgroundRays';

export function LoginPage() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const [isSignUp, setIsSignUp] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{isSignUp ? 'Create Account' : 'Sign In'}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-500 hover:text-blue-600"
              >
                {isSignUp ? 'Sign in' : 'Create one'}
              </button>
            </p>
          </div>

          <Form method="post" className="mt-8 space-y-6">
            <input type="hidden" name="isSignUp" value={isSignUp.toString()} />

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {actionData?.error && <div className="text-red-500 text-sm">{actionData.error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
