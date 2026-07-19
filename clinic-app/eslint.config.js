import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                URL: 'readonly',
                fetch: 'readonly',
                FormData: 'readonly',
                navigator: 'readonly',
                File: 'readonly',
                HTMLElement: 'readonly',
                HTMLInputElement: 'readonly',
                HTMLSelectElement: 'readonly',
                HTMLTextAreaElement: 'readonly',
                HTMLDivElement: 'readonly',
                HTMLButtonElement: 'readonly',
                HTMLAnchorElement: 'readonly',
                HTMLImageElement: 'readonly',
                Element: 'readonly',
                Event: 'readonly',
                MouseEvent: 'readonly',
                KeyboardEvent: 'readonly',
                CustomEvent: 'readonly',
                MutationObserver: 'readonly',
                ResizeObserver: 'readonly',
                IntersectionObserver: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                history: 'readonly',
                location: 'readonly',
                Notification: 'readonly',
                AudioContext: 'readonly',
                MediaStream: 'readonly',
                MediaStreamTrack: 'readonly',
                RTCPeerConnection: 'readonly',
                WebSocket: 'readonly',
                Promise: 'readonly',
                Map: 'readonly',
                Set: 'readonly',
                Array: 'readonly',
                Object: 'readonly',
                Math: 'readonly',
                Date: 'readonly',
                JSON: 'readonly',
                parseInt: 'readonly',
                parseFloat: 'readonly',
                isNaN: 'readonly',
                Infinity: 'readonly',
                undefined: 'readonly',
                null: 'readonly',
                true: 'readonly',
                false: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'react': reactPlugin,
            'react-hooks': reactHooksPlugin,
        },
        rules: {
            // TypeScript
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

            // React
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // General
            'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
            'no-console': 'off',
            'no-undef': 'off', // Handled by TypeScript
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
    },
    {
        ignores: [
            'node_modules/**',
            'public/**',
            'vendor/**',
            'dist/**',
            '*.config.js',
            '*.config.ts',
            'tailwind.config.js',
            'postcss.config.js',
            'resources/js/ziggy.js',
            'resources/js/bootstrap.js',
        ],
    },
];
