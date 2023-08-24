import '@sveltejs/kit';
import 'unplugin-icons/types/svelte';

declare module '*.md';

declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface Platform {}
    }

    declare const eruda:
        | {
              init: () => void;
          }
        | undefined;
}

declare module '$lib/assets/*' {
    const meta: unknown[];
    export default meta;
}

export {};
