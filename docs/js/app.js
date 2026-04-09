import { APP_STATE } from './state.js';
import { loadAppState, saveAppState } from './storage/localStorage.js';
import { renderMenuView } from './views/menuView.js';
import {
  renderCricketView,
  renderCricketSummaryModal,
  renderLegWinnerModal,
  renderNameEditorModal
} from './views/cricketView.js';
import {
  renderCricketTable,
  renderCricketMultiButtons
} from './games/cricket/cricketRenderer.js';
import {
  goToMenu,
  closeSummaryToMenu,
  startNewCricketMatchFromSummary,
  openCricket,
  setCricketPlayerCount,
  updateLegTarget,
  createCricketGame,
  resetCricketMatch,
  newCricketRound,
  nextCricketPlayer,
  undoCricket,
  selectMultiplier,
  setActivePlayer,
  setPlayerColor,
  openNameEditor,
  updateNameEditorValue,
  closeNameEditor,
  saveNameEdit,
  closeLegWinnerModal,
  handleCricketClick
} from './games/cricket/cricketActions.js';

function getViewTitle() {
  if (APP_STATE.currentView === 'cricket') return 'Cricket';
  return "Flamingo's Dartapp";
}

export function setMode(mode) {
  APP_STATE.mode = mode;
  document.body.classList.toggle('dark', mode === 'dark');
  renderApp();
}

export function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <h1 class="title">${getViewTitle()}</h1>
    ${APP_STATE.currentView === 'menu' ? renderMenuView() : renderCricketView(APP_STATE)}
    ${APP_STATE.currentView === 'cricket' && APP_STATE.cricket.showSummary ? renderCricketSummaryModal(APP_STATE.cricket.summaryData) : ''}
    ${renderLegWinnerModal(APP_STATE.ui.legWinnerModal)}
    ${renderNameEditorModal(APP_STATE.ui.nameEditor, APP_STATE.cricket)}
  `;

  if (APP_STATE.currentView === 'cricket') {
    renderCricketTable();
    renderCricketMultiButtons();
  }

  document.body.classList.toggle('dark', APP_STATE.mode === 'dark');
  saveAppState();
}

window.__renderApp = renderApp;

window.setMode = setMode;
window.goToMenu = goToMenu;
window.closeSummaryToMenu = closeSummaryToMenu;
window.startNewCricketMatchFromSummary = startNewCricketMatchFromSummary;
window.openCricket = openCricket;
window.setCricketPlayerCount = setCricketPlayerCount;
window.updateLegTarget = updateLegTarget;
window.createCricketGame = createCricketGame;
window.resetCricketMatch = resetCricketMatch;
window.newCricketRound = newCricketRound;
window.nextCricketPlayer = nextCricketPlayer;
window.undoCricket = undoCricket;
window.selectMultiplier = selectMultiplier;
window.setActivePlayer = setActivePlayer;
window.setPlayerColor = setPlayerColor;
window.openNameEditor = openNameEditor;
window.updateNameEditorValue = updateNameEditorValue;
window.closeNameEditor = closeNameEditor;
window.saveNameEdit = saveNameEdit;
window.closeLegWinnerModal = closeLegWinnerModal;
window.handleCricketClick = handleCricketClick;

loadAppState();
renderApp();
