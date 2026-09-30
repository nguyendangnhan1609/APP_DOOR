import { environment } from '../../../environments/environment';
export * from './api';
export * from './link';
export * from './locale';
/**
 * The key used for user authentication.
 */
export const KEY_USER = 'm8nvn*&hKwcgb^D-D#Hz^5CXfKySpY';
/**
 * The key token used for authentication.
 */
export const KEY_TOKEN = KEY_USER + '1c82558a-29e2-42ba-b14a-47544a4542d7';
/**
 * The refresh token key used for authentication.
 */
export const KEY_REFRESH_TOKEN = KEY_USER + '15c665b7-592f-4b60-b31f-a252579a3bd0';
/**
 * The URL of the API endpoint.
 */
export const LINK_API = environment.URL_API;
/**
 * Represents the constant value for full text search.
 */
export const FULL_TEXT_SEARCH = 'fullTextSearch';
/**
 * Represents a list of supported languages.
 */
export const LIST_LANGUAGE = environment.URL_LANGUAGES.split(',');
/**
 * The language used in the application.
 */
export const LANGUAGE =
  LIST_LANGUAGE.indexOf(location.hash.split('/')[1]) > -1
    ? location.hash.split('/')[1]
    : (localStorage.getItem('i18nextLng') ?? environment.LANGUAGE);
