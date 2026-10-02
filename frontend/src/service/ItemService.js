import { apiFetch } from './http';

const ITEMS_API_PATH = '/api/items';

export default {
    getItems() {
        return apiFetch(ITEMS_API_PATH);
    },

    addItem(text) {
        return apiFetch(ITEMS_API_PATH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
    },

    deleteItem(id) {
        return apiFetch(`${ITEMS_API_PATH}/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });
    },

    getAllItems() {
        return apiFetch(`${ITEMS_API_PATH}/all`);
    }
};
