import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Battlefield } from '~/components/battlefield';
import type { TTransformer } from '~/types/transformer.type';
import { ResultsProvider, useResults } from '~/contexts/ResultsContext';
import { CombatantsProvider, useCombatants } from '~/contexts/CombatantsContext';
import defaultAutobotIcon from '~/assets/default-autobot.png';
import { renderWithRouter } from '~/test-utils/renderWithRouter';

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

const mockAutobot: TTransformer = {
  id: 'autobot_001',
  name: 'Optimus Prime',
  faction: 'Autobot',
  icon: '',
  health: 1000,
  wins: 0,
  losses: 0,
  abilities: [{ id: 'ability_001', name: 'Plasma Cannon', description: 'High-energy bolt', damage: 150, cooldown: 8 }],
};
const mockDecepticon: TTransformer = {
  id: 'decepticon_001',
  name: 'Megatron',
  faction: 'Decepticon',
  icon: '/custom-decepticon.png',
  health: 800,
  wins: 0,
  losses: 0,
  abilities: [{ id: 'ability_101', name: 'Fusion Cannon', description: 'Energy blast', damage: 160, cooldown: 9 }],
};

const initialAutobots = [mockAutobot];
const initialDecepticons = [mockDecepticon];

describe('Battlefield Component', () => {
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

    const startButton = screen.getByRole('button', { name: /Start Battle/i });
    expect(startButton).toBeDisabled();
  });

  it('renders with combatants and displays their details', () => {
    (useCombatants as ReturnType<typeof vi.fn>).mockReturnValue({
      autobots: initialAutobots,
      decepticons: initialDecepticons,
      updateCombatant,
      addCombatant: vi.fn(),
    });
    renderWithRouter(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={initialAutobots} initialDecepticons={initialDecepticons}>
          <Battlefield autobot={null} decepticon={null} />
        </CombatantsProvider>
      </ResultsProvider>,
    );

    expect(screen.getByText('Optimus Prime')).toBeInTheDocument();
    expect(screen.getByText('Health: 1000')).toBeInTheDocument();
    expect(screen.getByText('Abilities: Plasma Cannon')).toBeInTheDocument();
    expect(screen.getAllByAltText('')[0]).toHaveAttribute('src', defaultAutobotIcon);

    expect(screen.getByText('Megatron')).toBeInTheDocument();
    expect(screen.getByText('Health: 800')).toBeInTheDocument();
    expect(screen.getByText('Abilities: Fusion Cannon')).toBeInTheDocument();
    expect(screen.getAllByAltText('')[1]).toHaveAttribute('src', '/custom-decepticon.png');

    const startButton = screen.getByRole('button', { name: /Start Battle/i });
    expect(startButton).not.toBeDisabled();
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

    const startButton = screen.getByRole('button', { name: /Start Battle/i });
    expect(startButton).toBeDisabled();
  });

  it('clears battlefield when Clear button is clicked', async () => {
    renderWithRouter(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={initialAutobots} initialDecepticons={initialDecepticons}>
          <Battlefield autobot={null} decepticon={null} />
        </CombatantsProvider>
      </ResultsProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /Clear Battlefield/i }));

    expect(screen.getByText('Select an Autobot')).toBeInTheDocument();
    expect(screen.getByText('Select a Decepticon')).toBeInTheDocument();
    expect(screen.queryByText('Optimus Prime')).not.toBeInTheDocument();
    expect(screen.queryByText('Megatron')).not.toBeInTheDocument();
  });

  it('restarts battlefield when Restart button is clicked', async () => {
    renderWithRouter(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={initialAutobots} initialDecepticons={initialDecepticons}>
          <Battlefield autobot={null} decepticon={null} />
        </CombatantsProvider>
      </ResultsProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /Start Battle/i }));
    vi.advanceTimersByTime(1000);

    await userEvent.click(screen.getByRole('button', { name: /Restart Battle/i }));

    expect(screen.getByText('Optimus Prime')).toBeInTheDocument();
    expect(screen.getByText('Health: 1000')).toBeInTheDocument();
    expect(screen.getByText('Megatron')).toBeInTheDocument();
    expect(screen.getByText('Health: 800')).toBeInTheDocument();
    expect(screen.queryByText(/Combat initiated/i)).not.toBeInTheDocument();
  });

  it('logs error when Start Battle is clicked without both combatants', async () => {
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

    vi.spyOn(console, 'error').mockImplementation(() => {});
    await userEvent.click(screen.getByRole('button', { name: /Start Battle/i }));

    await waitFor(() => {
      expect(screen.getByText('Error: Both Autobot and Decepticon must be selected.')).toBeInTheDocument();
    });
  });

  it('runs combat and updates state, context, calls callbacks, and saves to localStorage', async () => {
    const onBattleComplete = vi.fn();
    renderWithRouter(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={initialAutobots} initialDecepticons={initialDecepticons}>
          <Battlefield onBattleComplete={onBattleComplete} autobot={null} decepticon={null} />
        </CombatantsProvider>
      </ResultsProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /Start Battle/i }));

    await waitFor(() => {
      expect(screen.getByText(/Combat initiated between Optimus Prime and Megatron/i)).toBeInTheDocument();
      expect(screen.getByText(/Optimus Prime uses Plasma Cannon for 150 damage to Megatron/i)).toBeInTheDocument();
      expect(screen.getByText(/Megatron health: 650/i)).toBeInTheDocument();
    }, { timeout: 1000 });

    // Advance timers for one round (Decepticon attacks)
    vi.advanceTimersByTime(1000);

    await waitFor(
      () => {
        expect(screen.getByText(/Optimus Prime defeats Megatron!/i)).toBeInTheDocument();
        expect(addResult).toHaveBeenCalledWith({
          id: 'mocked-uuid',
          result: 'Optimus Prime defeats Megatron!',
          timestamp: expect.any(String),
        });
        expect(updateCombatant).toHaveBeenCalledWith('autobot_001', { wins: 1 });
        expect(updateCombatant).toHaveBeenCalledWith('decepticon_001', { losses: 1 });
        expect(onBattleComplete).toHaveBeenCalledWith('Optimus Prime defeats Megatron!');
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'battleResults',
          JSON.stringify([{
            id: 'mocked-uuid',
            result: 'Optimus Prime defeats Megatron!',
            timestamp: expect.any(String),
          }])
        );
      },
      { timeout: 2000 }
    );
  });

  it('handles combat draw correctly and saves to localStorage', async () => {
    const mockAutobotDraw: TTransformer = {
      id: 'autobot_001',
      name: 'Optimus Prime',
      faction: 'Autobot',
      icon: '',
      health: 10,
      wins: 0,
      losses: 0,
      abilities: [{ id: 'ability_001', name: 'Plasma Cannon', description: 'High-energy bolt', damage: 10, cooldown: 8 }],
    };
    const mockDecepticonDraw: TTransformer = {
      id: 'decepticon_001',
      name: 'Megatron',
      faction: 'Decepticon',
      icon: '/custom-decepticon.png',
      health: 10,
      wins: 0,
      losses: 0,
      abilities: [{ id: 'ability_101', name: 'Fusion Cannon', description: 'Energy blast', damage: 10, cooldown: 9 }],
    };

    (useCombatants as ReturnType<typeof vi.fn>).mockReturnValue({
      autobots: [mockAutobotDraw],
      decepticons: [mockDecepticonDraw],
      updateCombatant,
      addCombatant: vi.fn(),
    });
    mockRandom.mockReturnValue(0.6); // Decepticon attacks first
    mockRandom.mockReturnValueOnce(0).mockReturnValueOnce(0); // Same ability

    renderWithRouter(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={[mockAutobotDraw]} initialDecepticons={[mockDecepticonDraw]}>
          <Battlefield autobot={null} decepticon={null} />
        </CombatantsProvider>
      </ResultsProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /Start Battle/i }));
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('Battle ended in a draw!')).toBeInTheDocument();
      expect(addResult).toHaveBeenCalledWith({
        id: 'mocked-uuid',
        result: 'Battle ended in a draw!',
        timestamp: expect.any(String),
      });
      expect(updateCombatant).not.toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'battleResults',
        JSON.stringify([{
          id: 'mocked-uuid',
          result: 'Battle ended in a draw!',
          timestamp: expect.any(String),
        }])
      );
    }, { timeout: 1000 });
  });

  it('updates combatants when props change', async () => {
    const newAutobot: TTransformer = {
      id: 'autobot_002',
      name: 'Bumblebee',
      faction: 'Autobot',
      icon: '',
      health: 600,
      wins: 0,
      losses: 0,
      abilities: [],
    };
    (useCombatants as ReturnType<typeof vi.fn>).mockReturnValue({
      autobots: initialAutobots,
      decepticons: [],
      updateCombatant,
      addCombatant: vi.fn(),
    });
    const { rerender } = renderWithRouter(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={initialAutobots} initialDecepticons={[]}>
          <Battlefield autobot={null} decepticon={null} />
        </CombatantsProvider>
      </ResultsProvider>,
    );

    await screen.findByText((content, node) => node?.textContent === 'Bumblebee');
    expect(screen.getByText('Select a Decepticon')).toBeInTheDocument();

    (useCombatants as ReturnType<typeof vi.fn>).mockReturnValue({
      autobots: [newAutobot],
      decepticons: initialDecepticons,
      updateCombatant,
      addCombatant: vi.fn(),
    });
    rerender(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={[newAutobot]} initialDecepticons={initialDecepticons}>
          <Battlefield autobot={null} decepticon={null} />
        </CombatantsProvider>
      </ResultsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Bumblebee')).toBeInTheDocument();
      expect(screen.getByText('Megatron')).toBeInTheDocument();
    });
  });

  it('scrolls battle log to bottom when logs update', async () => {
    renderWithRouter(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={initialAutobots} initialDecepticons={initialDecepticons}>
          <Battlefield autobot={null} decepticon={null} />
        </CombatantsProvider>
      </ResultsProvider>,
    );

    const tableWrapper = screen.getByRole('table').parentElement!;
    const scrollSpy = vi.spyOn(tableWrapper, 'scrollTop', 'set');

    await userEvent.click(screen.getByRole('button', { name: /Start Battle/i }));
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalled();
      expect(tableWrapper.scrollTop).toBe(tableWrapper.scrollHeight);
    });
  });

  it('uses basic attack when no abilities are available', async () => {
    const mockAutobotNoAbility: TTransformer = {
      id: 'autobot_001',
      name: 'Optimus Prime',
      faction: 'Autobot',
      icon: '',
      health: 1000,
      wins: 0,
      losses: 0,
      abilities: [],
    };
    const mockDecepticonNoAbility: TTransformer = {
      id: 'decepticon_001',
      name: 'Megatron',
      faction: 'Decepticon',
      icon: '/custom-decepticon.png',
      health: 800,
      wins: 0,
      losses: 0,
      abilities: [],
    };

    (useCombatants as ReturnType<typeof vi.fn>).mockReturnValue({
      autobots: [mockAutobotNoAbility],
      decepticons: [mockDecepticonNoAbility],
      updateCombatant,
      addCombatant: vi.fn(),
    });
    renderWithRouter(
      <ResultsProvider>
        <CombatantsProvider initialAutobots={[mockAutobotNoAbility]} initialDecepticons={[mockDecepticonNoAbility]}>
          <Battlefield autobot={null} decepticon={null} />
        </CombatantsProvider>
      </ResultsProvider>,
    );

    screen.debug();
    await userEvent.click(screen.getByTestId('start-battle'));
    // await userEvent.click(screen.getByRole('button', { name: /Start Battle/i }));
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText(/Optimus Prime uses Basic Attack for 1 damage to Megatron/i)).toBeInTheDocument();
      expect(screen.getByText(/Megatron uses Basic Attack for 1 damage to Optimus Prime/i)).toBeInTheDocument();
    });
  });
});