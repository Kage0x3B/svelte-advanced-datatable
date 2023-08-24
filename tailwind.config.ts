import { join } from 'node:path';
import type { Config } from 'tailwindcss';
import { skeleton } from '@skeletonlabs/tw-plugin';
import { sadTheme } from './tools/sad-theme.js';
import tailwindForms from '@tailwindcss/forms';
import tailwindTypography from '@tailwindcss/typography';

export default {
    darkMode: 'class',
    content: [
        './src/**/*.{html,js,svelte,ts}',
        join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
    ],
    theme: {
        extend: {}
    },
    plugins: [
        tailwindForms(),
        tailwindTypography(),
        skeleton({
            themes: {
                custom: [sadTheme]
            }
        })
    ]
} satisfies Config;
