/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update it's content execute "pnpm run update-all"
 */
import config from './csf'

export = [
  ...config,
  {
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'import/no-anonymous-default-export': 'off',
      'storybook/no-stories-of': 'error',
      'storybook/no-title-property-in-meta': 'error',
    },
  },
]
