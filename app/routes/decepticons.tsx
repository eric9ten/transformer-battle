import { type LoaderFunction, useRouteError } from 'react-router';
import { Combatants } from '~/components/combatants';
import type { TTransformer } from '~/types/transformer.type';

const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5173';
const fallbackData: TTransformer[] = [
  {
    id: 'fallback_001',
    name: 'Fallback Decepticon',
    faction: 'Decepticon',
    icon: '',
    health: 100,
    wins: 0,
    losses: 0,
    abilities: [],
  },
];

export const loader: LoaderFunction = async () => {
  try {
    const decepticonsUrl = `${baseUrl}/data/decepticons.json`;
    const response = await fetch(decepticonsUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch decepticons.json`);
    }
    const decepticonsData = await response.json();
    if (!Array.isArray(decepticonsData)) {
      throw new Error('decepticons.json must be an array');
    }
    return decepticonsData as TTransformer[];
  } catch (error) {
    console.error('Loader error:', error);
    return fallbackData;
  }
};

export default function DecepticonsRoute() {
  return <Combatants faction="Decepticon" onCombatantSelect={function (combatant: TTransformer): void {
      throw new Error('Function not implemented.');
  } } />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <div>Error loading Decepticons: {(error as Error).message}</div>;
}