import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import type { LinksFunction, LoaderFunction } from '@remix-run/cloudflare';
import { createHead } from 'remix-island';

// Styles
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './styles/index.scss?url';
import xtermStyles from '@xterm/xterm/css/xterm.css?url';
import 'virtual:uno.css';

// Components
import { AuthCheck } from './components/auth/AuthCheck.client';
import { AppInit } from './components/AppInit.client';

// Utils and stores
import { themeStore } from './lib/stores/theme';
import { stripIndents } from './utils/stripIndent';
import { getAuthUser } from './lib/auth.server';
import type { User } from './lib/db/user.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getAuthUser(request);
  return { user };
};

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: xtermStyles },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('bolt_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export const Head = createHead(() => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Meta />
    <Links />
    <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
  </>
));

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useStore(themeStore);

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      {children}
      <ScrollRestoration />
      <Scripts />
    </>
  );
}

export default function App() {
  const { user } = useLoaderData<{ user: User | null }>();

  return (
    <Layout>
      <ClientOnly fallback={null}>
        {() => (
          <>
            <AuthCheck isAuthenticated={!!user} />
            <AppInit />
          </>
        )}
      </ClientOnly>
      <Outlet />
    </Layout>
  );
}
