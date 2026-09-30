import { signalStoreFeature, type, withMethods } from '@ngrx/signals';

import { IRequestLogin } from '../interface';
import reducers from './reducers';
import TState from './type';

export default signalStoreFeature(
  { state: type<TState>() },
  withMethods(state => ({
    async postLogin(values: IRequestLogin) {
      reducers.postLogin.reducer(state, values);
    },
  })),
);
