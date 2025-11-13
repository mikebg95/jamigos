/**
 * Feature highlights for the home page
 * Extracted to module-level constant to prevent recreation on every render
 *
 * Note: Using icon name strings (not component imports) because icons are
 * globally registered in main.js, allowing Vue to resolve them via <component :is="">
 */

import { Sparkles, Lock, Zap, Globe, Palette, BarChart3 } from 'lucide-vue-next';

export const FEATURES = Object.freeze([
  {
    icon: Sparkles,
    title: 'Smart Organization',
    description: 'Organize your tasks with intelligent categorization and prioritization.'
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with Keycloak authentication to keep your data safe.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with Vue 3 and modern technologies for blazing fast performance.'
  },
  {
    icon: Globe,
    title: 'Access Anywhere',
    description: 'Seamlessly sync across all your devices with cloud-based storage.'
  },
  {
    icon: Palette,
    title: 'Beautiful Design',
    description: 'Intuitive and elegant interface that makes task management a pleasure.'
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    description: 'Monitor your productivity with detailed insights and analytics.'
  }
]);
