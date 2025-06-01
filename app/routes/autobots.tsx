import { type LoaderFunction, useRouteError } from 'react-router';
import { Combatants } from '~/components/combatants';
import type { TTransformer } from '~/types/transformer.type';

const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5173';
const fallbackData: TTransformer[] = [
  {
    id: 'fallback_001',
    name: 'Fallback Autobot',
    faction: 'Autobot',
    icon: '',
    health: 100,
    wins: 0,
    losses: 0,
    abilities: [],
  },
];

export const loader: LoaderFunction = async () => {
  console.log('Autobots loader started');
  try {
    const autobotsUrl = `${baseUrl}/data/autobots.json`;
    console.log('Fetching:', autobotsUrl);
    const response = await fetch(autobotsUrl);
    console.log('Fetch response:', response.status, response.statusText);

    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      throw new Error(`HTTP ${response.status}: Failed to fetch autobots.json`);
    }

    const autobotsData = await response.json();
    console.log('Fetched autobots.json:', autobotsData);

    if (!Array.isArray(autobotsData)) {
      console.error('Invalid autobots.json: not an array', autobotsData);
      throw new Error('autobots.json must be an array');
    }

    console.log('Autobots data length:', autobotsData.length);
    if (autobotsData.length === 0) {
      console.warn('Autobots data is empty');
    }

    return autobotsData as TTransformer[];
  } catch (error) {
    console.error('Loader error:', error);
    console.warn('Using fallback data');
    return fallbackData;
  }
};

export default function AutobotsRoute() {
  return <Combatants faction="Autobot" />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error('ErrorBoundary caught:', error);
  return <div>Error loading Autobots: {(error as Error).message}</div>;
}