import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { u } from 'unist-builder';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// mdsvex layout paths must be absolute on disk; relative paths are resolved
// against the .md file being processed, which produces nonsense like
// `src/routes/(docs)/docs/getting-started/src/routes/...` and breaks Vite
// import analysis.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const docsLayout = path.join(projectRoot, 'src/routes/util/layout/docs-layout.svelte');
const apiReferenceLayout = path.join(projectRoot, 'src/routes/util/layout/api-reference-layout.svelte');

/** @type {import('@sveltejs/kit').Config} */
const config = {
    extensions: ['.svelte', '.md', '.svx'],
    preprocess: [
        vitePreprocess(),
        mdsvex({
            extensions: ['.md', '.svx'],
            layout: {
                'api-reference': apiReferenceLayout,
                docs: docsLayout,
                _: docsLayout
            },
            remarkPlugins: [remarkHintPlugin()]
        })
    ],
    kit: {
        adapter: adapterCloudflare({
            fallback: 'spa.html'
        }),
        paths: {
            relative: false
        },
        prerender: {
            handleMissingId: 'ignore',
            handleEntryGeneratorMismatch: 'warn',
            handleUnseenRoutes: 'warn',
            handleHttpError: 'warn'
        }
    },
    compilerOptions: {
        warningFilter: (warning) => {
            return !['a11y_no_noninteractive_element_interactions'].includes(warning.code);
        }
    }
};

function remarkHintPlugin() {
    const hintTypes = [
        {
            regex: /^!&gt;|!>\s/,
            classes: 'alert alert-info',
            icon: 'info-circle'
        },
        {
            regex: /^\?&gt;|\?>\s/,
            classes: 'alert alert-warning',
            icon: 'exclamation-triangle'
        },
        {
            regex: /^x&gt;|x>\s/,
            classes: 'alert alert-danger',
            icon: 'exclamation-circle'
        }
    ];

    // from github.com/syntax-tree/unist-util-map/blob/bb0567f651517b2d521af711d7376475b3d8446a/index.js
    const map = (tree, iteratee) => {
        const preorder = (node, index, parent) => {
            const newNode = iteratee(node, index, parent);

            if (Array.isArray(newNode.children)) {
                newNode.children = newNode.children.map((child, index) => {
                    return preorder(child, index, node);
                });
            }

            return newNode;
        };

        return preorder(tree, null, null);
    };

    return () => (tree) => {
        return map(tree, (node) => {
            const { children = [] } = node;
            if (node.type !== 'paragraph') {
                return node;
            }

            const [{ value, type }, ...siblings] = children;
            if (type !== 'text') {
                return node;
            }

            const hintType = hintTypes.find((hintType) => {
                return hintType.regex.test(value);
            });

            if (!hintType) {
                return node;
            }

            const newChild = {
                type,
                value: value.replace(hintType.regex, '')
            };

            const props = {
                data: {
                    class: hintType.classes + ' d-flex align-items-center px-4 py-3',
                    role: 'alert',
                    hProperties: {
                        class: hintType.classes + ' d-flex align-items-center px-4 py-3',
                        role: 'alert'
                    }
                }
            };

            return u('div', props, [
                u('html', `<i class='bi-${hintType.icon} icon-md me-2'></i>`),
                u('div', [newChild, ...siblings])
            ]);
        });
    };
}

export default config;
