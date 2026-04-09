import { APP_STATE, createPlayer } from '../state.js';

const STORAGE_KEY = 'flamingo_dartapp_v1';

function normalizeNumberArray(arrayLike, length = 4) {
  const output = Array.from({ length }, (_, index) => Number(arrayLike?.[index] || 0));
  return output;
}

function normalizeNestedArray(arrayLike, length = 4) {
  return Array.from({ length }, (_, index) => Array.isArray(arrayLike?.[index]) ? arrayLike[index] : []);
}

export function saveAppState() {
  const dataToSave = {
    mode: APP_STATE.mode,
    currentView: APP_STATE.currentView,
    cricket: {
      targets: APP_STATE.cricket.targets,
      players: APP_STATE.cricket.players,
      gameOver: APP_STATE.cricket.gameOver,
      history: APP_STATE.cricket.history,
      multiplier: APP_STATE.cricket.multiplier,
      legs: APP_STATE.cricket.legs,
      lastPlayerCount: APP_STATE.cricket.lastPlayerCount,
      legsToWin: APP_STATE.cricket.legsToWin,
      currentPlayer: APP_STATE.cricket.currentPlayer,
      matchWinner: APP_STATE.cricket.matchWinner,
      currentLegScores: APP_STATE.cricket.currentLegScores,
      legHistory: APP_STATE.cricket.legHistory,
      completedLegs: APP_STATE.cricket.completedLegs,
      showSummary: APP_STATE.cricket.showSummary,
      summaryData: APP_STATE.cricket.summaryData,
      pendingLegReset: APP_STATE.cricket.pendingLegReset,
      turnMessage: APP_STATE.cricket.turnMessage
    },
    stats: APP_STATE.stats
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

export function loadAppState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const saved = JSON.parse(raw);

    APP_STATE.mode = saved.mode || APP_STATE.mode;
    APP_STATE.currentView = saved.currentView || APP_STATE.currentView;

    if (saved.cricket) {
      APP_STATE.cricket.targets = Array.isArray(saved.cricket.targets)
        ? saved.cricket.targets
        : APP_STATE.cricket.targets;

      APP_STATE.cricket.players = Array.isArray(saved.cricket.players)
        ? saved.cricket.players.map((player, index) => ({
            ...createPlayer(index),
            ...player,
            hits: Array.isArray(player.hits) ? player.hits : Array(7).fill(0),
            score: Number(player.score || 0)
          }))
        : [];

      APP_STATE.cricket.gameOver = Boolean(saved.cricket.gameOver);
      APP_STATE.cricket.history = Array.isArray(saved.cricket.history) ? saved.cricket.history : [];
      APP_STATE.cricket.multiplier = Number(saved.cricket.multiplier || 1);
      APP_STATE.cricket.legs = normalizeNumberArray(saved.cricket.legs, 4);
      APP_STATE.cricket.lastPlayerCount = Number(saved.cricket.lastPlayerCount || 2);
      APP_STATE.cricket.legsToWin = Number(saved.cricket.legsToWin || 3);
      APP_STATE.cricket.currentPlayer = Number(saved.cricket.currentPlayer || 0);
      APP_STATE.cricket.matchWinner = saved.cricket.matchWinner || null;
      APP_STATE.cricket.currentLegScores = normalizeNumberArray(saved.cricket.currentLegScores, 4);
      APP_STATE.cricket.legHistory = normalizeNestedArray(saved.cricket.legHistory, 4);
      APP_STATE.cricket.completedLegs = Array.isArray(saved.cricket.completedLegs) ? saved.cricket.completedLegs : [];
      APP_STATE.cricket.showSummary = Boolean(saved.cricket.showSummary);
      APP_STATE.cricket.summaryData = saved.cricket.summaryData || null;
      APP_STATE.cricket.pendingLegReset = Boolean(saved.cricket.pendingLegReset);
      APP_STATE.cricket.turnMessage = saved.cricket.turnMessage || APP_STATE.cricket.turnMessage;
    }

    if (saved.stats) {
      APP_STATE.stats = {
        matches: Array.isArray(saved.stats.matches) ? saved.stats.matches : [],
        profiles: saved.stats.profiles || {}
      };
    }

    APP_STATE.ui.nameEditor = {
      open: false,
      playerIndex: null,
      value: ''
    };

    APP_STATE.ui.legWinnerModal = {
      open: false,
      winnerName: '',
      message: ''
    };
  } catch (error) {
    console.error('Kunde inte läsa sparad data:', error);
  }
}
