/*
This script updates `lib/configs/flat/*.js` files from rule's meta data.
*/

import fs from 'fs/promises'
import path from 'path'
import { format, Options } from 'prettier'
import prettierConfig from '../.prettierrc'

import { categories, TCategory } from './utils/categories'

const extendsCategories = {
  csf: null,
  recommended: null,
  'csf-strict': 'csf',
}

const externalRuleOverrides = {
  'react-hooks/rules-of-hooks': 'off',
  'import/no-anonymous-default-export': 'off',
}

function formatRules(rules: TCategory['rules'], exclude?: string[]) {
  const obj = rules.reduce(
    (setting, rule) => {
      if (!exclude?.includes(rule.ruleId)) {
        setting[rule.ruleId] = rule.meta.docs.recommended || 'error'
      }
      return setting
    },
    { ...externalRuleOverrides }
  )

  return JSON.stringify(obj, null, 2)
}

function formatSingleRule(rules: TCategory['rules'], ruleId: string) {
  const ruleOpt = rules.find((rule) => rule.ruleId === ruleId)?.meta.docs.recommended || 'error'

  return JSON.stringify({ [ruleId]: ruleOpt }, null, 2)
}

const SUPPORTED_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs']
const STORIES_GLOBS = [
  `'*.stories.@(${SUPPORTED_EXTENSIONS.join('|')})'`,
  `'*.story.@(${SUPPORTED_EXTENSIONS.join('|')})'`,
]

// Other files that will be linted
const MAIN_JS_FILE = [`'.storybook/main.@(js|cjs|mjs|ts)'`]

function formatCategory(category: TCategory) {
  const extendsCategoryId = extendsCategories[category.categoryId]
  if (extendsCategoryId == null) {
    return `/*
      * IMPORTANT!
      * This file has been automatically generated,
      * in order to update it's content execute "pnpm run update-all"
      */
      export = [
        {
          plugins: {
            get storybook() {
              return require('../../index')
            }
          }
        },
        {
          files: [${STORIES_GLOBS.join(', ')}],
          rules: ${formatRules(category.rules, ['storybook/no-uninstalled-addons'])}
        },
        {
          files: [${MAIN_JS_FILE.join(', ')}],
          rules: ${formatSingleRule(category.rules, 'storybook/no-uninstalled-addons')}
        }
      ]
    `
  }
  return `/*
    * IMPORTANT!
    * This file has been automatically generated,
    * in order to update it's content execute "pnpm run update-all"
    */
    import config from './${extendsCategoryId}'

    export = [
      ...config,
      {
        rules: ${formatRules(category.rules)}
      }
    ]
  `
}

const FLAT_CONFIG_DIR = path.resolve(__dirname, '../lib/configs/flat')

export async function update() {
  // setup config directory
  await fs.mkdir(FLAT_CONFIG_DIR)

  // Update/add rule files
  await Promise.all(
    categories.map(async (category) => {
      const filePath = path.join(FLAT_CONFIG_DIR, `${category.categoryId}.ts`)
      const content = await format(formatCategory(category), {
        parser: 'typescript',
        ...(prettierConfig as Options),
      })

      await fs.writeFile(filePath, content)
    })
  )
}
