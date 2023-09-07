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
            handleMissingId: 'ignore',
            handleHttpError: 'warn'
        }
    }
};

const infoCircleIcon = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-info-circle w-16 mr-2' viewBox='0 0 16 16'>
  <path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z'/>
  <path d='m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z'/>
</svg>`;

const exclamationTriangleIcon = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-exclamation-triangle w-16 mr-2' viewBox='0 0 16 16'>
  <path d='M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z'/>
  <path d='M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z'/>
</svg>`;

const exclamationCircleIcon = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-exclamation-circle w-16 mr-2' viewBox='0 0 16 16'>
  <path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z'/>
  <path d='M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z'/>
</svg>`;

const iconSvgs = {
    'info-circle': infoCircleIcon,
    'exclamation-triangle': exclamationTriangleIcon,
    'exclamation-circle': exclamationCircleIcon
};

function remarkHintPlugin() {
    const hintTypes = [
        {
            regex: /^!&gt;|!>\s/,
            classes: 'alert variant-ghost-tertiary',
            icon: 'info-circle'
        },
        {
            regex: /^\?&gt;|\?>\s/,
            classes: 'alert variant-ghost-warning',
            icon: 'exclamation-triangle'
        },
        {
            regex: /^x&gt;|x>\s/,
            classes: 'alert variant-ghost-error',
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
                    class: hintType.classes + ' flex flex-row items-center px-4 py-3 not-prose',
                    role: 'alert',
                    hProperties: {
                        class: hintType.classes + ' flex flex-row items-center px-4 py-3 not-prose',
                        role: 'alert'
                    }
                }
            };

            return u('div', props, [u('html', iconSvgs[hintType.icon]), u('div', [newChild, ...siblings])]);
        });
    };
}

export default config;
