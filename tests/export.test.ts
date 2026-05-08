import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const URL_STATE_ROUTE = '/example/daisy-ui/basic/url-state';

test.describe('export popover', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(URL_STATE_ROUTE);
        await page.evaluate(() => window.localStorage.clear());
        await page.reload();
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();
    });

    test('export button opens the popover with default options', async ({ page }) => {
        await page.getByRole('button', { name: /Export data for table/i }).click();
        const dialog = page.getByRole('dialog', { name: /Export data/i });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByLabel('Format')).toHaveValue('csv');
        await expect(dialog.getByLabel('Delimiter')).toHaveValue(',');
        await expect(dialog.getByLabel('Include header row')).toBeChecked();
    });

    test('downloading csv produces a file with the expected name and header', async ({ page }) => {
        await page.getByRole('button', { name: /Export data for table/i }).click();
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('dialog').getByRole('button', { name: 'Download', exact: true }).click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/^userData_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.csv$/);
        const path = await download.path();
        expect(path).toBeTruthy();
        const text = readFileSync(path!, 'utf8');
        const firstLine = text.split('\n')[0];
        expect(firstLine).toContain('Username');
        expect(firstLine).toContain('Email');
    });

    test('changing delimiter to ";" produces a semicolon-delimited file', async ({ page }) => {
        await page.getByRole('button', { name: /Export data for table/i }).click();
        await page.getByRole('dialog').getByLabel('Delimiter').selectOption(';');
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('dialog').getByRole('button', { name: 'Download', exact: true }).click();
        const download = await downloadPromise;
        const path = await download.path();
        const text = readFileSync(path!, 'utf8');
        const firstLine = text.split('\n')[0];
        expect(firstLine).toContain(';');
        // The chosen delimiter is ';' so commas should NOT appear in the header.
        expect(firstLine.includes(',')).toBe(false);
    });

    test('persists the chosen delimiter across reload', async ({ page }) => {
        await page.getByRole('button', { name: /Export data for table/i }).click();
        await page.getByRole('dialog').getByLabel('Delimiter').selectOption(';');
        await page.keyboard.press('Escape');

        await page.reload();
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();
        await page.getByRole('button', { name: /Export data for table/i }).click();
        await expect(page.getByRole('dialog').getByLabel('Delimiter')).toHaveValue(';');
    });

    test('json export is parseable and respects current search filter', async ({ page }) => {
        // Filter the visible rows first.
        const search = page.getByPlaceholder('Search');
        await search.fill('alice');
        await expect.poll(() => page.locator('tbody tr.datatable-row').count(), { timeout: 2000 }).toBeLessThan(50);

        await page.getByRole('button', { name: /Export data for table/i }).click();
        await page.getByRole('dialog').getByLabel('Format').selectOption('json');
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('dialog').getByRole('button', { name: 'Download', exact: true }).click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.json$/);
        const text = readFileSync((await download.path())!, 'utf8');
        const parsed = JSON.parse(text);
        expect(Array.isArray(parsed)).toBe(true);
        // Every exported row should match the search term in some text column.
        for (const row of parsed) {
            const haystack = `${row.userName ?? ''} ${row.mailAddress ?? ''}`.toLowerCase();
            expect(haystack).toContain('alice');
        }
    });

    test('reset to defaults restores the comma delimiter', async ({ page }) => {
        await page.getByRole('button', { name: /Export data for table/i }).click();
        await page.getByRole('dialog').getByLabel('Delimiter').selectOption('|');
        await expect(page.getByRole('dialog').getByLabel('Delimiter')).toHaveValue('|');
        await page.getByRole('dialog').getByRole('button', { name: 'Reset to defaults' }).click();
        await expect(page.getByRole('dialog').getByLabel('Delimiter')).toHaveValue(',');
    });
});
