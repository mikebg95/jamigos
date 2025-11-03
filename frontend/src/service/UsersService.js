import { apiFetch } from './http';

const apiPath = '/api/users';

export default {
    syncCurrentUser() {
        return apiFetch(`${apiPath}/sync`, {
            method: 'POST',
        });
    },
};