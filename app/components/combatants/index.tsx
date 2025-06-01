import React, { useState } from 'react';
import type { TTransformer } from '~/types/transformer.type';
import { IconButton } from '~/components/icon-button';
import { PlusIcon } from '@radix-ui/react-icons';
import { Modal } from '../modal';
import { useCombatants } from '~/contexts/CombatantsContext';
import { TransformerForm } from '../transformer-form';
import type { TAbility } from '~/types/ability.type';
import { abilities } from '../../data/abilities';

import s from './combatant.module.scss';

interface CombatantsProps {
  faction: 'Autobot' | 'Decepticon';
  onCombatantSelect: (combatant: TTransformer) => void;
}

export function Combatants({ faction, onCombatantSelect }: CombatantsProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { autobots, decepticons, addCombatant } = useCombatants();
  const combatants = faction === 'Autobot' ? autobots : decepticons;

  const onCreateCombatantClick = () => {
    setIsModalOpen(true);
  };

  if (combatants.length === 0) {
    return (
      <div className="w-full h-full flex flex-col gap-4 p-4">
        <h2 className="font-display text-xl">Select {faction}</h2>
        <p>No {faction} combatants found.</p>
        <div className="w-full flex flex-row justify-center items-center gap-4">
          <IconButton onClick={onCreateCombatantClick} title={`Create ${faction}`}>
            <PlusIcon />
          </IconButton>
        </div>
      </div>
    );
  }

  return (
    <div className={s.combatants}>
      <div className={s.combatants_header}>
        <h2 className="font-display text-xl">Select {faction}</h2>
      </div>
      <div className={s.combatants_tableWrapper}>
        <table className={s.combatants_table}>
          <thead>
            <tr>
              <th className={s.combatants_titleName}>Name</th>
              <th className={s.combatants_titleWL}>W/L</th>
            </tr>
          </thead>
          <tbody>
            {combatants.map((combatant: TTransformer) => (
              <tr
                key={combatant.id}
                className={s.combatant_row}
                onClick={() => onCombatantSelect(combatant)}
              >
                <td>{combatant.name}</td>
                <td className={s.combatants_dataWL}>{combatant.wins || 0} / {combatant.losses || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={s.combatants_actions}>
        <IconButton onClick={onCreateCombatantClick} title={`Create ${faction}`}>
          <PlusIcon />
        </IconButton>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Add ${faction} Combatant`}
          faction={faction}
        >
          <TransformerForm
            faction={faction}
            abilities={abilities as TAbility[]}
            onAddCombatant={addCombatant}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>
      </div>
    </div>
  );
}