import { vi } from 'vitest';

// 👇 mock BEFORE importing App.vue (so Vitest never loads vue3-spinner)
vi.mock('vue3-spinner', () => ({
    DotLoader: { name: 'DotLoader', render: () => null },
}));

import { mount, RouterLinkStub } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createMemoryHistory } from 'vue-router';
import App from '../App.vue';

const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
});

test('renders app without crashing', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    await router.push('/');
    await router.isReady();

    const wrapper = mount(App, {
        global: {
            plugins: [pinia, router],
            stubs: {
                RouterLink: RouterLinkStub,
                // Stub Lucide icons to prevent warnings
                LayoutGrid: { template: '<div />' },
                CheckSquare: { template: '<div />' },
                Info: { template: '<div />' },
                UserCircle: { template: '<div />' },
                AlertCircle: { template: '<div />' },
                X: { template: '<div />' },
            },
        },
    });

    expect(wrapper.exists()).toBe(true);
});