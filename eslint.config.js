import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
    // Recommended base configs
    js.configs.recommended,

    // Vue 3 essential rules
    ...pluginVue.configs['flat/essential'],

    // Prettier integration
    prettierConfig,

    // Global ignores
    {
        ignores: ['dist/**', 'node_modules/**']
    },

    // Configuration for all files
    {
        files: ['**/*.{js,mjs,cjs,ts,vue}'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
            },
        },
        plugins: {
            prettier,
        },
        rules: {
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'prettier/prettier': 'error',
            'no-prototype-builtins': 'off',
            'vue/multi-word-component-names': 'off',
        },
    },

    // TypeScript files
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },
        rules: {
            ...typescriptEslint.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
        },
    },

    // Vue files
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                parser: typescriptParser,
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },
        rules: {
            ...typescriptEslint.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'off',
            'vue/no-unused-components': 'warn',
            'vue/no-dupe-keys': 'warn',
        },
    },
];
