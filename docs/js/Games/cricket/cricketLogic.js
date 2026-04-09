function getProfileKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase();
}

export function getTargetPointValue(target) {
  return target === 'B' ? 25 : Number(target);
}

export function canScoreOnTarget(players, row, playerIndex) {
  return players.some((player, index) => index !== playerIndex && player.hits[row] < 3);
}

export function getScoringGain(cricket, row, playerIndex, prevHits, rawNewHits) {
  if (rawNewHits < 3) return 0;
  if (!canScoreOnTarget(cricket.players, row, playerIndex)) return 0;

  const previousExtraHits = Math.max(0, prevHits - 3);
  const newExtraHits = Math.max(0, rawNewHits - 3);
  const extraScoringHits = Math.max(0, newExtraHits - previousExtraHits);

  return getTargetPointValue(cricket.targets[row]) * extraScoringHits;
}

export function getClosedPlayers(players) {
  return players
    .map((player, index) => ({ player, index }))
    .filter(entry => entry.player.hits.every(hit => hit >= 3))
    .map(entry => entry.index);
}

export function getLegWinnerIndex(cricket) {
  const closedPlayers = getClosedPlayers(cricket.players);
  if (!closedPlayers.length) return null;

  const maxScore = Math.max(...cricket.players.map(player => player.score));

  for (const playerIndex of closedPlayers) {
    if (cricket.players[playerIndex].score === maxScore || maxScore === 0) {
      return playerIndex;
    }
  }

  return null;
}

export function buildMatchSummary(cricket) {
  return {
    winner: cricket.matchWinner,
    totalLegsPlayed: cricket.completedLegs.length,
    legs: cricket.completedLegs.map(leg => ({
      legNumber: leg.legNumber,
      winnerIndex: leg.winnerIndex,
      winnerName: leg.winnerName,
      score: leg.score
    })),
    players: cricket.players.map((player, index) => ({
      name: player.name,
      legsWon: cricket.legs[index] || 0,
      isMatchWinner: cricket.matchWinner === player.name,
      wonLegs: cricket.completedLegs
        .filter(leg => leg.winnerIndex === index)
        .map(leg => ({
          legNumber: leg.legNumber,
          score: leg.score
        }))
    }))
  };
}

export function recordCompletedCricketMatch(appState, winnerIndex) {
  const cricket = appState.cricket;

  const matchEntry = {
    id: `cricket-${Date.now()}`,
    game: 'cricket',
    playedAt: new Date().toISOString(),
    settings: {
      players: cricket.players.length,
      legsToWin: cricket.legsToWin,
      targets: [...cricket.targets]
    },
    winner: cricket.players[winnerIndex]?.name || 'Okänd',
    players: cricket.players.map((player, index) => ({
      name: player.name,
      color: player.color,
      legsWon: cricket.legs[index] || 0,
      scoreAtMatchEnd: player.score,
      legScores: [...(cricket.legHistory[index] || [])]
    }))
  };

  appState.stats.matches.unshift(matchEntry);
  appState.stats.matches = appState.stats.matches.slice(0, 100);

  cricket.players.forEach((player, index) => {
    const key = getProfileKey(player.name);
    if (!key) return;

    if (!appState.stats.profiles[key]) {
      appState.stats.profiles[key] = {
        name: player.name,
        matchesPlayed: 0,
        matchesWon: 0,
        legsWon: 0,
        totalRecordedPoints: 0,
        lastPlayedAt: null
      };
    }

    const profile = appState.stats.profiles[key];
    profile.name = player.name;
    profile.matchesPlayed += 1;
    profile.legsWon += (cricket.legs[index] || 0);
    profile.totalRecordedPoints += Number(player.score || 0);
    profile.lastPlayedAt = matchEntry.playedAt;

    if (index === winnerIndex) {
      profile.matchesWon += 1;
    }
  });
}
