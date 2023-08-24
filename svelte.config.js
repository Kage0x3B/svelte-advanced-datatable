import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import { u } from 'unist-builder';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    extensions: ['.svelte', '.md', '.svx'],
    preprocess: [
        preprocess({
            postcss: true
        }),
        mdsvex({
            extensions: ['.md', '.svx'],
            layout: {
                'api-reference': './src/routes/util/layout/api-reference-layout.svelte',
                docs: './src/routes/util/layout/docs-layout.svelte',
                _: './src/routes/util/layout/docs-layout.svelte'
            },
            remarkPlugins: [remarkHintPlugin()]
        })
    ],
    kit: {
        adapter: adapter({
            fallback: 'spa.html'
        }),
        prerender: {
            handleMissingId: 'ignore'
        }
    },
    package: {
        exports: (filepath) => filepath.endsWith('index.ts')
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
