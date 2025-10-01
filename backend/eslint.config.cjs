module.exports = [
    {
        ignores: ['node_modules/**', 'dist/**', '.next/**', '*.log', 'pnpm-lock.yaml', 'coverage/**'],
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: require('@typescript-eslint/parser'),
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
            prettier: require('eslint-plugin-prettier'),
        },
        rules: {
            ...require('eslint-config-prettier').rules,
            'prettier/prettier': 'error',
        },
    },
];
