import { EStatusState } from '@/shared/enums';
import type TState from './type';

/**
 * Represents the initial state for the global module.
 */
const initialState: TState = {
  isLoading: false,
  status: EStatusState.Idle,
  user: {},
  data: {},
};

export default initialState;
