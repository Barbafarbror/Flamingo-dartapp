import { APP_STATE, createEmptyPlayers } from '../../state.js';
import { cloneData, normalizeName } from '../../utils/helpers.js';
import {
  getScoringGain,
  getLegWinnerIndex,
  buildMatchSummary,
  recordCompletedCricketMatch
} from './cricketLogic.js';

function rerender() {
  window.__renderApp?.();
}

function createSnapshot() {
  return cloneData({
    cricket: APP_STATE.cricket,
    ui: APP_STATE.ui,
    stats: APP_STATE.stats
  });
}

function restoreSnapshot(snapshot) {
  APP_STATE.cricket = snapshot.cricket;
  APP_STATE.ui = snapshot.ui;
  APP_STATE.stats = snapshot.stats;
}

function closeAllTransientUi() {
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
}

export function goToMenu() {
  APP_STATE.currentView = 'menu';
  closeAllTransientUi();
  rerender();
}

export function closeSummaryToMenu() {
  APP_STATE.cricket.showSummary = false;
  APP_STATE.currentView = 'menu';
  closeAllTransientUi();
  rerender();
}

export function startNewCricketMatchFromSummary() {
  APP_STATE.cricket.showSummary = false;
  closeAllTransientUi();
  createCricketGame();
}

export function openCricket() {
  APP_STATE.currentView = 'cricket';
  APP_STATE.cricket.turnMessage = APP_STATE.cricket.players.length
    ? `${APP_STATE.cricket.players[APP_STATE.cricket.currentPlayer]?.name || 'Spelare 1'} är aktiv spelare.`
    : 'Starta ett Cricket-spel för att börja.';
  rerender();
}

export function setCricketPlayerCount(value) {
  APP_STATE.cricket.lastPlayerCount = parseInt(value, 10);
  rerender();
}

export function updateLegTarget(value) {
  const playerCountSelect = document.getElementById('playerCount');
  if (playerCountSelect) {
    APP_STATE.cricket.lastPlayerCount = parseInt(playerCountSelect.value, 10);
  }

  APP_STATE.cricket.legsToWin = parseInt(value, 10);
  rerender();
}

export function createCricketGame() {
  const cricket = APP_STATE.cricket;

  const playerCountSelect = document.getElementById('playerCount');
  const playerCount = playerCountSelect
    ? parseInt(playerCountSelect.value, 10)
    : cricket.lastPlayerCount;

  cricket.lastPlayerCount = playerCount;

  const existingPlayers = cricket.players.length
    ? cricket.players
    : [];

  cricket.players = createEmptyPlayers(playerCount, existingPlayers);
  cricket.gameOver = false;
  cricket.history = [];
  cricket.multiplier = 1;
  cricket.legs = [0, 0, 0, 0];
  cricket.currentPlayer = 0;
  cricket.matchWinner = null;
  cricket.currentLegScores = [0, 0, 0, 0];
  cricket.legHistory = [[], [], [], []];
  cricket.completedLegs = [];
  cricket.showSummary = false;
  cricket.summaryData = null;
  cricket.pendingLegReset = false;
  cricket.turnMessage = `${cricket.players[0].name} börjar matchen.`;

  closeAllTransientUi();
  APP_STATE.currentView = 'cricket';
  rerender();
}

export function resetCricketMatch() {
  const cricket = APP_STATE.cricket;
  if (!cricket.players.length) return;

  cricket.legs = [0, 0, 0, 0];
  cricket.matchWinner = null;
  cricket.currentPlayer = 0;
  cricket.currentLegScores = [0, 0, 0, 0];
  cricket.legHistory = [[], [], [], []];
  cricket.completedLegs = [];
  cricket.showSummary = false;
  cricket.summaryData = null;
  cricket.pendingLegReset = false;

  newCricketRound();
}

export function newCricketRound() {
  const cricket = APP_STATE.cricket;
  if (!cricket.players.length) return;

  cricket.players = cricket.players.map(player => ({
    ...player,
    hits: Array(cricket.targets.length).fill(0),
    score: 0
  }));

  cricket.currentLegScores = [0, 0, 0, 0];
  cricket.gameOver = false;
  cricket.history = [];
  cricket.multiplier = 1;
  cricket.currentPlayer = 0;
  cricket.showSummary = false;
  cricket.summaryData = null;
  cricket.pendingLegReset = false;
  cricket.turnMessage = `${cricket.players[0].name} börjar nästa leg.`;

  closeAllTransientUi();
  rerender();
}

export function nextCricketPlayer() {
  const cricket = APP_STATE.cricket;
  if (!cricket.players.length || cricket.gameOver) return;

  cricket.currentPlayer = (cricket.currentPlayer + 1) % cricket.players.length;
  cricket.turnMessage = `${cricket.players[cricket.currentPlayer].name} är nu aktiv spelare.`;
  rerender();
}

