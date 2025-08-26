import * as path from 'path';

import {
  AcceptLanguageResolver,
  I18nOptions,
  I18nYamlLoader,
  QueryResolver,
} from 'nestjs-i18n';

export const i18nConfig: I18nOptions = {
  fallbackLanguage: 'es',
  loader: I18nYamlLoader,
  loaderOptions: {
    path: path.join(__dirname, '../../locales/'),
    watch: true,
  },
  resolvers: [
    { use: QueryResolver, options: ['lang'] },
    AcceptLanguageResolver,
  ],
};