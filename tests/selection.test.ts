import { expect, test } from '@playwright/test';

const ROUTE = '/example/daisy-ui/svelte-query-actions';

test.describe('selection + actions', () => {
    test('renders the selection column and three-dot menu when actions exist', async ({ page }) => {
        await page.goto(ROUTE);
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        // Header tri-state checkbox
        await expect(page.locator('th.datatable-selection-th input[type="checkbox"]')).toBeVisible();

        // Per-row checkbox
        await expect(
            page.locator('tbody tr.datatable-row').first().locator('input[type="checkbox"]')
        ).toBeVisible();

        // Three-dot row dropdown trigger
        await expect(
            page.locator('tbody tr.datatable-row').first().locator('details.dropdown summary')
        ).toBeVisible();
    });

    test('toggling row checkboxes updates the bound selectedIds', async ({ page }) => {
        await page.goto(ROUTE);
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        const idsCode = page.locator('code').first();
        await expect(idsCode).toContainText('[]');

        const rowCheckboxes = page.locator('tbody tr.datatable-row input[type="checkbox"]');
        await rowCheckboxes.nth(1).click();
        await rowCheckboxes.nth(2).click();

        await expect(idsCode).toContainText('2');
        await expect(idsCode).toContainText('3');
    });

    test('selection toolbar appears with bulk actions when rows are selected', async ({ page }) => {
        await page.goto(ROUTE);
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        // No toolbar before any selection
        await expect(page.locator('.datatable-selection-toolbar')).toHaveCount(0);

        await page.locator('tbody tr.datatable-row input[type="checkbox"]').first().click();

        const toolbar = page.locator('.datatable-selection-toolbar');
        await expect(toolbar).toBeVisible();
        await expect(toolbar).toContainText('1 selected');
        await expect(toolbar.getByRole('button', { name: 'Archive' })).toBeVisible();
        await expect(toolbar.getByRole('button', { name: 'Delete' })).toBeVisible();
    });

    test('header checkbox selects all rows on the page; clicking again clears them', async ({
        page
    }) => {
        await page.goto(ROUTE);
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        const headerCheckbox = page.locator('th.datatable-selection-th input[type="checkbox"]');
        const rowCheckboxes = page.locator('tbody tr.datatable-row input[type="checkbox"]');

        await headerCheckbox.click();

        // Every row's checkbox is checked
        const total = await rowCheckboxes.count();
        for (let i = 0; i < Math.min(total, 5); i++) {
            await expect(rowCheckboxes.nth(i)).toBeChecked();
        }

        // Header is fully checked, not indeterminate
        await expect(headerCheckbox).toBeChecked();

        await headerCheckbox.click();
        for (let i = 0; i < Math.min(total, 5); i++) {
            await expect(rowCheckboxes.nth(i)).not.toBeChecked();
        }
    });

    test('header tri-state turns indeterminate when only some rows are selected', async ({
        page
    }) => {
        await page.goto(ROUTE);
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        const headerCheckbox = page.locator('th.datatable-selection-th input[type="checkbox"]');
        await page.locator('tbody tr.datatable-row input[type="checkbox"]').first().click();

        const isIndeterminate = await headerCheckbox.evaluate(
            (el) => (el as HTMLInputElement).indeterminate
        );
        expect(isIndeterminate).toBe(true);
    });

    test('row dropdown invokes the single-item handler', async ({ page }) => {
        await page.goto(ROUTE);
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        const firstRow = page.locator('tbody tr.datatable-row').first();
        await firstRow.locator('details.dropdown summary').click();
        // Edit is the first menu item, registered with `onSingle`
        await firstRow.getByRole('button', { name: 'Edit' }).click();

        await expect(page.getByText(/Edit user #1/).first()).toBeVisible();
    });

    test('bulk action invokes the multi-item handler with all selected ids', async ({ page }) => {
        await page.goto(ROUTE);
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        const rowCheckboxes = page.locator('tbody tr.datatable-row input[type="checkbox"]');
        await rowCheckboxes.nth(1).click();
        await rowCheckboxes.nth(3).click();

        await page
            .locator('.datatable-selection-toolbar')
            .getByRole('button', { name: 'Delete' })
            .click();

        // The example logs a "Delete N user(s): [...]" message
        await expect(page.getByText(/Delete 2 user\(s\): \[2, 4\]/)).toBeVisible();

        // Default `clearSelectionAfter` for bulk is true → toolbar dismissed
        await expect(page.locator('.datatable-selection-toolbar')).toHaveCount(0);
    });

    test('clear button empties the selection and dismisses the toolbar', async ({ page }) => {
        await page.goto(ROUTE);
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        await page.locator('tbody tr.datatable-row input[type="checkbox"]').nth(0).click();
        const toolbar = page.locator('.datatable-selection-toolbar');
        await expect(toolbar).toBeVisible();

        await toolbar.getByRole('button', { name: 'Clear selection' }).click();
        await expect(page.locator('.datatable-selection-toolbar')).toHaveCount(0);
        await expect(
            page.locator('tbody tr.datatable-row input[type="checkbox"]').first()
        ).not.toBeChecked();
    });
});
