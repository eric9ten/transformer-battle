import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface BattleResult {
  id: string;
  result: string;
  timestamp: string;
}

interface ResultsContextType {
  results: BattleResult[];
  addResult: (result: string) => void;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export function ResultsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<BattleResult[]>([]);

  const addResult = (result: string) => {
    const newResult: BattleResult = {
      id: crypto.randomUUID(),
      result,
      timestamp: new Date().toISOString(),
    };
    console.log('ResultsContext: Adding result:', newResult);
    setResults(prev => [...prev, newResult]);
  };

  return (
    <ResultsContext.Provider value={{ results, addResult }}>
      {children}
    </ResultsContext.Provider>
  );
}

export function useResults() {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error('useResults must be used within a ResultsProvider');
  }
  return context;
}