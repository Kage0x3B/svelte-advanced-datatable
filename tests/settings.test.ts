import { expect, test } from '@playwright/test';

const URL_STATE_ROUTE = '/example/daisy-ui/basic/url-state';

test.describe('settings popover', () => {
    test.beforeEach(async ({ page }) => {
        // localStorage is shared across tests in the same browserContext;
        // start clean so columnVisibility / itemsPerPage don't bleed.
        await page.goto(URL_STATE_ROUTE);
        await page.evaluate(() => window.localStorage.clear());
        await page.reload();
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();
    });

    test('cog icon opens the popover', async ({ page }) => {
        const trigger = page.getByRole('button', { name: /Settings for table/i });
        await expect(trigger).toBeVisible();
        await trigger.click();

        const popover = page.getByRole('dialog', { name: 'Table settings' });
        await expect(popover).toBeVisible();
        await expect(popover.getByText('Items per page')).toBeVisible();
        await expect(popover.getByText('Columns')).toBeVisible();
    });

    test('items-per-page select changes the rendered row count and persists across reload', async ({ page }) => {
        await page.getByRole('button', { name: /Settings for table/i }).click();

        const select = page.getByRole('dialog').getByRole('combobox');
        await select.selectOption('10');

        // Rows shrink to ≤10 once the new page-size takes effect.
        await expect
            .poll(() => page.locator('tbody tr.datatable-row').count(), { timeout: 2000 })
            .toBeLessThanOrEqual(10);

        // Persistent tier is on for this example → reload restores the choice
        // from localStorage.
        await page.reload();
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();
        await page.getByRole('button', { name: /Settings for table/i }).click();
        const reloadedDialog = page.getByRole('dialog', { name: 'Table settings' });
        await expect(reloadedDialog).toBeVisible();
        await expect(reloadedDialog.getByRole('combobox')).toHaveValue('10');
    });

    test('dragging the column-resize handle widens the column and persists the fraction', async ({ page }) => {
        const usernameTh = page.getByRole('columnheader', { name: /Username/ });
        await expect(usernameTh).toBeVisible();
        const startBox = await usernameTh.boundingBox();
        if (!startBox) throw new Error('username header not found');

        // Drag the right-edge handle 120px to the right via real pointer input.
        const handleX = startBox.x + startBox.width - 4;
        const handleY = startBox.y + startBox.height / 2;
        await page.mouse.move(handleX, handleY);
        await page.mouse.down();
        await page.mouse.move(handleX + 60, handleY, { steps: 6 });
        await page.mouse.move(handleX + 120, handleY, { steps: 6 });
        await page.mouse.up();

        // Column got wider.
        const endBox = await usernameTh.boundingBox();
        expect(endBox!.width).toBeGreaterThan(startBox.width + 50);

        // The persisted value is a fraction (0..1), not pixels — and on
        // first drag, every other visible column gets locked in too so the
        // browser stops redistributing widths from `table-layout: auto`.
        const stored = await page.evaluate(() => window.localStorage.getItem('userData-columnWidths'));
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.userName).toBeGreaterThan(0);
        expect(parsed.userName).toBeLessThan(1);
        // All three columns of the url-state example should have been
        // snapshot-locked.
        expect(Object.keys(parsed).sort()).toEqual(['id', 'mailAddress', 'userName']);

        // Sort wasn't toggled (post-drag click suppressed).
        await expect(page).toHaveURL(new RegExp('^[^?]*$|^[^?]*\\?(?!.*dt-sortCol)'));
    });

    test('dragging one column does not change the widths of its neighbours', async ({ page }) => {
        const idTh = page.getByRole('columnheader', { name: /Id/ });
        const usernameTh = page.getByRole('columnheader', { name: /Username/ });
        const idBefore = (await idTh.boundingBox())!.width;
        const usernameBox = (await usernameTh.boundingBox())!;

        const handleX = usernameBox.x + usernameBox.width - 4;
        const handleY = usernameBox.y + usernameBox.height / 2;
        await page.mouse.move(handleX, handleY);
        await page.mouse.down();
        await page.mouse.move(handleX + 100, handleY, { steps: 6 });
        await page.mouse.up();

        // Username clearly grew; id stayed the same (within 2px tolerance for
        // sub-pixel layout rounding).
        const idAfter = (await idTh.boundingBox())!.width;
        const usernameAfter = (await usernameTh.boundingBox())!.width;
        expect(usernameAfter).toBeGreaterThan(usernameBox.width + 50);
        expect(Math.abs(idAfter - idBefore)).toBeLessThan(2);
    });

    test('reset-column-widths button clears the lock', async ({ page }) => {
        // Drag once to populate the widths map.
        const usernameBox = (await page.getByRole('columnheader', { name: /Username/ }).boundingBox())!;
        const handleX = usernameBox.x + usernameBox.width - 4;
        const handleY = usernameBox.y + usernameBox.height / 2;
        await page.mouse.move(handleX, handleY);
        await page.mouse.down();
        await page.mouse.move(handleX + 80, handleY, { steps: 6 });
        await page.mouse.up();

        await expect
            .poll(() => page.evaluate(() => window.localStorage.getItem('userData-columnWidths')))
            .not.toBeNull();

        // Reset via the settings popover.
        await page.getByRole('button', { name: /Settings for table/i }).click();
        await page.getByRole('button', { name: 'Reset column widths' }).click();

        // The persisted value is gone (default-elision).
        await expect
            .poll(() => page.evaluate(() => window.localStorage.getItem('userData-columnWidths')))
            .toBeNull();
    });

    test('column-visibility toggle hides the column header and cells', async ({ page }) => {
        await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();

        await page.getByRole('button', { name: /Settings for table/i }).click();
        const popover = page.getByRole('dialog', { name: 'Table settings' });
        await popover.getByLabel('Email').uncheck();

        // Header column disappears from the rendered table.
        await expect(page.getByRole('columnheader', { name: 'Email' })).toHaveCount(0);
    });
});

