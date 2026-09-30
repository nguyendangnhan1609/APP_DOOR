import queryString from 'query-string';

import { C_API, C_LINK, KEY_TOKEN, LINK_API } from '@/shared/constants';
import type { TResponses } from '@/shared/types';
import { translate } from '../../app.component';
import { serviceMessage } from './message.service';

/**
 * serviceFetch object for making HTTP requests.
 */
export const serviceFetch = {
  init: () =>
    ({
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: localStorage.getItem(KEY_TOKEN)
          ? 'Bearer ' + localStorage.getItem(KEY_TOKEN)
          : '',
        'Accept-Language': localStorage.getItem('i18nextLng') ?? '',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    }) as RequestInit,
  responsible: async <T>({
    url,
    params = {},
    config,
    headers = {},
    showError = true,
    showMessage = false,
  }: {
    url: string;
    params?: Record<string, unknown>;
    config: RequestInit;
    headers?: RequestInit['headers'];
    showError?: boolean;
    showMessage?: boolean;
  }) => {
    config.headers = { ...config.headers, ...headers };
    const linkParam = queryString.stringify(params, { arrayFormat: 'index' });
    let response = await fetch(
      (url.includes('https://') || url.includes('http://') ? '' : LINK_API) +
        url +
        (linkParam && '?' + linkParam),
      config,
    );
    response = await serviceFetch.checkResponse({ response, url, config, linkParam });

    const res: TResponses<T> = await response.json();
    if (response.ok) {
      if (showMessage && res.message) serviceMessage.success({ content: translate(res.message) });
    } else if (res.message) {
      if (showError) serviceMessage.error({ content: translate(res.message) });
      throw new Error(res.message);
    }
    return res;
  },
  get: <T>({
    url,
    params = {},
    headers,
    showError = true,
    showMessage = false,
  }: {
    url: string;
    params?: Record<string, unknown>;
    headers?: RequestInit['headers'];
    showError?: boolean;
    showMessage?: boolean;
  }) =>
    serviceFetch.responsible<T>({
      url,
      params,
      config: { ...serviceFetch.init(), method: 'GET' },
      headers,
      showError,
      showMessage,
    }),
  post: <T>({
    url,
    values,
    params = {},
    headers,
    showError = true,
    showMessage = true,
  }: {
    url: string;
    values: unknown;
    params?: Record<string, unknown>;
    headers?: RequestInit['headers'];
    showError?: boolean;
    showMessage?: boolean;
  }) =>
    serviceFetch.responsible<T>({
      url,
      params,
      config: { ...serviceFetch.init(), method: 'POST', body: JSON.stringify(values) },
      headers,
      showError,
      showMessage,
    }),
  patch: <T>({
    url,
    values = {},
    params = {},
    headers,
    showError = true,
    showMessage = true,
  }: {
    url: string;
    values: unknown;
    params?: Record<string, unknown>;
    headers?: RequestInit['headers'];
    showError?: boolean;
    showMessage?: boolean;
  }) =>
    serviceFetch.responsible<T>({
      url,
      params,
      config: { ...serviceFetch.init(), method: 'PATCH', body: JSON.stringify(values) },
      headers,
      showError,
      showMessage,
    }),
  put: <T>({
    url,
    values = {},
    params = {},
    headers,
    showError = true,
    showMessage = true,
  }: {
    url: string;
    values: unknown;
    params?: Record<string, unknown>;
    headers?: RequestInit['headers'];
    showError?: boolean;
    showMessage?: boolean;
  }) =>
    serviceFetch.responsible<T>({
      url,
      params,
      config: {
        ...serviceFetch.init(),
        method: 'PUT',
        body: values instanceof FormData ? values : JSON.stringify(values),
      },
      headers,
      showError,
      showMessage,
    }),
  delete: <T>({
    url,
    params = {},
    headers,
    showError = true,
    showMessage = true,
  }: {
    url: string;
    params?: Record<string, unknown>;
    headers?: RequestInit['headers'];
    showError?: boolean;
    showMessage?: boolean;
  }) =>
    serviceFetch.responsible<T>({
      url,
      params,
      config: { ...serviceFetch.init(), method: 'DELETE' },
      headers,
      showError,
      showMessage,
    }),
  checkResponse: async ({
    response,
    url,
  }: {
    response: Response;
    url: string;
    config: RequestInit;
    linkParam: string;
  }) => {
    if (response.status === 401 && url !== C_API.AuthLogin) {
      localStorage.removeItem(KEY_TOKEN);
      location.href =
        location.href.replace(location.hash, '') +
        location.hash.split('/').slice(0, 2).join('/') +
        C_LINK.AuthLogin;
    }
    return response;
  },
};
