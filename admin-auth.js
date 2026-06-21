(function () {
  'use strict';

  const ADMIN_PASSWORD = 'Col79009';
  const SESSION_KEY = 'cityOfInfluenceAdminAuthenticated';

  const loginForm = document.getElementById('adminLoginForm');
  const passwordInput = document.getElementById('adminPassword');
  const loginStatus = document.getElementById('adminLoginStatus');
  const loginButton = document.getElementById('adminLoginButton');
  const logoutButton = document.getElementById('adminLogout');

  function readSession() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  function writeSession(value) {
    try {
      if (value) {
        sessionStorage.setItem(SESSION_KEY, 'true');
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function showLoginStatus(message, isError) {
    if (!loginStatus) return;
    loginStatus.textContent = message || '';
    loginStatus.classList.toggle('is-error', Boolean(isError));
  }

  function openPortal() {
    window.location.replace('admin.html');
  }

  // Separate login page.
  if (loginForm && passwordInput) {
    if (readSession()) {
      openPortal();
      return;
    }

    window.setTimeout(function () {
      passwordInput.focus();
    }, 0);

    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      showLoginStatus('Checking password…', false);

      if (passwordInput.value !== ADMIN_PASSWORD) {
        showLoginStatus('Incorrect password. Please try again.', true);
        passwordInput.select();
        return;
      }

      if (!writeSession(true)) {
        showLoginStatus(
          'Your browser is blocking session storage. Allow website storage and try again.',
          true
        );
        return;
      }

      if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = 'Opening portal…';
      }

      showLoginStatus('Password accepted. Opening the update portal…', false);
      window.setTimeout(openPortal, 120);
    });

    return;
  }

  // Portal-only page.
  if (!readSession()) {
    window.location.replace('login.html');
    return;
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', function () {
      writeSession(false);
      window.location.replace('login.html');
    });
  }
})();
