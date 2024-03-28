/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update it's content execute "pnpm run update-all"
 */
export = [
  {
    plugins: {
      get storybook() {
        return require('../../index')
      },
    },
  },
  {
    files: ['*.stories.@(ts|tsx|js|jsx|mjs|cjs)', '*.story.@(ts|tsx|js|jsx|mjs|cjs)'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'import/no-anonymous-default-export': 'off',
      'storybook/csf-component': 'warn',
      'storybook/default-exports': 'error',
      'storybook/hierarchy-separator': 'warn',
      'storybook/no-redundant-story-name': 'warn',
      'storybook/story-exports': 'error',
    },
  },
  {
    files: ['.storybook/main.@(js|cjs|mjs|ts)'],
    rules: {
      'storybook/no-uninstalled-addons': 'error',
    },
  },
]
