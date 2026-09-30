import { injectQuery } from '@tanstack/angular-query-experimental';

import { serviceFetch } from '@/core/services';

export default <TData>({ url, param }: { url: string; param: string }) =>
  injectQuery<TData | undefined>(() => ({
    queryKey: [url, param],
    queryFn: async () =>
      param ? (await serviceFetch.get<TData>({ url: url + '/' + param })).data : undefined,
  }));
