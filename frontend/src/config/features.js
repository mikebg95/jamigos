/**
 * Feature highlights for the Jamigos home page
 * Extracted to module-level constant to prevent recreation on every render
 *
 * Note: Using icon name strings (not component imports) because icons are
 * globally registered in main.js, allowing Vue to resolve them via <component :is="">
 */

import { Calendar, Sparkles, Upload, Search, Video, UserCircle } from 'lucide-vue-next';

export const FEATURES = Object.freeze([
  {
    icon: Calendar,
    title: 'Create & Join Sessions',
    description: 'Schedule jam sessions, set your genre preferences, and invite musicians in your area or online.'
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description: 'Smart algorithms connect you with musicians who match your skill level, style, and availability.'
  },
  {
    icon: Upload,
    title: 'Upload & Showcase',
    description: 'Record your sessions and share them on your profile. Build a portfolio that shows what you can do.'
  },
  {
    icon: Search,
    title: 'Discover Musicians',
    description: 'Explore profiles, listen to recordings, and find your next collaborator or bandmate.'
  },
  {
    icon: Video,
    title: 'Video & Audio',
    description: 'Join virtual jam sessions with high-quality audio/video, or meet up in person.'
  },
  {
    icon: UserCircle,
    title: 'Build Your Profile',
    description: 'Showcase your instruments, genres, influences, and past sessions. Let your music speak.'
  }
]);
