import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Battlefield } from '~/components/battlefield';
import type { TTransformer } from '~/types/transformer.type';
import { ResultsProvider, useResults } from '~/contexts/ResultsContext';
import { CombatantsProvider, useCombatants } from '~/contexts/CombatantsContext';
import defaultAutobotIcon from '~/assets/default-autobot.png';
import { renderWithRouter } from '~/test-utils/renderWithRouter';
import { MemoryRouter } from 'react-router';

// Mock context hooks
vi.mock('~/contexts/ResultsContext', () => ({
  useResults: vi.fn(),
  ResultsProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('~/contexts/CombatantsContext', () => ({
  useCombatants: vi.fn(),
  CombatantsProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLoaderData: vi.fn().mockReturnValue({}),
    useNavigate: vi.fn().mockReturnValue(vi.fn()),
    useLocation: vi.fn().mockReturnValue({ pathname: '/' }),
    useParams: vi.fn().mockReturnValue({}),
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

// Mock Math.random and crypto.randomUUID
const mockRandom = vi.spyOn(Math, 'random');
const mockUUID = vi.spyOn(crypto, 'randomUUID');
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockAutobot: TTransformer = {
  id: 'autobot_001',
  name: 'Optimus Prime',
  faction: 'Autobot',
  icon: '',
  health: 5,
  wins: 0,
  losses: 0,
  abilities: [{ id: 'ability_001', name: 'Plasma Cannon', description: 'High-energy bolt', damage: 150, cooldown: 8 }],
};
const mockDecepticon: TTransformer = {
  id: 'decepticon_001',
  name: 'Megatron',
  faction: 'Decepticon',
  icon: '/custom-decepticon.png',
  health: 5,
  wins: 0,
  losses: 0,
  abilities: [{ id: 'ability_101', name: 'Fusion Cannon', description: 'Energy blast', damage: 160, cooldown: 9 }],
};

const initialAutobots = [mockAutobot];
const initialDecepticons = [mockDecepticon];

const renderWithProviders = (ui: React.ReactNode) =>
  renderWithRouter(
    <MemoryRouter>
      <ResultsProvider>
        <CombatantsProvider initialAutobots={initialAutobots} initialDecepticons={initialDecepticons}>
          {ui}
        </CombatantsProvider>
      </ResultsProvider>
    </MemoryRouter>
  );

describe('Battlefield', () => {
    let addResult: ReturnType<typeof vi.fn>;
    let updateCombatant: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      vi.clearAllMocks();
      addResult = vi.fn();
      updateCombatant = vi.fn();
      (useResults as ReturnType<typeof vi.fn>).mockReturnValue({ addResult, results: [] });
      (useCombatants as ReturnType<typeof vi.fn>).mockReturnValue({
        autobots: initialAutobots,
        decepticons: initialDecepticons,
        updateCombatant,
        addCombatant: vi.fn(),
      });
      mockRandom.mockReturnValue(0.4);
      mockUUID.mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      localStorageMock.clear();
    });
  
  it('renders without combatants and shows placeholder text', () => {
    (useCombatants as ReturnType<typeof vi.fn>).mockReturnValue({
      autobots: [],
      decepticons: [],
      updateCombatant,
      addCombatant: vi.fn(),
    });
    renderWithRouter(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={[]} initialDecepticons={[]}>
          <Battlefield autobot={null} decepticon={null} />
        </CombatantsProvider>
      </ResultsProvider>,
    );

    expect(screen.getByText('Select an Autobot')).toBeInTheDocument();
    expect(screen.getByText('Select a Decepticon')).toBeInTheDocument();
    expect(screen.getByText('Battlefield')).toBeInTheDocument();
    expect(screen.getByText('Battle Log')).toBeInTheDocument();
    expect(screen.getByText('Select an Autobot and Decepticon to start the battle.')).toBeInTheDocument();

    const startButton = screen.getByTestId('start-battle');
    expect(startButton).toBeDisabled();
  });

  it('disables Start Battle button when only one combatant is selected', () => {
    (useCombatants as ReturnType<typeof vi.fn>).mockReturnValue({
      autobots: initialAutobots,
      decepticons: [],
      updateCombatant,
      addCombatant: vi.fn(),
    });
    renderWithRouter(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={initialAutobots} initialDecepticons={[]}>
          <Battlefield autobot={null} decepticon={null} />
        </CombatantsProvider>
      </ResultsProvider>,
    );

    const startButton = screen.getByTestId('start-battle');
    expect(startButton).toBeDisabled();
  });

  it('clears the battlefield when clear button is clicked', async () => {
    renderWithRouter(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={initialAutobots} initialDecepticons={initialDecepticons}>
      <Battlefield autobot={initialAutobots[0]} decepticon={initialDecepticons[0]} />
        </CombatantsProvider>
      </ResultsProvider>,
    );

    const clearButton = screen.getByTestId('clear-battle');
    fireEvent.click(clearButton);

    expect(screen.queryByTestId('autobot-name')).not.toBeInTheDocument();
    expect(screen.queryByTestId('decepticon-name')).not.toBeInTheDocument();
  });

});