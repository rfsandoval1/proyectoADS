import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};


// Ejecutar con: docker run --rm -i grafana/k6 run -e BASE_URL=http://host.docker.internal:4000 - < auth.test.js
const BASE_URL = __ENV.BASE_URL || 'http://host.docker.internal:4000';

export default function () {
  // Test de login
  const loginUrl = `${BASE_URL}/api/v1/auth/login`;

  const payload = JSON.stringify({
    email: 'test@example.com',
    password: 'TestPassword123!',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(loginUrl, payload, params);

  let body;
  try {
    body = res.json();
  } catch (e) {
    body = {};
  }

  check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'response has success field': () => body.success !== undefined,
    'response has accessToken on success': () => {
      if (res.status === 200) {
        return body.accessToken !== undefined;
      }
      return true;
    },
    'response has user on success': () => {
      if (res.status === 200) {
        return body.user !== undefined;
      }
      return true;
    },
  });

  sleep(1);
}

export function testRegister() {
  const registerUrl = `${BASE_URL}/api/v1/auth/register`;

  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const payload = JSON.stringify({
    email: uniqueEmail,
    password: 'TestPassword123!',
    fullName: 'Test User',
    cedula: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    telefono: '0999999999',
    direccion: 'Test Address',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(registerUrl, payload, params);

  let body;
  try {
    body = res.json();
  } catch (e) {
    body = {};
  }

  check(res, {
    'register status is 201 or 409': (r) => r.status === 201 || r.status === 409,
    'register response has success field': () => body.success !== undefined,
  });

  sleep(1);
}

export function testRecoverPassword() {
  const recoverUrl = `${BASE_URL}/api/v1/auth/recover-password`;

  const payload = JSON.stringify({
    email: 'test@example.com',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(recoverUrl, payload, params);

  let body;
  try {
    body = res.json();
  } catch (e) {
    body = {};
  }

  check(res, {
    'recover password status is 200': (r) => r.status === 200,
    'recover response has success true': () => body.success === true,
  });

  sleep(1);
}

export function testHealthCheck() {
  const healthUrl = `${BASE_URL}/health`;

  const res = http.get(healthUrl);

  let body;
  try {
    body = res.json();
  } catch (e) {
    body = {};
  }

  check(res, {
    'health status is 200': (r) => r.status === 200,
    'health response has status ok': () => body.status === 'ok',
    'health response has service name': () => body.service !== undefined,
  });

  sleep(1);
}
