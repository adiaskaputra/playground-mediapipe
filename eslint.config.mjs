import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  {
    ignores: [
      // FOLDER
      '.devcontainer',
      'example',
      '.nitro',
      '.nuxt',
      '.output',
      '.vscode',
      '.yarn',
      'dist',
      'node_modules',
      // FILE
      '*.log*',
      '*.md',
      '.cache',
      '.env',
      '.gitlab-ci.yml',
      '.yarnrc.yml',
      'cloudbuild.yaml',
      'commitlint.config.js',
    ],
  },
  {
    rules: {
      'camelcase': 'off',
      'dot-notation': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
      'max-len': ['error', { code: 240, tabWidth: 2, comments: 240 }],
      'no-console': [2, { allow: ['error', 'info', 'warn'] }],
      'no-lonely-if': 'off',
      'semi': [2, 'never'],
      'vue/component-tags-order': [
        'error',
        {
          order: ['script:not([setup])', 'script[setup]', 'template', 'style'],
        },
      ],
      'vue/html-indent': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/no-lone-template': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/no-mutating-props': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
  {
    files: ['.yarn/**/*'],
  },
])
