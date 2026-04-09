export function renderMenuView() {
  return `
    <section class="menu-shell">
      <div class="top-actions">
        <button class="button" onclick="setMode('light')">Light mode</button>
        <button class="button" onclick="setMode('dark')">Dark mode</button>
      </div>

      <div class="menu-grid">
        <article class="menu-card">
          <span class="tag">Redo nu</span>
          <h3>Cricket</h3>
          <p>
            Det spel vi bygger just nu. Scorecard, multiplikatorer, ångra,
            legs, turordning, färgval, namnredigering och lokal sparning finns.
          </p>
          <button class="button primary" onclick="openCricket()">Öppna Cricket</button>
        </article>

        <article class="menu-card">
          <span class="tag">Kommer senare</span>
          <h3>501</h3>
          <p>Klassiskt nedräkningsspel med tydlig matchlogik och senare valbara regler.</p>
          <button class="button" disabled>Inte aktiv ännu</button>
        </article>

        <article class="menu-card">
          <span class="tag">Kommer senare</span>
          <h3>JDC Challenge</h3>
          <p>Perfekt träningsläge för struktur, progression och statistik.</p>
          <button class="button" disabled>Inte aktiv ännu</button>
        </article>

        <article class="menu-card">
          <span class="tag">Kommer senare</span>
          <h3>Tactics</h3>
          <p>Ett bra träningsspel som passar väldigt bra i en modulär dartplattform.</p>
          <button class="button" disabled>Inte aktiv ännu</button>
        </article>

        <article class="menu-card">
          <span class="tag">Kommer senare</span>
          <h3>121 Challenge</h3>
          <p>Checkpoint-baserat träningsläge som senare kan kopplas till profil och statistik.</p>
          <button class="button" disabled>Inte aktiv ännu</button>
        </article>

        <article class="menu-card">
          <span class="tag">Kommer senare</span>
          <h3>Klubbfunktioner</h3>
          <p>Turneringar, profiler, historik, admin och sparad statistik kommer byggas senare.</p>
          <button class="button" disabled>Inte aktiv ännu</button>
        </article>
      </div>
    </section>
  `;
}
