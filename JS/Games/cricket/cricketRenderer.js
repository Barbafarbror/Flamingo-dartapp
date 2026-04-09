import { APP_STATE } from '../../state.js';
import { escapeHtml } from '../../utils/helpers.js';

export function renderCricketTable() {
  const cricket = APP_STATE.cricket;
  const gameDiv = document.getElementById('cricket-game');
  if (!gameDiv) return;

  let html = '<table class="cricket-table"><tr><th class="label">Nr</th>';

  cricket.players.forEach((player, playerIndex) => {
    html += `
      <th class="player-header" style="background:${player.color};">
        <div class="player-header-box">
          <span class="player-name-display">${escapeHtml(player.name)}</span>
          <button class="edit-name-btn" onclick="openNameEditor(${playerIndex})">✎</button>
        </div>
      </th>
    `;
  });

  html += '</tr>';

  cricket.targets.forEach((target, rowIndex) => {
    html += `<tr><td class="label">${escapeHtml(target)}</td>`;

    cricket.players.forEach((player, playerIndex) => {
      const activeClass = playerIndex === cricket.currentPlayer ? 'active-cell' : '';

      html += `
        <td
          class="player-cell ${activeClass}"
          id="cell-${rowIndex}-${playerIndex}"
          onclick="handleCricketClick(${rowIndex}, ${playerIndex})"
          style="background-color:${player.color};"
        ></td>
      `;
    });

    html += '</tr>';
  });

  html += '<tr><td class="label">Poäng</td>';
  cricket.players.forEach((player, index) => {
    html += `<td class="score-cell" id="score-${index}">${player.score}</td>`;
  });
  html += '</tr>';

  html += '<tr><td class="label">Legs</td>';
  cricket.players.forEach((player, index) => {
    html += `<td class="score-cell" id="legs-${index}">${cricket.legs[index] || 0}</td>`;
  });
  html += '</tr>';

  html += '</table>';

  gameDiv.innerHTML = html;

  cricket.players.forEach((_, playerIndex) => {
    cricket.targets.forEach((__, rowIndex) => {
      updateCricketCell(rowIndex, playerIndex);
    });
  });
}

export function renderCricketMultiButtons() {
  const cricket = APP_STATE.cricket;
  const multiButtonsDiv = document.getElementById('multi-buttons');
  if (!multiButtonsDiv) return;

  multiButtonsDiv.innerHTML = '';

  [1, 2, 3].forEach(value => {
    const button = document.createElement('button');
    button.className = `multi-btn${cricket.multiplier === value ? ' active' : ''}`;
    button.innerText = `X${value}`;
    button.onclick = () => window.selectMultiplier(value);
    multiButtonsDiv.appendChild(button);
  });
}

export function updateCricketCell(row, playerIndex, justClosed = false) {
  const cell = document.getElementById(`cell-${row}-${playerIndex}`);
  if (!cell) return;

  const value = APP_STATE.cricket.players[playerIndex].hits[row];
  cell.classList.remove('closed-flash');

  if (value === 0) {
    cell.innerHTML = '';
  } else if (value === 1) {
    cell.innerHTML = `<span class="mark">/</span>`;
  } else if (value === 2) {
    cell.innerHTML = `<span class="mark">X</span>`;
  } else {
    cell.innerHTML = `
      <svg class="closed-svg" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10.5" stroke="black" stroke-width="2" fill="none"></circle>
        <line x1="7" y1="7" x2="17" y2="17" stroke="black" stroke-width="2"></line>
        <line x1="7" y1="17" x2="17" y2="7" stroke="black" stroke-width="2"></line>
      </svg>
    `;
  }

  if (justClosed) {
    void cell.offsetWidth;
    cell.classList.add('closed-flash');
  }
}
