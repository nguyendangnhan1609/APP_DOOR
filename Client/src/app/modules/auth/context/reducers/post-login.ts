import { patchState } from '@ngrx/signals';

import { KEY_REFRESH_TOKEN, KEY_TOKEN, KEY_USER } from '@/shared/constants';
import { EStatusState } from '@/shared/enums';
import { IRequestLogin } from '../../interface';
import ReducerBase from './base';

/**
 * Represents a class for handling login functionality.
 * @class
 */
export default class Reducer extends ReducerBase<IRequestLogin> {
  public constructor() {
    super();
    this.action = async (values: IRequestLogin) => {
      localStorage.setItem(KEY_TOKEN, 'data?.token');
      localStorage.setItem(KEY_REFRESH_TOKEN, 'data?.refreshToken');
      localStorage.setItem(KEY_USER, JSON.stringify(values));
      console.log('Login successful:', values);
      return values;
    };

    this.pending = (state, value) => {
      patchState(state, { data: value });
    };
    this.fulfilled = (state, data) => {
      patchState(state, { user: data ?? {}, data: undefined, status: EStatusState.IsFulfilled });
    };
  }
}
