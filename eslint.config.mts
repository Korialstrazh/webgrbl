// ESLint config - React + TypeScript client, copied from the agent-skills-and-rules frontend baseline.
//
// Requires (npm i -D):
//   eslint@^9.39 (min 9.23)   typescript-eslint@^8.57   @stylistic/eslint-plugin@^5.10
//   eslint-plugin-react@^7.37   eslint-plugin-react-hooks@^7   jiti@^2.6   typescript@^5.9
//
// jiti is mandatory, not optional: ESLint loads a .mts flat config through it.
// typescript-eslint re-exports the parser and plugin - do not install
// @typescript-eslint/parser or @typescript-eslint/eslint-plugin alongside it.
// eslint-plugin-react-refresh is not needed: no rule from it is enabled here.

import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import stylisticTsPlugin from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  { ignores: ['dist', 'build', 'dev-dist', '*.cjs', '.claude/worktrees/**'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@stylistic': stylisticTsPlugin,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,

      // --- typescript-eslint adjustments ---
      '@typescript-eslint/no-explicit-any': 'off',   // covered by the TSAnyKeyword selector below
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'default-param-last': 'off',
      '@typescript-eslint/default-param-last': 'off',
      'no-use-before-define': 'off',

      // --- formatting ---
      '@stylistic/indent': ['error', 2, { SwitchCase: 0 }],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      '@stylistic/linebreak-style': ['error', 'unix'],            // LF only, never CRLF
      semi: ['error', 'always'],
      quotes: [2, 'single', { avoidEscape: true }],
      'jsx-quotes': ['error', 'prefer-double'],
      'comma-dangle': ['error', 'always-multiline'],
      'space-in-parens': ['error', 'never'],
      'space-before-blocks': ['error', 'always'],
      'space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'padded-blocks': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'no-multi-spaces': ['error', { ignoreEOLComments: false }],  // ts-no-alignment-padding
      'max-len': ['error', 120, { ignorePattern: '^import\\s.+\\sfrom\\s.+$', ignoreUrls: true }],
      curly: ['error', 'all'],                                     // ts-braces-required
      'newline-before-return': ['error'],                          // ts-function-phase-blank-lines
      'react/jsx-indent': ['error', 2],
      'react/jsx-indent-props': ['error', 2],

      // --- React ---
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': 'error',
      'react/prop-types': 0,
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-max-props-per-line': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.ts', '.jsx', '.tsx'] }],
      'react-hooks/exhaustive-deps': 'off',

      // --- deliberate relaxations ---
      camelcase: 'off',
      'no-underscore-dangle': 'off',
      'no-bitwise': 'off',
      'no-plusplus': 'off',                                        // ts-prefer-increment-operator
      'no-nested-ternary': 'off',
      'no-continue': 'off',
      'no-await-in-loop': 'off',
      'class-methods-use-this': 'off',
      'no-console': ['warn', { allow: ['group', 'groupCollapsed', 'groupEnd'] }],

      // ts-react-keep-components-small
      'max-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],

      'no-restricted-syntax': ['warn',
        {
          selector: 'ClassDeclaration[superClass.name=/^(Component|PureComponent)$/]',
          message: 'ts-react-functional-components-only - use function components, not class components.',
        },
        {
          selector: 'ClassDeclaration[superClass.property.name=/^(Component|PureComponent)$/]',
          message: 'ts-react-functional-components-only - use function components, not class components.',
        },
        {
          selector: "JSXAttribute[name.name='style']",
          message: 'ts-no-inline-styles - move styles into the co-located CSS module. For genuinely '
            + 'runtime-only values, // eslint-disable-next-line no-restricted-syntax.',
        },
        {
          selector: 'TSAnyKeyword:not(TSFunctionType > TSTypeAnnotation > TSAnyKeyword)',
          message: 'Avoid any. It is only allowed as a function type return.',
        },
        {
          selector: "BinaryExpression[operator=/^(===|!==)$/][right.type='Literal'][right.value='']",
          message: 'ts-falsy-over-null-checks - prefer the truthy/falsy form over comparing to an empty string. '
            + 'If an empty string is semantically distinct from absent here, disable this line with a comment '
            + 'explaining the distinction.',
        },
        {
          selector: "BinaryExpression[operator=/^(===|!==)$/][right.type='Literal'][right.raw='null']",
          message: 'ts-falsy-over-null-checks - prefer the truthy/falsy form over comparing to null. '
            + 'If 0 / "" / false are semantically distinct from absent here, disable this line with a comment '
            + 'explaining the distinction.',
        },
        {
          selector: "BinaryExpression[operator=/^(===|!==)$/][right.type='Identifier'][right.name='undefined']",
          message: 'ts-falsy-over-null-checks - prefer the truthy/falsy form over comparing to undefined. '
            + 'If 0 / "" / false are semantically distinct from absent here, disable this line with a comment '
            + 'explaining the distinction.',
        },
      ],

      // ts-no-barrel-imports
      'no-restricted-imports': ['error', {
        patterns: [{
          regex: '^(?!\\.).*\\/index$',
          message: 'Do not import from barrel index files. Import directly from the source file instead.',
        }],
      }],

      // ts-function-phase-blank-lines
      'padding-line-between-statements': ['error',
        { blankLine: 'always', prev: '*', next: 'if' },
        { blankLine: 'always', prev: 'if', next: '*' },
        { blankLine: 'always', prev: '*', next: 'for' },
        { blankLine: 'always', prev: 'for', next: '*' },
        { blankLine: 'always', prev: '*', next: 'do' },
        { blankLine: 'always', prev: 'do', next: '*' },
        { blankLine: 'always', prev: '*', next: 'while' },
        { blankLine: 'always', prev: 'while', next: '*' },
        { blankLine: 'always', prev: '*', next: 'try' },
        { blankLine: 'always', prev: 'try', next: '*' },
        { blankLine: 'always', prev: '*', next: 'switch' },
        { blankLine: 'always', prev: 'switch', next: '*' },
        { blankLine: 'always', prev: '*', next: 'continue' },
      ],
    },
  },
  // Optional - flat data tables (locale maps, fixtures) whose length scales
  // with key count; ts-react-keep-components-small has nothing to extract there.
  // {
  //   files: ['**/*.locales.ts'],
  //   rules: { 'max-lines': 'off' },
  // },
  {
    // Test files may use `any` freely and need not cap at 250 lines.
    // The class-component and inline-CSS bans still apply (the array is
    // re-declared because an override replaces it wholesale).
    files: ['**/*.{test,spec}.{ts,tsx}'],
    rules: {
      'max-lines': 'off',
      'no-restricted-syntax': ['warn',
        {
          selector: 'ClassDeclaration[superClass.name=/^(Component|PureComponent)$/]',
          message: 'ts-react-functional-components-only - use function components, not class components.',
        },
        {
          selector: 'ClassDeclaration[superClass.property.name=/^(Component|PureComponent)$/]',
          message: 'ts-react-functional-components-only - use function components, not class components.',
        },
        {
          selector: "JSXAttribute[name.name='style']",
          message: 'ts-no-inline-styles - move styles into the co-located CSS module.',
        },
      ],
    },
  },
];
