// Constant request rate on the demo app for the Micrometer panels.
// RATE is requests per second, DURATION a k6 duration like 3m.
import http from 'k6/http';

export const options = {
    scenarios: {
        constant: {
            executor: 'constant-arrival-rate',
            rate: Number(__ENV.RATE || 50),
            timeUnit: '1s',
            duration: __ENV.DURATION || '3m',
            preAllocatedVUs: 20,
        },
    },
};

export default function () {
    http.get('http://demo-app:8080/api/primes');
}
