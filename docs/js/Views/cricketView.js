import { escapeHtml } from '../utils/helpers.js';
import { DEFAULT_PLAYER_COLORS } from '../state.js';

function renderActivePlayerButtons(cricket) {
  if (!cricket.players.length) {
    return `<div class="muted">Starta ett spel för att välja aktiv spelare.</div>`;
  }

  return `
    <div class="player-chip-row">
      ${cricket.players.map((player, index) => `
        <button
          class="player-chip ${index === cricket.currentPlayer ? 'active' : ''}"
          onclick="setActivePlayer(${index})"
        >
          ${escapeHtml(player.name)}
        </button>
      `).join('')}
    </div>
  `;
}

function renderColorPickers(cricket) {
  if (!cricket.players.length) {
    return `<div class="muted">Starta ett spel först, sedan kan du välja färger.</div>`;
  }

  return `
    <div class="form-row">
      ${cricket.players.map((player, playerIndex) => `
        <div class="player-mini-card">
          <div class="player-mini-card-title">
            <span>${escapeHtml(player.name)}</span>
            <button class="button small" onclick="openNameEditor(${playerIndex})">Byt namn</button>
          </div>

          <div class="swatch-row">
            ${DEFAULT_PLAYER_COLORS.map(color => `
              <button
                class="color-swatch ${player.color === color ? 'active' : ''}"
                style="background:${color};"
                onclick="setPlayerColor(${playerIndex}, '${color}')"
                title="Välj färg"
              ></button>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderCricketView(appState) {
  const cricket = appState.cricket;
  const activeName = cricket.players[cricket.currentPlayer]?.name || 'Ingen';
  const winnerText = cricket.matchWinner
    ? `Matchvinnare: ${cricket.matchWinner}`
    : `Först till ${cricket.legsToWin} legs`;

  return `
    <section class="layout">
      <aside class="sidebar card">
        <div class="sidebar-grid-tablet">
          <div class="section">
            <p class="section-title">Navigation</p>
            <div class="button-stack">
              <button class="button" onclick="goToMenu()">Till startmenyn</button>
            </div>
          </div>

          <div class="section">
            <p class="section-title">Matchinställningar</p>

            <label for="playerCount">Antal spelare (1–4)</label>
            <select id="playerCount" onchange="setCricketPlayerCount(this.value)">
              <option value="1" ${cricket.lastPlayerCount === 1 ? 'selected' : ''}>1</option>
              <option value="2" ${cricket.lastPlayerCount === 2 ? 'selected' : ''}>2</option>
              <option value="3" ${cricket.lastPlayerCount === 3 ? 'selected' : ''}>3</option>
              <option value="4" ${cricket.lastPlayerCount === 4 ? 'selected' : ''}>4</option>
            </select>

            <label for="legsToWin" style="margin-top:10px;">Först till antal legs</label>
            <select id="legsToWin" onchange="updateLegTarget(this.value)">
              <option value="1" ${cricket.legsToWin === 1 ? 'selected' : ''}>1</option>
              <option value="2" ${cricket.legsToWin === 2 ? 'selected' : ''}>2</option>
              <option value="3" ${cricket.legsToWin === 3 ? 'selected' : ''}>3</option>
              <option value="5" ${cricket.legsToWin === 5 ? 'selected' : ''}>5</option>
              <option value="7" ${cricket.legsToWin === 7 ? 'selected' : ''}>7</option>
            </select>
          </div>

          <div class="section">
            <p class="section-title">Matchkontroller</p>
            <div class="button-stack">
              <button class="button primary" onclick="createCricketGame()">Starta spel</button>
              <button class="button" onclick="newCricketRound()">Ny omgång</button>
              <button class="button" onclick="nextCricketPlayer()">Nästa spelare</button>
              <button class="button" onclick="undoCricket()">Ångra senaste klick</button>
              <button class="button" onclick="resetCricketMatch()">Nollställ match</button>
            </div>
          </div>

          <div class="section">
            <p class="section-title">Tema</p>
            <div class="mode-row">
              <button class="button" onclick="setMode('light')">Light</button>
              <button class="button" onclick="setMode('dark')">Dark</button>
            </div>
          </div>

          <div class="section">
            <p class="section-title">Aktiv spelare</p>
            ${renderActivePlayerButtons(cricket)}
          </div>

          <div class="section">
            <p class="section-title">Kastmultipel</p>
            <div id="multi-buttons" class="multi-row"></div>
            <div class="hint">
              Du kan klicka direkt i en spelares kolumn. Den spelaren blir aktiv direkt.
            </div>
          </div>

          <div class="section">
            <p class="section-title">Spelarfärger & namn</p>
            ${renderColorPickers(cricket)}
          </div>
        </div>
      </aside>

      <main class="view-shell">
        <div class="board-header">
          <div>
            <h3>Cricket Matchcenter</h3>
            <div class="sub">
              Registrera träffar, håll turordningen tydlig och följ legs, poäng och aktiv spelare i realtid.
            </div>
          </div>
          <div class="status-pill">${appState.mode === 'dark' ? 'Dark mode' : 'Light mode'}</div>
        </div>

        <div class="turn-panel">
          <p class="turn-panel-title">Turflöde</p>
          <div class="turn-panel-text">${escapeHtml(cricket.turnMessage)}</div>
        </div>

        <div class="board-banner">
          <div class="badge active-player">Aktiv spelare: ${escapeHtml(activeName)}</div>
          <div class="badge">${escapeHtml(winnerText)}</div>
          <div class="badge">Aktiv multipel: X${cricket.multiplier}</div>
        </div>

        <div class="board-area">
          <div id="cricket-game"></div>
        </div>
      </main>
    </section>
  `;
}

export function renderCricketSummaryModal(summary) {
  if (!summary) return '';

  const playerCards = summary.players.map(player => {
    const wonLegs = Array.isArray(player.wonLegs) ? player.wonLegs : [];

    const wonLegText = wonLegs.length
      ? wonLegs.map(leg => `Leg ${leg.legNumber}`).join(', ')
      : 'Inga vunna legs';

    return `
      <article class="summary-player-card ${player.isMatchWinner ? 'winner' : ''}">
        <div class="summary-player-top">
          <div class="summary-player-name-wrap">
            <div class="summary-player-name">${escapeHtml(player.name)}</div>
            ${player.isMatchWinner ? '<div class="summary-player-badge">Matchvinnare</div>' : ''}
          </div>
          <div class="summary-player-legs">${player.legsWon} legs</div>
        </div>

        <div class="summary-player-meta">
          <div><strong>Vunna legs:</strong> ${escapeHtml(wonLegText)}</div>
        </div>
      </article>
    `;
  }).join('');

  const legRows = Array.isArray(summary.legs)
    ? summary.legs.map(leg => `
        <div class="summary-leg-row">
          <div class="summary-leg-number">Leg ${leg.legNumber}</div>
          <div class="summary-leg-winner">${escapeHtml(leg.winnerName)}</div>
          <div class="summary-leg-score">${leg.score} poäng</div>
        </div>
      `).join('')
    : '';

  return `
    <div class="modal-overlay">
      <div class="modal-card summary-report-card">
        <div class="summary-hero">
          <div>
            <h3 class="modal-title">Matchrapport</h3>
            <div class="muted">
              ${escapeHtml(summary.winner)} vann matchen efter ${summary.totalLegsPlayed || 0} spelade legs.
            </div>
          </div>
          <div class="summary-hero-winner">
            <span class="summary-hero-label">Vinnare</span>
            <span class="summary-hero-name">${escapeHtml(summary.winner)}</span>
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-section-title">Spelaröversikt</div>
          <div class="summary-player-grid">
            ${playerCards}
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-section-title">Leg för leg</div>
          <div class="summary-legs-list">
            ${legRows || '<div class="muted">Ingen legdata tillgänglig.</div>'}
          </div>
        </div>

        <div class="modal-actions">
          <button class="button primary" onclick="startNewCricketMatchFromSummary()">Starta ny match</button>
          <button class="button" onclick="closeSummaryToMenu()">Gå till startmenyn</button>
        </div>
      </div>
    </div>
  `;
}

export function renderLegWinnerModal(modalState) {
  if (!modalState.open) return '';

  return `
    <div class="modal-overlay">
      <div class="modal-card">
        <h3 class="modal-title">Leg klart</h3>
        <div class="muted">${escapeHtml(modalState.message)}</div>

        <div class="modal-actions">
          <button class="button primary" onclick="closeLegWinnerModal()">Starta nästa leg</button>
        </div>
      </div>
    </div>
  `;
}

export function renderNameEditorModal(uiState, cricket) {
  if (!uiState.open || uiState.playerIndex === null) return '';

  const currentPlayer = cricket.players[uiState.playerIndex];
  if (!currentPlayer) return '';

  return `
    <div class="modal-overlay">
      <div class="modal-card" style="max-width:520px;">
        <h3 class="modal-title">Byt spelarnamn</h3>

        <div class="muted" style="margin-bottom:12px;">
          Nuvarande namn: ${escapeHtml(currentPlayer.name)}
        </div>

        <label for="playerNameEdit">Nytt namn</label>
        <input
          id="playerNameEdit"
          type="text"
          maxlength="20"
          value="${escapeHtml(uiState.value)}"
          oninput="updateNameEditorValue(this.value)"
        />

        <div class="modal-actions">
          <button class="button primary" onclick="saveNameEdit()">Spara namn</button>
          <button class="button" onclick="closeNameEditor()">Avbryt</button>
        </div>
      </div>
    </div>
  `;
}
