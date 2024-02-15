// .eslintrc.cjs example
module.exports = {
    root: true,
    env: {
        browser: true,
        es2023: true
    },
    extends: [
        'eslint:recommended',

        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],

        // Custom rules
        'comma-dangle': ['warn', 'only-multiline'],
        'indent': ['warn', 2],
        'semi': ['warn', 'never'],
        'quotes': ['warn', 'single'],
        'arrow-parens': ['warn', 'as-needed'],
        'linebreak-style': ['warn', 'unix'],

        // Disabled rules
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-constant-condition': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
    },
}