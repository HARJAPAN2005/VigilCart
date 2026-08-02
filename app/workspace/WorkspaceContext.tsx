'use client';

/**
 * Workspace store — the single source of truth for the VigilCart lab.
 *
 * All durable run state lives here (scenario, compiled intent, deterministic
 * reports, current mission act, view mode, evidence drawer). Guided and
 * Dashboard views render from THIS state; there are never duplicate simulation
 * component trees. Heavy stateful components (AgentArena / AttackEditor) read
 * from here and are rendered exactly once.
 */

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  IntentContract,
  MerchantOffer,
  FidelityReport,
} from '../../lib/schemas';
import { runGuard } from '../../lib/deterministic-guard';
import { computeScore } from '../../lib/scoring';
import {
  defaultIntent,
  defaultScenarioMerchants,
  promptInjectedDeal,
} from '../../data/default-scenario';
import {
  honestFailureIntent,
  honestFailureMerchant,
} from '../../data/honest-failure-scenario';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScenarioId = 'default' | 'honest-failure';
export type ViewMode = 'guided' | 'dashboard';
export type ActId = 'brief' | 'arena' | 'attack' | 'verdict';

export const ACTS: ActId[] = ['brief', 'arena', 'attack', 'verdict'];

export const ACT_META: Record<ActId, { index: number; label: string; blurb: string }> = {
  brief: { index: 1, label: 'The Brief', blurb: 'Your words become rules' },
  arena: { index: 2, label: 'The Arena', blurb: 'Two agents, one hidden attack' },
  attack: { index: 3, label: 'Attack Lab', blurb: 'Try to break them yourself' },
  verdict: { index: 4, label: 'The Verdict', blurb: 'Evidence, clearance, approval' },
};

interface ScenarioDef {
  id: ScenarioId;
  label: string;
  tagline: string;
  intent: IntentContract;
  merchants: MerchantOffer[];
}

/** The flagship injection scenario always drives the Arena race. */
export const FLAGSHIP_INTENT = defaultIntent;
export const FLAGSHIP_MERCHANTS = defaultScenarioMerchants;
export const ATTACK_OFFER = promptInjectedDeal;

export const SCENARIOS: Record<ScenarioId, ScenarioDef> = {
  default: {
    id: 'default',
    label: 'Prompt-Injection Attack',
    tagline: 'Three merchants, one hides an injected review',
    intent: defaultIntent,
    merchants: defaultScenarioMerchants,
  },
  'honest-failure': {
    id: 'honest-failure',
    label: 'Honest Failure',
    tagline: 'Conflicting evidence — the guard abstains rather than guess',
    intent: honestFailureIntent,
    merchants: [honestFailureMerchant],
  },
};

export interface WorkspaceState {
  scenario: ScenarioId;
  intent: IntentContract | null;
  intentSource: 'fixture' | 'openai';
  compiled: boolean;
  reports: FidelityReport[];
  /** Merchant ids the USER has explicitly approved for simulated checkout. */
  approvedIds: string[];
  viewMode: ViewMode;
  activeAct: ActId;
  evidenceOffer: MerchantOffer | null;
}

type Action =
  | { type: 'COMPILE_FIXTURE' }
  | { type: 'COMPILE_OPENAI'; intent: IntentContract }
  | { type: 'SWITCH_SCENARIO'; scenario: ScenarioId }
  | { type: 'SET_ACT'; act: ActId }
  | { type: 'STEP_ACT'; dir: 1 | -1 }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'OPEN_EVIDENCE'; offer: MerchantOffer }
  | { type: 'CLOSE_EVIDENCE' }
  | { type: 'SET_APPROVAL'; merchantId: string; approved: boolean };

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Deterministic report set. Approval is per-offer and only ever true when the
 * USER has explicitly granted it — the LLM never approves. runGuard remains the
 * single authority.
 */
function computeReports(
  intent: IntentContract,
  merchants: MerchantOffer[],
  approvedIds: string[],
): FidelityReport[] {
  return merchants.map((offer) =>
    computeScore(runGuard(intent, offer, approvedIds.includes(offer.merchantId))),
  );
}

