import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { TTransformer } from '~/types/transformer.type';

interface CombatantsContextType {
  autobots: TTransformer[];
  decepticons: TTransformer[];
  updateCombatant: (id: string, updates: Partial<TTransformer>) => void;
  addCombatant: (combatant: TTransformer) => void;
}

const CombatantsContext = createContext<CombatantsContextType | undefined>(undefined);

export function CombatantsProvider({
  children,
  initialAutobots,
  initialDecepticons,
}: {
  children: ReactNode;
  initialAutobots: TTransformer[];
  initialDecepticons: TTransformer[];
}) {
  const [autobots, setAutobots] = useState<TTransformer[]>(initialAutobots);
  const [decepticons, setDecepticons] = useState<TTransformer[]>(initialDecepticons);

  const updateCombatant = (id: string, updates: Partial<TTransformer>) => {
    setAutobots((prev) =>
      prev.map((combatant) =>
        combatant.id === id ? { ...combatant, ...updates } : combatant
      )
    );
    setDecepticons((prev) =>
      prev.map((combatant) =>
        combatant.id === id ? { ...combatant, ...updates } : combatant
      )
    );
  };

  const addCombatant = (combatant: TTransformer) => {
    if (combatant.faction === 'Autobot') {
      setAutobots((prev) => [...prev, combatant]);
    } else {
      setDecepticons((prev) => [...prev, combatant]);
    }
  };

  return (
    <CombatantsContext.Provider value={{ autobots, decepticons, updateCombatant, addCombatant }}>
      {children}
    </CombatantsContext.Provider>
  );
}

export function useCombatants(): CombatantsContextType {
  const context = useContext(CombatantsContext);
  if (!context) {
    throw new Error('useCombatants must be used within a CombatantsProvider');
  }
  return context;
}