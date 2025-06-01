import React from 'react';
import { RouterProvider, createMemoryRouter, type RouteObject } from 'react-router';
import { render } from '@testing-library/react';

export function renderWithRouter(
  element: React.ReactNode,
  {
    route = '/',
    path = '/',
    routes = undefined,
    options = {},
  }: {
    route?: string;
    path?: string;
    routes?: RouteObject[];
    options?: Parameters<typeof render>[1];
  } = {}
) {
  const router = createMemoryRouter(
    routes || [
      {
        path,
        element,
      },
    ],
    {
      initialEntries: [route],
    }
  );

  return render(<RouterProvider router={router} />, options);
}
