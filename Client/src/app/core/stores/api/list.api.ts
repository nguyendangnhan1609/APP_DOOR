import { injectQuery } from '@tanstack/angular-query-experimental';

import config from './config.api';
import type Props from './type.api';

export default <TData, TParam>({
  url,
  valueParam,
  keyParam,
  isAddParamEmpty,
}: Props<TData, TParam>) =>
  injectQuery<TData[]>(
    config<TData, TParam>({ url, valueParam, keyParam, isAddParamEmpty }) as never,
  );
