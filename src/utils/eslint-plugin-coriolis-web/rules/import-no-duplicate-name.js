'use strict';

/**
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value
        if (typeof source !== 'string' || !source.startsWith('@src')) {
          return
        }
        const lastTwoPathParts = source.split('/').slice(-2)
        if (lastTwoPathParts.length !== 2) {
          return
        }
        const [componentFolder, componentName] = lastTwoPathParts
        if (componentFolder !== componentName) {
          return
        }

        context.report({
          node,
          message: `'${componentName}' name is duplicated in import path.`,
          fix(fixer) {
            return fixer.replaceText(node.source, `'${source.replace(new RegExp(`/${componentName}$`), '')}'`);
          }
        })
      }
    }
  }
}
