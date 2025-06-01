import { Header } from '~/components/layout/header';
import { BattleLayout } from '~/components/layout/battle-layout';
import { useLoaderData } from 'react-router';
import type { TTransformer } from '~/types/transformer.type';
import { ResultsProvider } from '~/contexts/ResultsContext';
import { CombatantsProvider } from '~/contexts/CombatantsContext';
import { BrowserRouter } from 'react-router';

export interface WelcomeLoaderData {
  autobots: TTransformer[];
  decepticons: TTransformer[];
}

export function Welcome() {
  const data = useLoaderData() as WelcomeLoaderData;
  const autobots = data.autobots.map(combatant => ({
    ...combatant,
    wins: combatant.wins ?? 0,
    losses: combatant.losses ?? 0,
  }));
  const decepticons = data.decepticons.map(combatant => ({
    ...combatant,
    wins: combatant.wins ?? 0,
    losses: combatant.losses ?? 0,
  }));

  return (
    <BrowserRouter>
      <ResultsProvider>
        <CombatantsProvider initialAutobots={autobots} initialDecepticons={decepticons}>
        <main className="w-full h-full p-8">
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <Header />
            <div className="w-full h-full space-y-6 px-4">
              <BattleLayout autobots={data.autobots} decepticons={data.decepticons} />
            </div>
          </div>
        </main>
        </CombatantsProvider>
      </ResultsProvider>
    </BrowserRouter>
  );
}