export function selectMultiplier(value) {
  APP_STATE.cricket.multiplier = value;
  APP_STATE.cricket.turnMessage = `Kastmultipel ändrad till X${value}.`;
  rerender();
}

export function setActivePlayer(index) {
  const cricket = APP_STATE.cricket;
  if (!cricket.players[index] || cricket.gameOver) return;

  cricket.currentPlayer = index;
  cricket.turnMessage = `${cricket.players[index].name} valdes som aktiv spelare.`;
  rerender();
}

export function setPlayerColor(index, color) {
  const cricket = APP_STATE.cricket;
  if (!cricket.players[index]) return;

  cricket.players[index].color = color;
  rerender();
}

export function openNameEditor(index) {
  const cricket = APP_STATE.cricket;
  if (!cricket.players[index]) return;

  APP_STATE.ui.nameEditor = {
    open: true,
    playerIndex: index,
    value: cricket.players[index].name
  };

  rerender();
}

export function updateNameEditorValue(value) {
  APP_STATE.ui.nameEditor.value = value;
}

export function closeNameEditor() {
  APP_STATE.ui.nameEditor = {
    open: false,
    playerIndex: null,
    value: ''
  };

  rerender();
}

export function saveNameEdit() {
  const cricket = APP_STATE.cricket;
  const { playerIndex, value } = APP_STATE.ui.nameEditor;

  if (playerIndex === null || !cricket.players[playerIndex]) return;

  cricket.players[playerIndex].name = normalizeName(value, `Spelare ${playerIndex + 1}`);

  if (cricket.currentPlayer === playerIndex) {
    cricket.turnMessage = `${cricket.players[playerIndex].name} är aktiv spelare.`;
  }

  closeNameEditor();
}

export function closeLegWinnerModal() {
  APP_STATE.ui.legWinnerModal = {
    open: false,
    winnerName: '',
    message: ''
  };

  if (APP_STATE.cricket.pendingLegReset) {
    newCricketRound();
    return;
  }

  rerender();
}

export function handleCricketClick(row, playerIndex) {
  const cricket = APP_STATE.cricket;
  if (cricket.gameOver || !cricket.players[playerIndex]) return;

  cricket.history.push(createSnapshot());

  const wasAnotherPlayer = cricket.currentPlayer !== playerIndex;
  cricket.currentPlayer = playerIndex;

  const previousHits = cricket.players[playerIndex].hits[row];
  const rawNewHits = previousHits + cricket.multiplier;
  const newHits = Math.min(rawNewHits, 4);

  cricket.players[playerIndex].hits[row] = newHits;

  const gainedPoints = getScoringGain(cricket, row, playerIndex, previousHits, rawNewHits);
  if (gainedPoints > 0) {
    cricket.players[playerIndex].score += gainedPoints;
    cricket.currentLegScores[playerIndex] += gainedPoints;
  }

  const activePlayerName = cricket.players[playerIndex].name;
  const targetName = cricket.targets[row];

  if (wasAnotherPlayer) {
    cricket.turnMessage = `${activePlayerName} valdes direkt via tabellen och kast registrerades på ${targetName}.`;
  } else {
    cricket.turnMessage = `${activePlayerName} registrerade kast på ${targetName} med X${cricket.multiplier}.`;
  }

  const winnerIndex = getLegWinnerIndex(cricket);

  if (winnerIndex === null) {
    rerender();
    return;
  }

  const legNumber = cricket.completedLegs.length + 1;

  cricket.legs[winnerIndex] = (cricket.legs[winnerIndex] || 0) + 1;
  cricket.legHistory[winnerIndex].push(cricket.currentLegScores[winnerIndex]);
  cricket.completedLegs.push({
    legNumber,
    winnerIndex,
    winnerName: cricket.players[winnerIndex].name,
    score: cricket.currentLegScores[winnerIndex]
  });

  const winnerName = cricket.players[winnerIndex].name;

  if (cricket.legs[winnerIndex] >= cricket.legsToWin) {
    cricket.matchWinner = winnerName;
    cricket.gameOver = true;
    cricket.pendingLegReset = false;
    cricket.showSummary = true;
    cricket.summaryData = buildMatchSummary(cricket);
    cricket.turnMessage = `${winnerName} vann matchen.`;

    recordCompletedCricketMatch(APP_STATE, winnerIndex);
    rerender();
    return;
  }

  cricket.gameOver = true;
  cricket.pendingLegReset = true;
  APP_STATE.ui.legWinnerModal = {
    open: true,
    winnerName,
    message: `${winnerName} vann legget. Tryck nedan för att starta nästa leg.`
  };

  rerender();
}

export function undoCricket() {
  const cricket = APP_STATE.cricket;
  if (!cricket.history.length) return;

  const snapshot = cricket.history.pop();
  restoreSnapshot(snapshot);
  rerender();
}
