const API_BASE = 'http://127.0.0.1:3000';

// Utilidades
function qs(id) { return document.getElementById(id); }

// Funciones para manejar el token
function guardarToken(t) { localStorage.setItem('auth_token', t); }
function obtenerToken() { return localStorage.getItem('auth_token'); }
function limpiarToken() { 
  localStorage.removeItem('auth_token'); 
  localStorage.removeItem('auth_user'); 
}
function guardarUsuario(u) { 
  try { 
    localStorage.setItem('auth_user', JSON.stringify(u)); 
  } catch(e){ 
    console.warn('Error al guardar usuario', e); 
  } 
}
function obtenerUsuario() { 
  try { 
    return JSON.parse(localStorage.getItem('auth_user') || 'null'); 
  } catch(e){ 
    console.warn('Error al obtener usuario', e); 
    return null; 
  } 
}

// Función para hacer fetch a la API
async function apiFetch(ruta, opciones = {}) {
  const headers = opciones.headers || {};
  const token = obtenerToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${ruta}`, { ...opciones, headers });
  return res;
}

// Login
const formularioLogin = qs('login-form');
const resultadoLogin = qs('login-result');
if (formularioLogin) {
  formularioLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (resultadoLogin) resultadoLogin.textContent = 'Enviando...';

    const fd = new FormData(formularioLogin);
    const email = (fd.get('email') || '').toString().trim();
    const password = (fd.get('password') || '').toString().trim();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      if (resultadoLogin) resultadoLogin.textContent = 'Introduce un email válido';
      return;
    }
    if (!password || password.length < 6) {
      if (resultadoLogin) resultadoLogin.textContent = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || (data && data.ok === false)) {
        if (resultadoLogin) resultadoLogin.textContent = data?.message || JSON.stringify(data);
        return;
      }

      if (data.token) guardarToken(data.token);
      if (data.user) guardarUsuario(data.user);

      const rol = data.user && data.user.role ? data.user.role : null;
      if (data.redirect) {
        globalThis.location.href = data.redirect;
      } else {
        if (rol) globalThis.location.href = `/dashboard-${rol}.html`;
        else globalThis.location.href = '/dashboard.html';
      }
    } catch (err) {
      if (resultadoLogin) resultadoLogin.textContent = String(err);
    }
  });
}

// Quick login helper used by the UI quick buttons
function quickLogin(email, password) {
  const form = qs('login-form');
  if (!form) return;
  const emailInput = qs('email');
  const passInput = qs('password');
  if (emailInput) emailInput.value = email;
  if (passInput) passInput.value = password;
  // submit the form programmatically
  if (typeof form.requestSubmit === 'function') form.requestSubmit();
  else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

// Registro (página opcional)
const formularioRegistro = qs('register-form');
const resultadoRegistro = qs('register-result');
if (formularioRegistro) {
  formularioRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (resultadoRegistro) resultadoRegistro.textContent = 'Enviando...';

    const fd = new FormData(formularioRegistro);
    const nombre = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const password = (fd.get('password') || '').toString().trim();

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nombre, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (resultadoRegistro) resultadoRegistro.textContent = data?.message || JSON.stringify(data);
        return;
      }
      if (resultadoRegistro) resultadoRegistro.textContent = 'Registro correcto. Ahora puedes iniciar sesión.';
    } catch (err) {
      if (resultadoRegistro) resultadoRegistro.textContent = String(err);
    }
  });
}

// Recuperar contraseña (página opcional)
const formularioOlvido = qs('forgot-form');
const resultadoOlvido = qs('forgot-result');
if (formularioOlvido) {
  formularioOlvido.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (resultadoOlvido) resultadoOlvido.textContent = 'Enviando...';

    const fd = new FormData(formularioOlvido);
    const email = (fd.get('email') || '').toString().trim();

    try {
      const res = await fetch(`${API_BASE}/auth/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (resultadoOlvido) resultadoOlvido.textContent = data?.message || JSON.stringify(data);
        return;
      }
      if (resultadoOlvido) resultadoOlvido.textContent = 'Si el email existe, se ha enviado un código (simulado). Revisa la consola del servidor.';
    } catch (err) {
      if (resultadoOlvido) resultadoOlvido.textContent = String(err);
    }
  });
}

// Dashboard
const selectorRol = qs('role-select');
const botonCargar = qs('load-dashboard');
const resultadoDash = qs('dashboard-result');
const botonCerrar = qs('logout-btn');

if (botonCerrar) {
  botonCerrar.addEventListener('click', () => {
    limpiarToken();
    globalThis.location.href = '/login.html';
  });
}

