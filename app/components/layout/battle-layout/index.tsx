import { Combatants } from '~/components/combatants';
import { Battlefield } from '~/components/battlefield';
import { Results } from '~/components/results';
import type { TTransformer } from '~/types/transformer.type';
import { useState } from 'react';
import { useResults } from '~/contexts/ResultsContext';

import s from './battle-layout.module.scss';

interface BattleLayoutProps {
  autobots: TTransformer[];
  decepticons: TTransformer[];
}

export function BattleLayout({ autobots, decepticons }: BattleLayoutProps) {
  const [selectedCombatants, setSelectedCombatants] = useState<{
    autobot: TTransformer | null;
    decepticon: TTransformer | null;
  }>({ autobot: null, decepticon: null });

  const { addResult } = useResults();

  const onCombatantSelect = (combatant: TTransformer) => {
    setSelectedCombatants(prev => ({
      ...prev,
      [combatant.faction === 'Autobot' ? 'autobot' : 'decepticon']: combatant,
    }));
  };

  const onBattleComplete = (result: string) => {
    console.log('BattleLayout: Battle completed with result:', result);
  };

  return (
    <div className={s.battle_layout }>
        <div className={`${s.combatants_section} ${s.bfBorder}`}>
            <Combatants faction="Autobot" onCombatantSelect={onCombatantSelect} />
        </div>
        <div className={`${s.battlefield_section} ${s.bfBorder}`}>
            <Battlefield
            autobot={selectedCombatants.autobot}
            decepticon={selectedCombatants.decepticon}
            onBattleComplete={onBattleComplete}
            />
        </div>
        <div className={`${s.combatants_section} ${s.bfBorder}`}>
            <Combatants faction="Decepticon" onCombatantSelect={onCombatantSelect} />
        </div>
        <div className={`${s.results_section} ${s.bfBorder}`}>
            <Results />
        </div>
    </div>
  );
}