test.describe('settings popover on a table without persistence configured', () => {
    test('items-per-page change still applies in-session (memory tier)', async ({ page }) => {
        await page.goto('/example/daisy-ui/basic/extensive-example');
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        await page.getByRole('button', { name: /Settings for table/i }).click();
        const popover = page.getByRole('dialog', { name: 'Table settings' });
        await expect(popover).toBeVisible();

        await popover.getByRole('combobox').selectOption('10');

        // Even without a persistent backend, the in-memory store keeps the
        // choice during the view so the table actually shrinks.
        await expect
            .poll(() => page.locator('tbody tr.datatable-row').count(), { timeout: 2000 })
            .toBeLessThanOrEqual(10);

        // …and is gone after a reload (no localStorage write).
        await page.reload();
        const stored = await page.evaluate(() =>
            Object.keys(window.localStorage).filter((k) => k.includes('itemsPerPage'))
        );
        expect(stored).toEqual([]);
    });

    test('object-shaped fields (column widths, visibility) work without a persistent backend', async ({ page }) => {
        // Regression: the in-memory store crashed on the first write of an
        // object-codec value because its freshness check called the codec's
        // `isEqual` against an `undefined` slot, and `jsonRecordCodec.isEqual`
        // hit `Object.keys(undefined)`. This drove the visible "settings
        // popup doesn't apply / nothing in localStorage" report.
        await page.goto('/example/daisy-ui/basic/extensive-example');
        await expect(page.locator('tbody tr.datatable-row').first()).toBeVisible();

        const errors: string[] = [];
        page.on('pageerror', (err) => errors.push(err.message));

        // Drag the first sortable resize handle a bit.
        const firstTh = page.locator('th.datatable-th').first();
        const box = await firstTh.boundingBox();
        if (!box) throw new Error('no <th> rendered');
        const handleX = box.x + box.width - 4;
        const handleY = box.y + box.height / 2;
        await page.mouse.move(handleX, handleY);
        await page.mouse.down();
        await page.mouse.move(handleX + 80, handleY, { steps: 6 });
        await page.mouse.up();

        // Toggle a column off via the settings popover.
        await page.getByRole('button', { name: /Settings for table/i }).click();
        const popover = page.getByRole('dialog', { name: 'Table settings' });
        await expect(popover).toBeVisible();
        const firstCheckbox = popover.locator('input[type="checkbox"]').first();
        await firstCheckbox.uncheck();

        expect(errors, errors.join('\n')).toEqual([]);
    });
});