const initialState: WorkspaceState = {
  scenario: 'default',
  intent: null,
  intentSource: 'fixture',
  compiled: false,
  reports: [],
  approvedIds: [],
  viewMode: 'guided',
  activeAct: 'brief',
  evidenceOffer: null,
};

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case 'COMPILE_FIXTURE': {
      const s = SCENARIOS[state.scenario];
      return {
        ...state,
        intent: s.intent,
        intentSource: 'fixture',
        compiled: true,
        approvedIds: [],
        reports: computeReports(s.intent, s.merchants, []),
        activeAct: 'brief',
      };
    }
    case 'COMPILE_OPENAI': {
      const s = SCENARIOS[state.scenario];
      return {
        ...state,
        intent: action.intent,
        intentSource: 'openai',
        compiled: true,
        approvedIds: [],
        reports: computeReports(action.intent, s.merchants, []),
        activeAct: 'brief',
      };
    }
    case 'SWITCH_SCENARIO': {
      if (action.scenario === state.scenario) return state;
      const s = SCENARIOS[action.scenario];
      // Once compiled, a scenario switch re-derives from the scenario's
      // canonical intent so the fixtures, diff, and verdict stay coherent.
      if (!state.compiled) {
        return { ...state, scenario: action.scenario };
      }
      return {
        ...state,
        scenario: action.scenario,
        intent: s.intent,
        intentSource: 'fixture',
        approvedIds: [],
        reports: computeReports(s.intent, s.merchants, []),
        evidenceOffer: null,
      };
    }
    case 'SET_APPROVAL': {
      if (!state.compiled || !state.intent) return state;
      const approvedIds = action.approved
        ? Array.from(new Set([...state.approvedIds, action.merchantId]))
        : state.approvedIds.filter((id) => id !== action.merchantId);
      const merchants = SCENARIOS[state.scenario].merchants;
      return {
        ...state,
        approvedIds,
        reports: computeReports(state.intent, merchants, approvedIds),
      };
    }
    case 'SET_ACT':
      return { ...state, activeAct: action.act };
    case 'STEP_ACT': {
      const i = ACTS.indexOf(state.activeAct);
      const next = Math.min(ACTS.length - 1, Math.max(0, i + action.dir));
      return { ...state, activeAct: ACTS[next] };
    }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode };
    case 'OPEN_EVIDENCE':
      return { ...state, evidenceOffer: action.offer };
    case 'CLOSE_EVIDENCE':
      return { ...state, evidenceOffer: null };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface WorkspaceValue extends WorkspaceState {
  /** Merchants for the currently selected scenario. */
  activeMerchants: MerchantOffer[];
  /** Scenario metadata for the currently selected scenario. */
  activeScenario: ScenarioDef;
  compileFixture: () => void;
  compileOpenAI: (intent: IntentContract) => void;
  switchScenario: (scenario: ScenarioId) => void;
  setAct: (act: ActId) => void;
  stepAct: (dir: 1 | -1) => void;
  setViewMode: (mode: ViewMode) => void;
  openEvidence: (offer: MerchantOffer) => void;
  closeEvidence: () => void;
  setApproval: (merchantId: string, approved: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const compileFixture = useCallback(() => dispatch({ type: 'COMPILE_FIXTURE' }), []);
  const compileOpenAI = useCallback(
    (intent: IntentContract) => dispatch({ type: 'COMPILE_OPENAI', intent }),
    [],
  );
  const switchScenario = useCallback(
    (scenario: ScenarioId) => dispatch({ type: 'SWITCH_SCENARIO', scenario }),
    [],
  );
  const setAct = useCallback((act: ActId) => dispatch({ type: 'SET_ACT', act }), []);
  const stepAct = useCallback((dir: 1 | -1) => dispatch({ type: 'STEP_ACT', dir }), []);
  const setViewMode = useCallback((mode: ViewMode) => dispatch({ type: 'SET_VIEW_MODE', mode }), []);
  const openEvidence = useCallback(
    (offer: MerchantOffer) => dispatch({ type: 'OPEN_EVIDENCE', offer }),
    [],
  );
  const closeEvidence = useCallback(() => dispatch({ type: 'CLOSE_EVIDENCE' }), []);
  const setApproval = useCallback(
    (merchantId: string, approved: boolean) =>
      dispatch({ type: 'SET_APPROVAL', merchantId, approved }),
    [],
  );

  const value = useMemo<WorkspaceValue>(
    () => ({
      ...state,
      activeMerchants: SCENARIOS[state.scenario].merchants,
      activeScenario: SCENARIOS[state.scenario],
      compileFixture,
      compileOpenAI,
      switchScenario,
      setAct,
      stepAct,
      setViewMode,
      openEvidence,
      closeEvidence,
      setApproval,
    }),
    [
      state,
      compileFixture,
      compileOpenAI,
      switchScenario,
      setAct,
      stepAct,
      setViewMode,
      openEvidence,
      closeEvidence,
      setApproval,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return ctx;
}
