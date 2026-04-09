export const DEFAULT_PLAYER_COLORS = ['#add8e6', '#90ee90', '#fff176', '#ffb6c1'];

export function createPlayer(index, overrides = {}) {
  return {
    id: `player-${index + 1}`,
    name: overrides.name || `Spelare ${index + 1}`,
    hits: Array(7).fill(0),
    score: 0,
    color: overrides.color || DEFAULT_PLAYER_COLORS[index] || DEFAULT_PLAYER_COLORS[0]
  };
}

export function createEmptyPlayers(count, existingPlayers = []) {
  return Array.from({ length: count }, (_, index) =>
    createPlayer(index, {
      name: existingPlayers[index]?.name,
      color: existingPlayers[index]?.color
    })
  );
}

export const APP_STATE = {
  mode: 'light',
  currentView: 'menu',

  cricket: {
    targets: ['20', '19', '18', '17', '16', '15', 'B'],
    players: [],
    gameOver: false,
    history: [],
    multiplier: 1,
    legs: [0, 0, 0, 0],
    lastPlayerCount: 2,
    legsToWin: 3,
    currentPlayer: 0,
    matchWinner: null,
    currentLegScores: [0, 0, 0, 0],
    legHistory: [[], [], [], []],
    completedLegs: [],
    showSummary: false,
    summaryData: null,
    pendingLegReset: false,
    turnMessage: 'Öppna Cricket för att börja.'
  },

  ui: {
    nameEditor: {
      open: false,
      playerIndex: null,
      value: ''
    },
    legWinnerModal: {
      open: false,
      winnerName: '',
      message: ''
    }
  },

  stats: {
    matches: [],
    profiles: {}
  }
};
