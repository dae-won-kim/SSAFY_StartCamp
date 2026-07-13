(() => {
  const storageKey = 'daewon-tmi-disabled';
  const versionKey = 'daewon-tmi-access-version';
  const stateVersion = '2';
  const requiredKeys = new Set(['1', '2', '3', '4']);
  const pressedKeys = new Set();
  let combinationHandled = false;

  if (localStorage.getItem(versionKey) !== stateVersion) {
    localStorage.setItem(storageKey, 'true');
    localStorage.setItem(versionKey, stateVersion);
  }

  const isTmiPage = () => decodeURIComponent(window.location.pathname).toLowerCase().endsWith('/tmi.html');

  function isDisabled() {
    return localStorage.getItem(storageKey) === 'true';
  }

  function updateTmiLinks(disabled) {
    document.querySelectorAll('a[href="tmi.html"], a[data-tmi-href]').forEach(link => {
      if (disabled) {
        link.dataset.tmiHref = link.getAttribute('href') || 'tmi.html';
        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
        link.setAttribute('tabindex', '-1');
        link.classList.add('hidden');
        link.title = 'TMI is currently disabled';
      } else {
        link.setAttribute('href', link.dataset.tmiHref || 'tmi.html');
        link.removeAttribute('aria-disabled');
        link.removeAttribute('tabindex');
        link.classList.remove('hidden');
        link.removeAttribute('title');
        delete link.dataset.tmiHref;
      }
    });
  }

  function notify(disabled) {
    const isKorean = document.documentElement.lang === 'ko';
    const message = disabled
      ? (isKorean ? 'TMI가 비활성화되었습니다.' : 'TMI has been disabled.')
      : (isKorean ? 'TMI가 다시 활성화되었습니다.' : 'TMI has been enabled.');

    if (typeof window.showToast === 'function') window.showToast(message);
  }

  function setDisabled(disabled, redirect = true) {
    localStorage.setItem(storageKey, String(disabled));
    updateTmiLinks(disabled);
    notify(disabled);

    if (disabled && redirect && isTmiPage()) {
      window.setTimeout(() => window.location.replace('ssafy.html'), 450);
    }
  }

  function toggleTmiAccess() {
    setDisabled(!isDisabled());
  }

  document.addEventListener('keydown', event => {
    if (!requiredKeys.has(event.key)) return;
    pressedKeys.add(event.key);

    if (!combinationHandled && [...requiredKeys].every(key => pressedKeys.has(key))) {
      combinationHandled = true;
      toggleTmiAccess();
    }
  });

  document.addEventListener('keyup', event => {
    pressedKeys.delete(event.key);
    if (![...requiredKeys].every(key => pressedKeys.has(key))) combinationHandled = false;
  });

  window.addEventListener('blur', () => {
    pressedKeys.clear();
    combinationHandled = false;
  });

  updateTmiLinks(isDisabled());
  if (isDisabled() && isTmiPage()) window.location.replace('ssafy.html');
})();
