import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import React, { Suspense, lazy } from 'react';
import type { Route } from './+types/root';
import './app.css';

// const ScrollRestoration = lazy(() =>
//   import('react-router').then(module => ({
//     default: module.ScrollRestoration,
//   }))
// );
// const Scripts = lazy(() =>
//   import('react-router').then(module => ({
//     default: module.Scripts,
//   }))
// );

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {/* <Links /> */}
          <link
            href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
      </head>
      <body>
        {children}
        {/* {typeof window !== 'undefined' && (
          <Suspense fallback={null}> */}
            <ScrollRestoration />
            <Scripts />
          {/* </Suspense>
        )} */}
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isRouteError = (err: any): err is { status: number; statusText: string } =>
    err && typeof err.status === 'number' && typeof err.statusText === 'string';

  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteError(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}