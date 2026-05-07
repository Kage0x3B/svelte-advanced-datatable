import { expect, test } from '@playwright/test';

test.describe('extensive example datatable', () => {
    test('renders rows from the LocalDataSource', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/extensive-example');
        const rows = page.locator('tbody tr.datatable-row');
        await expect(rows.first()).toBeVisible();
        expect(await rows.count()).toBeGreaterThan(0);
    });

    test('search resets pagination to page 1', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/extensive-example');
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        const activePageButton = page.locator('.btn-active').first();
        const pageTwo = page.getByRole('button', { name: '2', exact: true }).first();
        if (await pageTwo.isVisible()) {
            await pageTwo.click();
            await expect(activePageButton).toContainText('2');
        }

        const search = page.locator('input.search-box');
        await search.fill('a');

        // Debounce + page reset should leave us on page 1
        await expect(activePageButton).toContainText('1');
    });

    test('search filters the visible rows', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/extensive-example');
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        const initialCount = await page.locator('tbody tr.datatable-row').count();

        await page.locator('input.search-box').fill('zzznotarealnamexxxx');

        await expect
            .poll(async () => page.locator('tbody tr.datatable-row').count(), { timeout: 2000 })
            .toBeLessThan(initialCount);
    });
});
