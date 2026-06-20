(function () {
  'use strict';

  const ADMIN_PASSWORD = 'Col79009';
  const SESSION_KEY = 'cityOfInfluenceAdminAuthenticated';

  const login = document.getElementById('adminLogin');
  const app = document.getElementById('adminApp');
  const form = document.getElementById('adminLoginForm');
  const password = document.getElementById('adminPassword');
  const status = document.getElementById('adminLoginStatus');

  let adminScriptLoaded = false;
  let authenticatedInMemory = false;

  function readSession() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch (error) {
      return authenticatedInMemory;
    }
  }

  function writeSession(value) {
    authenticatedInMemory = value;
    try {
      if (value) sessionStorage.setItem(SESSION_KEY, 'true');
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      // Some browsers restrict web storage when local files are opened directly.
      // The in-memory fallback keeps the portal usable for the current tab.
    }
  }

  function showStatus(message, isError) {
    status.textContent = message || '';
    status.classList.toggle('is-error', Boolean(isError));
  }

  function loadAdmin() {
    if (adminScriptLoaded) return;
    adminScriptLoaded = true;

    const script = document.createElement('script');
    script.src = 'admin.js?v=20260620-11';
    script.async = false;
    script.addEventListener('error', function () {
      adminScriptLoaded = false;
      showStatus('The update portal could not load. Confirm that the full website folder, including the assets folder, is present.', true);
      app.hidden = true;
      login.hidden = false;
      password.focus();
    });
    document.body.appendChild(script);
  }

  function unlock() {
    writeSession(true);
    showStatus('', false);
    login.hidden = true;
    app.hidden = false;
    loadAdmin();

    window.setTimeout(function () {
      const firstControl = document.querySelector('#adminApp a, #adminApp button, #adminApp input, #adminApp textarea, #adminApp select');
      if (firstControl) firstControl.focus();
    }, 0);
  }

  function lock() {
    writeSession(false);
    app.hidden = true;
    login.hidden = false;
    password.value = '';
    showStatus('', false);
    password.focus();
  }

  function verifyPassword(value) {
    return value === ADMIN_PASSWORD;
  }

  if (readSession()) {
    unlock();
  } else {
    login.hidden = false;
    app.hidden = true;
    window.setTimeout(function () {
      password.focus();
    }, 0);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    showStatus('Checking password…', false);

    if (verifyPassword(password.value)) {
      unlock();
    } else {
      showStatus('Incorrect password. Please try again.', true);
      password.select();
    }
  });

  document.addEventListener('click', function (event) {
    if (event.target.closest('#adminLogout')) lock();
  });
})();
