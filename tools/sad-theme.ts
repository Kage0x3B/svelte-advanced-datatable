import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const sadTheme: CustomThemeConfig = {
    name: 'sad-theme',
    properties: {
        // =~= Theme Properties =~=
        '--theme-font-family-base': 'IBM Plex Sans, system-ui',
        '--theme-font-family-heading': 'IBM Plex Sans, system-ui',
        '--theme-font-color-base': 'var(--color-surface-800)',
        '--theme-font-color-dark': 'var(--color-surface-100)',
        '--theme-rounded-base': '8px',
        '--theme-rounded-container': '6px',
        '--theme-border-base': '1px',
        // =~= Theme On-X Colors =~=
        '--on-primary': 'var(--color-surface-800)',
        '--on-secondary': '255 255 255',
        '--on-tertiary': 'var(--color-surface-800)',
        '--on-success': 'var(--color-surface-800)',
        '--on-warning': 'var(--color-surface-700)',
        '--on-error': 'var(--color-surface-800)',
        '--on-surface': '255 255 255',
        // =~= Theme Colors  =~=
        // primary | #26a269
        '--color-primary-50': '222 241 233', // #def1e9
        '--color-primary-100': '212 236 225', // #d4ece1
        '--color-primary-200': '201 232 218', // #c9e8da
        '--color-primary-300': '168 218 195', // #a8dac3
        '--color-primary-400': '103 190 150', // #67be96
        '--color-primary-500': '38 162 105', // #26a269
        '--color-primary-600': '34 146 95', // #22925f
        '--color-primary-700': '29 122 79', // #1d7a4f
        '--color-primary-800': '23 97 63', // #17613f
        '--color-primary-900': '19 79 51', // #134f33
        // secondary | #77767b
        '--color-secondary-50': '235 234 235', // #ebeaeb
        '--color-secondary-100': '228 228 229', // #e4e4e5
        '--color-secondary-200': '221 221 222', // #ddddde
        '--color-secondary-300': '201 200 202', // #c9c8ca
        '--color-secondary-400': '160 159 163', // #a09fa3
        '--color-secondary-500': '119 118 123', // #77767b
        '--color-secondary-600': '107 106 111', // #6b6a6f
        '--color-secondary-700': '89 89 92', // #59595c
        '--color-secondary-800': '71 71 74', // #47474a
        '--color-secondary-900': '58 58 60', // #3a3a3c
        // tertiary | #62a0ea
        '--color-tertiary-50': '231 241 252', // #e7f1fc
        '--color-tertiary-100': '224 236 251', // #e0ecfb
        '--color-tertiary-200': '216 231 250', // #d8e7fa
        '--color-tertiary-300': '192 217 247', // #c0d9f7
        '--color-tertiary-400': '145 189 240', // #91bdf0
        '--color-tertiary-500': '98 160 234', // #62a0ea
        '--color-tertiary-600': '88 144 211', // #5890d3
        '--color-tertiary-700': '74 120 176', // #4a78b0
        '--color-tertiary-800': '59 96 140', // #3b608c
        '--color-tertiary-900': '48 78 115', // #304e73
        // success | #26a269
        '--color-success-50': '222 241 233', // #def1e9
        '--color-success-100': '212 236 225', // #d4ece1
        '--color-success-200': '201 232 218', // #c9e8da
        '--color-success-300': '168 218 195', // #a8dac3
        '--color-success-400': '103 190 150', // #67be96
        '--color-success-500': '38 162 105', // #26a269
        '--color-success-600': '34 146 95', // #22925f
        '--color-success-700': '29 122 79', // #1d7a4f
        '--color-success-800': '23 97 63', // #17613f
        '--color-success-900': '19 79 51', // #134f33
        // warning | #dfd22a
        '--color-warning-50': '250 248 223', // #faf8df
        '--color-warning-100': '249 246 212', // #f9f6d4
        '--color-warning-200': '247 244 202', // #f7f4ca
        '--color-warning-300': '242 237 170', // #f2edaa
        '--color-warning-400': '233 224 106', // #e9e06a
        '--color-warning-500': '223 210 42', // #dfd22a
        '--color-warning-600': '201 189 38', // #c9bd26
        '--color-warning-700': '167 158 32', // #a79e20
        '--color-warning-800': '134 126 25', // #867e19
        '--color-warning-900': '109 103 21', // #6d6715
        // error | #ed3916
        '--color-error-50': '252 225 220', // #fce1dc
        '--color-error-100': '251 215 208', // #fbd7d0
        '--color-error-200': '251 206 197', // #fbcec5
        '--color-error-300': '248 176 162', // #f8b0a2
        '--color-error-400': '242 116 92', // #f2745c
        '--color-error-500': '237 57 22', // #ed3916
        '--color-error-600': '213 51 20', // #d53314
        '--color-error-700': '178 43 17', // #b22b11
        '--color-error-800': '142 34 13', // #8e220d
        '--color-error-900': '116 28 11', // #741c0b
        // surface | #342e37
        '--color-surface-50': '225 224 225', // #e1e0e1
        '--color-surface-100': '214 213 215', // #d6d5d7
        '--color-surface-200': '204 203 205', // #cccbcd
        '--color-surface-300': '174 171 175', // #aeabaf
        '--color-surface-400': '113 109 115', // #716d73
        '--color-surface-500': '52 46 55', // #342e37
        '--color-surface-600': '47 41 50', // #2f2932
        '--color-surface-700': '39 35 41', // #272329
        '--color-surface-800': '31 28 33', // #1f1c21
        '--color-surface-900': '25 23 27' // #19171b
    }
};
