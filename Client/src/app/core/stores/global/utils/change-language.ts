import dayjs from 'dayjs';

import { C_Locale } from '@/shared/constants';

/**
 * Change the language and sets the locale and localeDate accordingly.
 */
export default (language: string) => {
  switch (language) {
    case 'en':
      dayjs.locale(C_Locale.Dayjs.EN);
      break;
    case 'vi':
      dayjs.locale(C_Locale.Dayjs.VI);
      break;
    case 'ja':
      dayjs.locale(C_Locale.Dayjs.JA);
      break;
  }
  localStorage.setItem('i18nextLng', language);
  document.querySelector('html')?.setAttribute('lang', language);
  if (location.hash.split('/').length > 2) {
    location.hash = '#/' + language + '/' + location.hash.split('/').slice(2).join('/');
  }
};
