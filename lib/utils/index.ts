import { IncludeExcludeOptions, isExportStory } from '@storybook/csf'

import { ASTUtils, TSESTree, TSESLint } from '@typescript-eslint/utils'

import {
  isFunctionDeclaration,
  isIdentifier,
  isObjectExpression,
  isSpreadElement,
  isTSAsExpression,
  isTSSatisfiesExpression,
  isVariableDeclaration,
  isVariableDeclarator,
} from './ast'

export const docsUrl = (ruleName: string) =>
  `https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/${ruleName}.md`

export const getMetaObjectExpression = (
  node: TSESTree.ExportDefaultDeclaration,
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>
) => {
  let meta: TSESTree.ExportDefaultDeclaration['declaration'] | null = node.declaration
  if (isIdentifier(meta)) {
    const variable = ASTUtils.findVariable(context.getScope(), meta.name)
    const decl = variable && variable.defs.find((def) => isVariableDeclarator(def.node))
    if (decl && isVariableDeclarator(decl.node)) {
      meta = decl.node.init
    }
  }
  if (isTSAsExpression(meta) || isTSSatisfiesExpression(meta)) {
    meta = meta.expression
  }

  return isObjectExpression(meta) ? meta : null
}

export const getDescriptor = (
  metaDeclaration: TSESTree.ObjectExpression,
  propertyName: string
): string[] | RegExp | undefined => {
  const property =
    metaDeclaration &&
    metaDeclaration.properties.find(
      (p) => 'key' in p && 'name' in p.key && p.key.name === propertyName
    )

  if (!property || isSpreadElement(property)) {
    return undefined
  }

  const { type } = property.value

  switch (type) {
    case 'ArrayExpression':
      return property.value.elements.map((t) => {
        if (!['StringLiteral', 'Literal'].includes(t.type)) {
          throw new Error(`Unexpected descriptor element: ${t.type}`)
        }
        // @ts-ignore
        return t.value
      })
    case 'Literal':
    // TODO: Investigation needed. Type systems says, that "RegExpLiteral" does not exist
    // @ts-ignore
    case 'RegExpLiteral':
      // @ts-ignore
      return property.value.value
    default:
      throw new Error(`Unexpected descriptor: ${type}`)
  }
}

export const isValidStoryExport = (
  node: TSESTree.Identifier,
  nonStoryExportsConfig: IncludeExcludeOptions
) => isExportStory(node.name, nonStoryExportsConfig) && node.name !== '__namedExportsOrder'

export const getAllNamedExports = (node: TSESTree.ExportNamedDeclaration) => {
  // e.g. `export { MyStory }`
  if (!node.declaration && node.specifiers) {
    return node.specifiers.reduce((acc, specifier) => {
      if (isIdentifier(specifier.exported)) {
        acc.push(specifier.exported)
      }
      return acc
    }, [] as TSESTree.Identifier[])
  }

  const decl = node.declaration
  if (isVariableDeclaration(decl)) {
    const declaration = decl.declarations[0]

    if (declaration) {
      const { id } = declaration
      // e.g. `export const MyStory`
      if (isIdentifier(id)) {
        return [id]
      }
    }
  }

  if (isFunctionDeclaration(decl)) {
    // e.g. `export function MyStory() {}`
    if (isIdentifier(decl.id)) {
      return [decl.id]
    }
  }

  return []
}
