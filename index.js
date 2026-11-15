const overlay = document.getElementById('overlay');
const frame = document.getElementById('frame');
const title = document.getElementById('gameTitle');
const close = document.getElementById('close');

let previous = null;

document.querySelectorAll('[data-game]').forEach(button => {
  button.addEventListener('click', () => {
    previous = button;
    title.textContent = button.dataset.title;
    frame.src = './' + button.dataset.game + '/index.html';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    close.focus();
  });
});

function shut() {
  overlay.classList.remove('open');
  frame.src = 'about:blank';
  document.body.style.overflow = '';
  previous?.focus();
}

close.addEventListener('click', shut);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) {
    shut();
  }
});