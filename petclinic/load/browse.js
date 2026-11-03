// Browsing the PetClinic like a receptionist. Search owners, open one, look at vets.
// Number of users and duration come from the command line, e.g.
// k6 run --vus 20 --duration 2m /tmp/repo/petclinic/load/browse.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const API = __ENV.API || 'http://app:9966/petclinic/api';
const LAST_NAMES = ['Davis', 'Franklin', 'Black', 'McTavish', 'Escobito', 'Schroeder', 'Estaban', 'Coleman', 'Rodriquez'];

function get(path) {
    const res = http.get(`${API}${path}`, { tags: { name: path.split('?')[0].replace(/\/\d+$/, '/{id}') } });
    check(res, { 'status 200': (r) => r.status === 200 });
}

export default function () {
    get(`/owners?lastName=${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`);
    get(`/owners/${1 + Math.floor(Math.random() * 10)}`);
    get('/vets');
    get('/pettypes');
    sleep(1);
}
