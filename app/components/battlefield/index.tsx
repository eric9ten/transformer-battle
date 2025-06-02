import React, { useState, useEffect, useRef } from 'react';
import type { TTransformer } from '~/types/transformer.type';
import { Button } from "../button/button";
import defaultAutobotIcon from '~/assets/default-autobot.png';
import defaultDecepticonIcon from '~/assets/default-decepticon.png';
import { IconButton } from '~/components/icon-button';
import { ResetIcon, ReloadIcon } from '@radix-ui/react-icons';
import { useResults } from '~/contexts/ResultsContext';
import { useCombatants } from '~/contexts/CombatantsContext';

import s from './battlefield.module.scss';

interface BattlefieldProps {
  autobot: TTransformer | null;
  decepticon: TTransformer | null;
  onBattleComplete?: (result: string) => void;
}

export function Battlefield({ autobot, decepticon, onBattleComplete }: BattlefieldProps) {
  const [battleState, setBattleState] = useState<{
    autobot: TTransformer | null;
    decepticon: TTransformer | null;
    logs: string[];
  }>({
    autobot,
    decepticon,
        logs: [],
    });
    
    const { addResult } = useResults();
    const { updateCombatant } = useCombatants();
    const tableRef = useRef<HTMLDivElement>(null);
      
    useEffect(() => {
        setBattleState(prev => ({
        ...prev,
        autobot: autobot ? { ...autobot } : null,
        decepticon: decepticon ? { ...decepticon } : null,
        }));
    }, [autobot, decepticon]);
      
    useEffect(() => {
        if (tableRef.current) {
        tableRef.current.scrollTop = tableRef.current.scrollHeight;
        }
    }, [battleState.logs]);

    const isBattleReady = !!battleState.autobot && !!battleState.decepticon;
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


  const combat = async () => {
    if (!battleState.autobot || !battleState.decepticon) {
      console.error('Both Autobot and Decepticon must be selected for combat.');
      setBattleState(prev => ({
        ...prev,
        logs: [...prev.logs, 'Error: Both Autobot and Decepticon must be selected.'],
      }));
      return;
    }

    let autobotCopy = { ...battleState.autobot };
    let decepticonCopy = { ...battleState.decepticon };
    let newLogs: string[] = [
      `Combat initiated between ${autobotCopy.name} and ${decepticonCopy.name}`,
      `${autobotCopy.name} health: ${autobotCopy.health}`,
      `${decepticonCopy.name} health: ${decepticonCopy.health}`,
    ];

    setBattleState(prev => ({ ...prev, logs: newLogs }));

    while (autobotCopy.health > 0 && decepticonCopy.health > 0) {
      const autobotFirst = Math.random() < 0.5;

      const autobotAbility =
        autobotCopy.abilities.length > 0
          ? autobotCopy.abilities[Math.floor(Math.random() * autobotCopy.abilities.length)]
          : { id: 'basic', name: 'Basic Attack', description: 'A basic attack', damage: 1, cooldown: 0 };
      const decepticonAbility =
        decepticonCopy.abilities.length > 0
          ? decepticonCopy.abilities[Math.floor(Math.random() * decepticonCopy.abilities.length)]
          : { id: 'basic', name: 'Basic Attack', description: 'A basic attack', damage: 1, cooldown: 0 };

      const autobotDamage = autobotAbility.damage;
      const decepticonDamage = decepticonAbility.damage;

      if (autobotFirst) {
        newLogs = [
          ...newLogs,
          `${autobotCopy.name} uses ${autobotAbility.name} for ${autobotDamage} damage to ${decepticonCopy.name}`,
        ];
        decepticonCopy.health -= autobotDamage;
        newLogs = [...newLogs, `${decepticonCopy.name} health: ${decepticonCopy.health}`];

        if (decepticonCopy.health > 0) {
          newLogs = [
            ...newLogs,
            `${decepticonCopy.name} uses ${decepticonAbility.name} for ${decepticonDamage} damage to ${autobotCopy.name}`,
          ];
          autobotCopy.health -= decepticonDamage;
          newLogs = [...newLogs, `${autobotCopy.name} health: ${autobotCopy.health}`];
        }
      } else {
        newLogs = [
          ...newLogs,
          `${decepticonCopy.name} uses ${decepticonAbility.name} for ${decepticonDamage} damage to ${autobotCopy.name}`,
        ];
        autobotCopy.health -= decepticonDamage;
        newLogs = [...newLogs, `${autobotCopy.name} health: ${autobotCopy.health}`];

        if (autobotCopy.health > 0) {
          newLogs = [
            ...newLogs,
            `${autobotCopy.name} uses ${autobotAbility.name} for ${autobotDamage} damage to ${decepticonCopy.name}`,
          ];
          decepticonCopy.health -= autobotDamage;
          newLogs = [...newLogs, `${decepticonCopy.name} health: ${decepticonCopy.health}`];
        }
      }

      setBattleState(prev => ({
        ...prev,
        autobot: { ...autobotCopy },
        decepticon: { ...decepticonCopy },
        logs: newLogs,
      }));

      await sleep(1000);
    }
    
    let finalLogs = [...newLogs];
    let result = '';
    if (autobotCopy.health <= 0 && decepticonCopy.health <= 0) {
      result = 'Battle ended in a draw!';
    } else if (autobotCopy.health <= 0) {
      result = `${decepticonCopy.name} defeats ${autobotCopy.name}!`;
      updateCombatant(decepticonCopy.id, { wins: (decepticonCopy.wins || 0) + 1 });
      updateCombatant(autobotCopy.id, { losses: (autobotCopy.losses || 0) + 1 });
    } else {
      result = `${autobotCopy.name} defeats ${decepticonCopy.name}!`;
      updateCombatant(autobotCopy.id, { wins: (autobotCopy.wins || 0) + 1 });
      updateCombatant(decepticonCopy.id, { losses: (decepticonCopy.losses || 0) + 1 });
    }
    finalLogs.push(result);

    setBattleState({
      autobot: autobotCopy,
      decepticon: decepticonCopy,
      logs: finalLogs,
    });

    addResult(result);
    onBattleComplete?.(result);
  };

    const startBattle = () => {
      if (battleState.autobot && battleState.decepticon) {
        combat();
      }
    };

    const clearBattlefield = () => {
        console.log('Battlefield cleared');
        setBattleState({
            autobot: null,
            decepticon: null,
            logs: [],
        });
    };

    const restartBattle = () => {
        console.log('Battle restarted');
        setBattleState({
            autobot: autobot ? { ...autobot } : null,
            decepticon: decepticon ? { ...decepticon } : null,
            logs: [],
        });
    };

     return (
        <div className={s.battlefield}>
        <h2 className="font-display text-xl text-center">Battlefield</h2>
        <div className={s.battlefield_combatants}>
            <div className={s.battlefield_combatantsWrapper}>
            {battleState.autobot ? (
                <div className={s.battlefield_combatant}>
                    <div className={s.battlefield_icon}>
                        <img src={battleState.autobot.icon || defaultAutobotIcon} alt="" />
                    </div>
                    <div className={s.battlefield_info}>
                        <h3 className={s.battlefield_name} data-testid="autobot-name">{battleState.autobot.name}</h3>
                        <p>Health: {battleState.autobot.health}</p>
                        <p>Abilities: {battleState.autobot.abilities.map(a => a.name).join(', ')}</p>
                    </div>
                </div>
            ) : (
                <p>Select an Autobot</p>
            )}
            {battleState.decepticon ? (
                <div className={s.battlefield_combatant}>
                    <div className={`${s.battlefield_info} ${s.right}`}>
                        <h3 className={s.battlefield_name} data-testid="decepticon-name">{battleState.decepticon.name}</h3>
                        <p>Health: {battleState.decepticon.health}</p>
                        <p>Abilities: {battleState.decepticon.abilities.map(a => a.name).join(', ')}</p>
                    </div>
                    <div className={s.battlefield_icon}>
                        <img src={battleState.decepticon.icon || defaultDecepticonIcon} alt="" />
                    </div>
                </div>
            ) : (
                <p>Select a Decepticon</p>
            )}
            </div>
        </div>
        <div className={s.battlefield_log}>
            <h3 className="text-sm text-stone-500 italic">Battle Log</h3>
            <div className={s.battlefield_tableWrapper} ref={tableRef}>
                <table className={s.battlefield_table}>
                    <tbody>
                        {battleState.logs.map((log, index) => (
                            <tr key={index}>
                                <td>{log}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="w-full flex flex-col justify-center self-end">
            <p className="mb-2 text-sm text-stone-500 italic text-center">Select an Autobot and Decepticon to start the battle.</p>
            <div className="w-full flex flex-row justify-center gap-6">
            <IconButton onClick={clearBattlefield}
                title="Clear Battlefield"
                data-testid="clear-battle"
              >
                <ResetIcon />
            </IconButton>
            <Button
                data-testid="start-battle"
                label="Start Battle"
                isDisabled={!isBattleReady}
                onClick={startBattle}
            />
            <IconButton onClick={restartBattle} 
                title="Restart Battle"
                data-testid="restart-battle"
              >
                <ReloadIcon />
            </IconButton>
            </div>
        </div>
    </div>
  );
}