function mostrarDashboardCliente(data) {
  return `
    <h3>${data.title || 'Dashboard Cliente'}</h3>
    <p><strong>Pagos pendientes:</strong> ${data.pagosPendientes ?? 0}</p>
    <p><strong>Comprobantes:</strong> ${data.comprobantes ?? 0}</p>
    <p><a href="/">Ir al inicio</a></p>
  `;
}

function mostrarDashboardAsistente(data) {
  return `
    <h3>${data.title || 'Dashboard Asistente'}</h3>
    <p><strong>Tareas asignadas:</strong> ${data.tareasAsignadas ?? data.tareas ?? 0}</p>
    <p><strong>Mensajes sin leer:</strong> ${data.mensajesSinLeer ?? 0}</p>
    <p><a href="/">Ir al inicio</a></p>
  `;
}

function mostrarDashboardGerente(data) {
  return `
    <h3>${data.title || 'Dashboard Gerente'}</h3>
    <p><strong>Asistentes:</strong> ${data.asistentes ?? data.asistantsCount ?? 0}</p>
    <p><strong>Ingresos:</strong> ${data.ingresos ?? data.totalIngresos ?? 0}</p>
    <p><a href="/">Ir al inicio</a></p>
  `;
}

async function cargarDashboardPorRol(rol) {
  const contenedor = qs('dashboard-container');
  if (!contenedor) return;
  contenedor.innerHTML = '<em>Cargando...</em>';

  try {
    const token = obtenerToken();
    let res;
    if (token) {
      res = await apiFetch('/dashboard');
    } else {
      res = await fetch(`${API_BASE}/dashboard?role=${encodeURIComponent(rol)}`);
    }
    const data = await res.json();

    const usuario = obtenerUsuario();
    let rolARenderizar = null;
    if (usuario && usuario.role) rolARenderizar = usuario.role;
    else if (rol) rolARenderizar = rol;
    else if (data && data.title) {
      const t = data.title.toLowerCase();
      if (t.includes('cliente')) rolARenderizar = 'cliente';
      else if (t.includes('gerente')) rolARenderizar = 'gerente';
      else if (t.includes('asistente')) rolARenderizar = 'asistente';
    }

    let html = '';
    switch (rolARenderizar) {
      case 'cliente': html = mostrarDashboardCliente(data); break;
      case 'asistente': html = mostrarDashboardAsistente(data); break;
      case 'gerente': html = mostrarDashboardGerente(data); break;
      default: html = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.textContent = String(err);
  }
}

// Reset contraseña (página reset.html)
const formularioReset = qs('reset-form');
const resultadoReset = qs('reset-result');
if (formularioReset) {
  formularioReset.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (resultadoReset) resultadoReset.textContent = 'Enviando...';

    const fd = new FormData(formularioReset);
    const email = (fd.get('email') || '').toString().trim();
    const code = (fd.get('code') || '').toString().trim();
    const newPassword = (fd.get('newPassword') || '').toString().trim();

    if (!email || !code || !newPassword) {
      if (resultadoReset) resultadoReset.textContent = 'Completa todos los campos';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || (data && data.ok === false)) {
        if (resultadoReset) resultadoReset.textContent = data?.message || JSON.stringify(data);
        return;
      }
      if (resultadoReset) resultadoReset.textContent = 'Contraseña restablecida. Serás redirigido al login.';
      setTimeout(() => { globalThis.location.href = '/login.html'; }, 1200);
    } catch (err) {
      if (resultadoReset) resultadoReset.textContent = String(err);
    }
  });
}

if (botonCargar && selectorRol && resultadoDash) {
  botonCargar.addEventListener('click', async () => {
    const rol = selectorRol.value;
    await cargarDashboardPorRol(rol);
  });
}

// Cargar automáticamente el dashboard si estamos en una página de dashboard
if (document.location.pathname.includes('dashboard')) {
  const usuario = obtenerUsuario();
  if (usuario && usuario.role && selectorRol) {
    selectorRol.value = usuario.role;
  }

  const elementoUsuario = qs('current-user');
  if (elementoUsuario) {
    elementoUsuario.textContent = usuario ? `Usuario: ${usuario.name || usuario.email || usuario.role}` : 'Usuario: (no autenticado)';
  }

  const rolPagina = globalThis.__PAGE_ROLE;
  const token = obtenerToken();
  if (token) {
    void cargarDashboardPorRol(rolPagina || (selectorRol ? selectorRol.value : undefined));
  } else if (rolPagina) {
    void cargarDashboardPorRol(rolPagina);
  }
}
