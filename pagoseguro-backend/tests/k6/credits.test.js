import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

// Ejecutar con: docker run --rm -i grafana/k6 run -e BASE_URL=http://host.docker.internal:4000 - < credits.test.js
const BASE_URL = __ENV.BASE_URL || 'http://host.docker.internal:4000';

export default function runCreditsTest() {
  // Primero autenticarse
  const loginUrl = `${BASE_URL}/api/v1/auth/login`;

  const loginPayload = JSON.stringify({
    email: 'oswaldoj.tipan@gmail.com',
    password: 'Trabatrix2@',
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginRes = http.post(loginUrl, loginPayload, loginParams);

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });

  if (loginRes.status !== 200) {
    console.log('Login failed, skipping credits test');
    sleep(1);
    return;
  }

  let loginBody;
  try {
    loginBody = loginRes.json();
  } catch (err) {
    console.log('Failed to parse login response:', err.message);
    sleep(1);
    return;
  }

  const token = loginBody.accessToken;
  if (!token) {
    console.log('No access token received');
    sleep(1);
    return;
  }

  // Obtener créditos del usuario autenticado
  const myCreditsUrl = `${BASE_URL}/api/v1/credits/my`;

  const creditsParams = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const myCreditsRes = http.get(myCreditsUrl, creditsParams);

  let myCreditsBody;
  try {
    myCreditsBody = myCreditsRes.json();
  } catch (err) {
    myCreditsBody = {};
  }

  check(myCreditsRes, {
    'my credits status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'my credits response has data': () => {
      return myCreditsRes.status === 200 ? Array.isArray(myCreditsBody) || myCreditsBody.credits !== undefined : true;
    },
  });

  // Listar todos los créditos (si tiene permisos)
  const listCreditsUrl = `${BASE_URL}/api/v1/credits`;

  const listCreditsRes = http.get(listCreditsUrl, creditsParams);

  let listCreditsBody;
  try {
    listCreditsBody = listCreditsRes.json();
  } catch (err) {
    listCreditsBody = {};
  }

  check(listCreditsRes, {
    'list credits status is 200 or 403': (r) => r.status === 200 || r.status === 403 || r.status === 401,
  });

  sleep(1);
}

export function testCreateCredit() {
  const loginUrl = `${BASE_URL}/api/v1/auth/login`;

  const loginPayload = JSON.stringify({
    email: 'admin@example.com',
    password: 'AdminPassword123!',
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginRes = http.post(loginUrl, loginPayload, loginParams);

  if (loginRes.status !== 200) {
    sleep(1);
    return;
  }

  let loginBody;
  try {
    loginBody = loginRes.json();
  } catch (err) {
    sleep(1);
    return;
  }

  const token = loginBody.accessToken;
  if (!token) {
    sleep(1);
    return;
  }

  // Crear un crédito
  const createCreditUrl = `${BASE_URL}/api/v1/credits`;

  const creditPayload = JSON.stringify({
    userId: 'test-user-id',
    amount: 1000,
    term: 12,
    interestRate: 12,
    description: 'K6 Test Credit',
  });

  const creditParams = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const createRes = http.post(createCreditUrl, creditPayload, creditParams);

  let createBody;
  try {
    createBody = createRes.json();
  } catch (err) {
    createBody = {};
  }

  check(createRes, {
    'create credit status is 201 or 403': (r) => r.status === 201 || r.status === 403 || r.status === 401,
    'create credit returns credit data': () => {
      if (createRes.status === 201) {
        return createBody.id !== undefined || createBody.credit !== undefined;
      }
      return true;
    },
  });

  sleep(1);
}

export function testHealthCheck() {
  const healthUrl = `${BASE_URL}/health`;

  const res = http.get(healthUrl);

  let body;
  try {
    body = res.json();
  } catch (err) {
    body = {};
  }

  check(res, {
    'health status is 200': (r) => r.status === 200,
    'health response has status ok': () => body.status === 'ok',
  });

  sleep(1);
}
