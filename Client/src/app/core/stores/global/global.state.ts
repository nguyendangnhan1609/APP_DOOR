import initialStateAuth from '@/modules/auth/context/state';
import { TStateGlobal } from './global.type';

/**
 * Represents the initial state for the global module.
 */
export default {
  language: '',
  ...initialStateAuth,
} as TStateGlobal;
