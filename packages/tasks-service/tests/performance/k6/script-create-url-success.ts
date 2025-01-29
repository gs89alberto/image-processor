import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const url = `${__ENV.K6_BASE_URL || 'http://localhost:3000'}/tasks`;
  const payload = JSON.stringify({
    originalPath:
      'https://cdn-jcmfd.nitrocdn.com/fklSPIUlFNcmpIeNIzdpedXJRlOkdpQy/assets/images/optimized/rev-e0a7798/safariafricano.es/wp-content/uploads/sites/8/2024/03/Masai-Mara-lion-2048x1365.jpg',
  });
  const params = { headers: { 'Content-Type': 'application/json' } };

  http.post(url, payload, params);
  sleep(1);
}
