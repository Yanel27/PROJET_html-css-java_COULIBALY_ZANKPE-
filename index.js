// ARCADE 84 : interactions du portail, sans bibliothèque externe.
const overlay = document.getElementById('overlay');
const frame = document.getElementById('frame');
const gameTitle = document.getElementById('gameTitle');
const closeButton = document.getElementById('close');
let previousButton = null;

// Les pages Accueil et Nos jeux contiennent la fenêtre de jeu.
if (overlay && frame && gameTitle && closeButton) {
  document.querySelectorAll('[data-game]').forEach(button => {
    button.addEventListener('click', () => {
      previousButton = button;
      gameTitle.textContent = button.dataset.title || 'Jeu';
      frame.src = './' + button.dataset.game + '/index.html';
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    });
  });

  function shut() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    frame.src = 'about:blank';
    document.body.style.overflow = '';
    if (previousButton) previousButton.focus();
  }

  closeButton.addEventListener('click', shut);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay.classList.contains('open')) shut();
  });
}

// Recherche et filtres sur la page Nos jeux.
const gameSearch = document.getElementById('game-search');
const filters = document.querySelectorAll('[data-filter]');
const catalogCards = document.querySelectorAll('.catalog-grid [data-game]');
const gameCount = document.getElementById('game-count');
const emptyGames = document.getElementById('empty-games');
let activeFilter = 'tous';

function filterGames() {
  const search = gameSearch ? gameSearch.value.trim().toLocaleLowerCase('fr') : '';
  let visible = 0;
  catalogCards.forEach(card => {
    const categoryMatches = activeFilter === 'tous' || card.dataset.category === activeFilter;
    const textMatches = (card.dataset.search || '').includes(search);
    card.hidden = !(categoryMatches && textMatches);
    if (!card.hidden) visible++;
  });
  if (gameCount) gameCount.textContent = visible + (visible > 1 ? ' jeux disponibles' : ' jeu disponible');
  if (emptyGames) emptyGames.hidden = visible !== 0;
}

if (gameSearch) gameSearch.addEventListener('input', filterGames);
filters.forEach(filter => {
  filter.addEventListener('click', () => {
    activeFilter = filter.dataset.filter;
    filters.forEach(item => {
      const selected = item === filter;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    filterGames();
  });
});

// Les jeux enregistrent leurs records dans localStorage.
// Nous les lisons sans modifier les fichiers des jeux.
const recordKeys = {
  'snake': 'snake_best_v1',
  'pong': 'paddleduel_best_v1',
  'casse-briques': 'breakout_best_v1',
  'course-retro': 'dino_run_best_v1',
  'space-invaders': 'stardefender_best_v1',
  'blocs-retro': 'blockdrop_best_v1'
};

function getRecord(slug) {
  try {
    if (slug === 'labyrinthe') {
      const data = JSON.parse(localStorage.getItem('maze_muncher_best_v1') || '{}');
      return Number(data.best) > 0 ? String(data.best) + ' points' : '—';
    }
    if (slug === 'memory') {
      const data = JSON.parse(localStorage.getItem('memory_match_best_v1') || '{}');
      const results = Object.values(data).filter(result => result && Number(result.moves) > 0);
      if (!results.length) return '—';
      return Math.min(...results.map(result => Number(result.moves))) + ' coups (meilleur mode enregistré)';
    }
    const score = Number(localStorage.getItem(recordKeys[slug]));
    return score > 0 ? String(score) + (slug === 'pong' ? ' échanges' : ' points') : '—';
  } catch (error) {
    return 'Indisponible';
  }
}

function updateRecords() {
  document.querySelectorAll('[data-record]').forEach(cell => {
    cell.textContent = getRecord(cell.dataset.record);
  });
}
if (document.querySelector('[data-record]')) {
  updateRecords();
  const refresh = document.getElementById('refresh-records');
  if (refresh) refresh.addEventListener('click', updateRecords);
}

// Formulaire de démonstration : les avis restent uniquement sur cet appareil.
const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', event => {
    event.preventDefault();
    const status = document.getElementById('feedback-status');
    const name = document.getElementById('feedback-name').value.trim();
    const message = document.getElementById('feedback-message').value.trim();
    status.className = 'form-status';
    if (name.length < 2 || message.length < 10) {
      status.textContent = 'Indique un pseudo (2 caractères minimum) et un avis (10 caractères minimum).';
      status.classList.add('error');
      return;
    }
    try {
      localStorage.setItem('arcade84_feedback', JSON.stringify({ name, message }));
      status.textContent = 'Avis enregistré sur cet appareil. Aucun message n’a été envoyé.';
      status.classList.add('success');
      feedbackForm.reset();
    } catch (error) {
      status.textContent = 'Le stockage local est indisponible sur ce navigateur.';
      status.classList.add('error');
    }
  });
}
