import { expect, test } from '@playwright/test';

test.describe('URL persistence', () => {
    test('search input is reflected in URL params after debounce', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/url-state');
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        await page.locator('input.search-box').fill('Alice');

        await expect
            .poll(() => new URL(page.url()).searchParams.get('dt-q'), { timeout: 2000 })
            .toBe('Alice');
    });

    test('reload restores search and page from URL', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/url-state?dt-q=Alice');
        await expect(page.locator('input.search-box')).toHaveValue('Alice');
    });

    test('default-elision keeps URL clean when state matches defaults', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/url-state?dt-q=Alice');
        await expect(page.locator('input.search-box')).toHaveValue('Alice');

        await page.locator('input.search-box').fill('');

        await expect.poll(() => new URL(page.url()).searchParams.has('dt-q'), { timeout: 2000 }).toBe(false);
    });

    test('non-dt search params are preserved across mutations', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/url-state?utm_source=twitter&ref=blog&dt-q=Alice');
        await expect(page.locator('input.search-box')).toHaveValue('Alice');

        // Trigger a mutation that flushes the URL store.
        await page.locator('input.search-box').fill('Bob');
        await expect.poll(() => new URL(page.url()).searchParams.get('dt-q'), { timeout: 2000 }).toBe('Bob');

        // Unrelated query params survive.
        const url = new URL(page.url());
        expect(url.searchParams.get('utm_source')).toBe('twitter');
        expect(url.searchParams.get('ref')).toBe('blog');

        // And clearing dt-q to default doesn't touch them either.
        await page.locator('input.search-box').fill('');
        await expect.poll(() => new URL(page.url()).searchParams.has('dt-q'), { timeout: 2000 }).toBe(false);
        const after = new URL(page.url());
        expect(after.searchParams.get('utm_source')).toBe('twitter');
        expect(after.searchParams.get('ref')).toBe('blog');
    });

    test('default-valued params in deep-link URL are scrubbed at init', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/url-state?dt-page=1&dt-sortDir=&dt-q=Alice');
        await expect(page.locator('input.search-box')).toHaveValue('Alice');

        // dt-q is non-default → kept; dt-page=1 and dt-sortDir= are defaults → scrubbed.
        await expect.poll(() => new URL(page.url()).searchParams.has('dt-page'), { timeout: 2000 }).toBe(false);
        await expect.poll(() => new URL(page.url()).searchParams.has('dt-sortDir'), { timeout: 2000 }).toBe(false);
        await expect.poll(() => new URL(page.url()).searchParams.get('dt-q'), { timeout: 2000 }).toBe('Alice');
    });

    // Regression for the structural bug fixed in 0.14.2: `replaceState` updates
    // `window.location` but never `page.url`. The store used to read `page.url`,
    // so once `pendingWrites` was cleared the getter fell through to the fallback
    // and re-fired `requestData(...)` with the default sort, clobbering the user's
    // just-applied sort. Visible symptom: rows revert after the 300ms debounce.
    test('sort survives the URL flush debounce', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/url-state');
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        await page.locator('th[data-column-key="id"]').click();

        // URL must reflect the click after the debounced flush (first click
        // on a new column sorts DESC).
        await expect.poll(() => new URL(page.url()).searchParams.get('dt-sortCol'), { timeout: 2000 }).toBe('id');
        await expect.poll(() => new URL(page.url()).searchParams.get('dt-sortDir'), { timeout: 2000 }).toBe('desc');

        // Wait past the 300ms debounce + a margin, then verify the table is
        // still sorted by id (i.e. the buggy second requestData never reverted
        // to the default unsorted order, which would show ids 1..N ascending).
        await page.waitForTimeout(600);

        const firstId = await page.locator('tbody tr.datatable-row').first().locator('td').first().innerText();
        const lastId = await page.locator('tbody tr.datatable-row').last().locator('td').first().innerText();
        expect(Number(firstId)).toBeGreaterThan(Number(lastId));
        expect(new URL(page.url()).searchParams.get('dt-sortCol')).toBe('id');
    });

    test('back navigation restores previous URL state', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/url-state');
        await page.locator('input.search-box').fill('Alice');
        await expect.poll(() => new URL(page.url()).searchParams.get('dt-q')).toBe('Alice');

        await page.goto('/example/daisy-ui/basic/url-state?dt-q=Bob');
        await expect(page.locator('input.search-box')).toHaveValue('Bob');

        await page.goBack();
        await expect(page.locator('input.search-box')).toHaveValue('Alice');
    });
});

test.describe('snapshot regression', () => {
    test('the existing snapshot-state example still renders rows', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/snapshot-state');
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();
    });
});
