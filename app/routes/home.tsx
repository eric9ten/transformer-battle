import type { Route } from './+types/home';
import { Welcome } from '../welcome/welcome';
import type { LoaderFunction } from 'react-router';
import type { TTransformer } from '~/types/transformer.type';
import { useEffect } from 'react';

const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5173';
  const fallbackAutobots: TTransformer[] = [
    {
      id: 'autobot_001',
      name: 'Optimus Prime',
      faction: 'Autobot',
      icon: '',
      health: 1000,
      wins: 0,
      losses: 0,
      abilities: [],
    },
  ];

  const fallbackDecepticons: TTransformer[] = [
    {
      id: 'decepticon_001',
      name: 'Megatron',
      faction: 'Decepticon',
      icon: '',
      health: 1000,
      wins: 0,
      losses: 0,
      abilities: [],
    },
  ];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Transformer Battle' },
    { name: 'description', content: 'Welcome to Transformer Battle!' },
  ];
}

export const loader: LoaderFunction = async () => {
  let autobots: TTransformer[] = [];
  let decepticons: TTransformer[] = [];

  try {
    const autobotsUrl = `${baseUrl}/data/autobots.json`;
    console.log('Fetching:', autobotsUrl);
    const autobotsResponse = await fetch(autobotsUrl);
    console.log('Autobots fetch response:', autobotsResponse.status, autobotsResponse.statusText);
    if (!autobotsResponse.ok) {
      console.error('Autobots fetch failed:', autobotsResponse.status, autobotsResponse.statusText);
      throw new Error(`Failed to fetch autobots.json: ${autobotsResponse.status}`);
    }
    autobots = await autobotsResponse.json();

    if (!Array.isArray(autobots)) {
      console.error('Invalid autobots.json: not an array');
      throw new Error('autobots.json must be an array');
    }
  } catch (error) {
    console.error('Autobots loader error:', error);
    autobots = fallbackAutobots;
    console.warn('Using fallback autobots:', autobots);
  }

  try {
    const decepticonsUrl = `${baseUrl}/data/decepticons.json`;
    console.log('Fetching:', decepticonsUrl);
    const decepticonsResponse = await fetch(decepticonsUrl);
    console.log('Decepticons fetch response:', decepticonsResponse.status, decepticonsResponse.statusText);
    if (!decepticonsResponse.ok) {
      console.error('Decepticons fetch failed:', decepticonsResponse.status, decepticonsResponse.statusText);
      throw new Error(`Failed to fetch decepticons.json: ${decepticonsResponse.status}`);
    }
    decepticons = await decepticonsResponse.json();
    console.log('Fetched decepticons:', decepticons, 'Length:', decepticons.length);

    if (!Array.isArray(decepticons)) {
      console.error('Invalid decepticons.json: not an array');
      throw new Error('decepticons.json must be an array');
    }
  } catch (error) {
    console.error('Decepticons loader error:', error);
    decepticons = fallbackDecepticons;
    console.warn('Using fallback decepticons:', decepticons);
  }

  const data = { autobots, decepticons };
  return data;
};

export default function Home() {  
  return <Welcome />;
}
