import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ErrorAlert from '@/components/ErrorAlertComponent.vue';

// Mock Lucide icons
vi.mock('lucide-vue-next', () => ({
  AlertCircle: { name: 'AlertCircle', template: '<div class="alert-circle-icon" />' },
  X: { name: 'X', template: '<div class="x-icon" />' },
}));

describe('ErrorAlertComponent', () => {
  it('renders the error message', () => {
    const wrapper = mount(ErrorAlert, {
      props: {
        message: 'Test error message',
      },
    });

    expect(wrapper.text()).toContain('Test error message');
  });

  it('renders with error type by default', () => {
    const wrapper = mount(ErrorAlert, {
      props: {
        message: 'Test error',
      },
    });

    const alert = wrapper.find('.error-alert');
    expect(alert.classes()).toContain('error-alert--error');
  });

  it('renders with warning type when specified', () => {
    const wrapper = mount(ErrorAlert, {
      props: {
        message: 'Test warning',
        type: 'warning',
      },
    });

    const alert = wrapper.find('.error-alert');
    expect(alert.classes()).toContain('error-alert--warning');
  });

  it('renders with info type when specified', () => {
    const wrapper = mount(ErrorAlert, {
      props: {
        message: 'Test info',
        type: 'info',
      },
    });

    const alert = wrapper.find('.error-alert');
    expect(alert.classes()).toContain('error-alert--info');
  });

  it('shows dismiss button by default', () => {
    const wrapper = mount(ErrorAlert, {
      props: {
        message: 'Test error',
      },
    });

    expect(wrapper.find('.error-alert__dismiss').exists()).toBe(true);
  });

  it('hides dismiss button when dismissible is false', () => {
    const wrapper = mount(ErrorAlert, {
      props: {
        message: 'Test error',
        dismissible: false,
      },
    });

    expect(wrapper.find('.error-alert__dismiss').exists()).toBe(false);
  });

  it('emits dismiss event when dismiss button is clicked', async () => {
    const wrapper = mount(ErrorAlert, {
      props: {
        message: 'Test error',
      },
    });

    await wrapper.find('.error-alert__dismiss').trigger('click');

    expect(wrapper.emitted()).toHaveProperty('dismiss');
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  it('hides alert when dismissed', async () => {
    const wrapper = mount(ErrorAlert, {
      props: {
        message: 'Test error',
      },
    });

    expect(wrapper.find('.error-alert').exists()).toBe(true);

    await wrapper.find('.error-alert__dismiss').trigger('click');

    // Wait for transition
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.error-alert').exists()).toBe(false);
  });

  it('has proper ARIA attributes', () => {
    const wrapper = mount(ErrorAlert, {
      props: {
        message: 'Test error',
      },
    });

    const alert = wrapper.find('.error-alert');
    expect(alert.attributes('role')).toBe('alert');
    expect(alert.attributes('aria-live')).toBe('assertive');
  });

  it('has accessible dismiss button label', () => {
    const wrapper = mount(ErrorAlert, {
      props: {
        message: 'Test error',
      },
    });

    const dismissButton = wrapper.find('.error-alert__dismiss');
    expect(dismissButton.attributes('aria-label')).toBe('Dismiss error message');
  });
});
