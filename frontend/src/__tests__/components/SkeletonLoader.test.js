import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SkeletonLoader from '@/components/SkeletonLoaderComponent.vue';

describe('SkeletonLoaderComponent', () => {
  it('renders text skeleton by default', () => {
    const wrapper = mount(SkeletonLoader);

    expect(wrapper.find('.skeleton--text').exists()).toBe(true);
  });

  it('renders specified number of skeletons', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        count: 3,
      },
    });

    expect(wrapper.findAll('.skeleton').length).toBe(3);
  });

  it('renders rect type skeleton', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        type: 'rect',
      },
    });

    expect(wrapper.find('.skeleton--rect').exists()).toBe(true);
  });

  it('renders circle type skeleton', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        type: 'circle',
      },
    });

    expect(wrapper.find('.skeleton--circle').exists()).toBe(true);
  });

  it('renders list type skeleton with multiple items', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        type: 'list',
        count: 3,
      },
    });

    expect(wrapper.findAll('.skeleton-item--list').length).toBe(3);
  });

  it('applies custom width', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        width: '200px',
      },
    });

    const skeleton = wrapper.find('.skeleton');
    expect(skeleton.attributes('style')).toContain('width: 200px');
  });

  it('applies custom height', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        height: '50px',
      },
    });

    const skeleton = wrapper.find('.skeleton');
    expect(skeleton.attributes('style')).toContain('height: 50px');
  });

  it('applies custom gap', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        gap: '1rem',
      },
    });

    const skeletonWrapper = wrapper.find('.skeleton-wrapper');
    expect(skeletonWrapper.attributes('style')).toContain('gap: 1rem');
  });

  it('list type includes circle and text blocks', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        type: 'list',
        count: 1,
      },
    });

    const listItem = wrapper.find('.skeleton-item--list');
    expect(listItem.find('.skeleton--circle').exists()).toBe(true);
    expect(listItem.find('.skeleton-text-block').exists()).toBe(true);
  });

  it('validates type prop', () => {
    const validator = SkeletonLoader.props.type.validator;

    expect(validator('text')).toBe(true);
    expect(validator('rect')).toBe(true);
    expect(validator('circle')).toBe(true);
    expect(validator('list')).toBe(true);
    expect(validator('invalid')).toBe(false);
  });

  it('uses default props when not specified', () => {
    const wrapper = mount(SkeletonLoader);

    expect(wrapper.vm.type).toBe('text');
    expect(wrapper.vm.width).toBe('100%');
    expect(wrapper.vm.height).toBe('1rem');
    expect(wrapper.vm.count).toBe(1);
    expect(wrapper.vm.gap).toBe('0.5rem');
  });
});
