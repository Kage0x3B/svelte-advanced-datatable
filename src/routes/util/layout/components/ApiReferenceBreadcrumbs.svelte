<script lang="ts">
    import { apiReferenceCategories } from '../../apiReferenceMeta.js';

    export let currentPath: string;
    export let baseUrl = '/';
    export let indexName = 'Home';

    type BreadcrumbData = {
        title: string;
        url: string;
    };

    let breadcrumbs: BreadcrumbData[];
    $: breadcrumbs = buildBreadcrumbs(currentPath);

    function buildBreadcrumbs(currentPath: string): BreadcrumbData[] {
        currentPath = currentPath.startsWith(baseUrl) ? currentPath.substring(baseUrl.length) : currentPath;
        const pathParts = currentPath.split('/');

        const breadcrumbs: BreadcrumbData[] = [
            {
                title: indexName,
                url: baseUrl + '/'
            }
        ];

        let parentPath = '';

        for (const pathPart of pathParts) {
            if (!pathPart) {
                continue;
            }

            if (~['classes', 'enums', 'interfaces'].indexOf(pathPart)) {
                continue;
            }

            const isCategory = apiReferenceCategories.includes(pathPart);

            breadcrumbs.push({
                title: capitalize(pathPart),
                url: baseUrl + parentPath + '/' + (isCategory ? 'modules/' : '') + pathPart
            });

            parentPath += '/' + pathPart;
        }

        return breadcrumbs;
    }

    function capitalize(value: string): string {
        if (!value?.length) {
            return '';
        }

        return value.substring(0, 1).toUpperCase() + value.substring(1);
    }
</script>

<div class="">
    <ol class="breadcrumb">
        {#each breadcrumbs as breadcrumb, i (breadcrumb.url)}
            {#if i < breadcrumbs.length - 1}
                <li class="crumb"><a class="anchor no-underline" href={breadcrumb.url}>{breadcrumb.title}</a></li>
                <li class="crumb-separator" aria-hidden>&rsaquo;</li>
            {:else}
                <li class="crumb">{breadcrumb.title}</li>
            {/if}
        {/each}
    </ol>
</div>
