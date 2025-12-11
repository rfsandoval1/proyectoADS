const API_BASE = 'http://127.0.0.1:3000';

// Login form
const loginForm = document.getElementById('login-form');
const loginResult = document.getElementById('login-result');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginResult.textContent = 'Enviando...';

  const fd = new FormData(loginForm);
  const payload = {
    email: fd.get('email'),
    password: fd.get('password'),
  };

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    loginResult.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    loginResult.textContent = String(err);
  }
});

// Dashboard
const roleSelect = document.getElementById('role-select');
const loadBtn = document.getElementById('load-dashboard');
const dashRes = document.getElementById('dashboard-result');

loadBtn.addEventListener('click', async () => {
  const role = roleSelect.value;
  dashRes.textContent = 'Cargando...';
  try {
    const res = await fetch(`${API_BASE}/dashboard?role=${encodeURIComponent(role)}`);
    const data = await res.json();
    dashRes.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    dashRes.textContent = String(err);
  }
});
