import { apiFetch } from './http';

const apiPath = '/api/items';

export default {
    getItems() {
        return apiFetch(apiPath);
    },

    addItem(text) {
        return apiFetch(apiPath, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
    },

    deleteItem(id) {
        return apiFetch(`${apiPath}/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });
    },

    getAllItems() {
        return apiFetch(`${apiPath}/all`);
    }
};
