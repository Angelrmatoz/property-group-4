module.exports = [
    {
        ignores: ['node_modules/**', '.next/**', 'public/**', 'build/**', '*.log', 'pnpm-lock.yaml'],
    },
    {
        files: ['**/*.{ts,tsx}'],
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
