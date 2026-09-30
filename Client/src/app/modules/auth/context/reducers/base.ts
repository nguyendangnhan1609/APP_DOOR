import { patchState, WritableStateSource } from '@ngrx/signals';

import type { TStateGlobal } from '@/core/stores';
import { EStatusState } from '@/shared/enums';

/**
 * HReducer class represents a reducer for global state.
 * It handles pending, fulfilled, and rejected actions.
 */
export default class RAuthBase<T> {
  public action?: (value: T) => Promise<T>;
  public reducer;
  public pending!: (state: WritableStateSource<TStateGlobal>, value: T) => void;
  public fulfilled!: (
    state: WritableStateSource<TStateGlobal>,
    value: Record<string, string | undefined>,
  ) => void;
  public rejected!: (state: WritableStateSource<TStateGlobal>, value: unknown) => void;
  public constructor() {
    this.reducer = async (state: WritableStateSource<TStateGlobal>, value: T) => {
      patchState(state, { isLoading: true, status: EStatusState.Idle });
      this.pending(state, value);
      try {
        const res = (await this.action?.(value)) ?? {};
        patchState(state, { isLoading: false });
        this.fulfilled(state, res);
      } catch (e) {
        patchState(state, { isLoading: false });
        this.rejected(state, e);
      }
    };
  }
}
