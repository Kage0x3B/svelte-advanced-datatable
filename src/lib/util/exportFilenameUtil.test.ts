import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { buildExportFilename, sanitizeFilenameSegment } from './exportFilenameUtil.js';

const FIXED = DateTime.fromISO('2026-05-08T14:30:00', { zone: 'utc' });

describe('sanitizeFilenameSegment', () => {
    it('keeps allowed characters as-is', () => {
        expect(sanitizeFilenameSegment('userData')).toBe('userData');
        expect(sanitizeFilenameSegment('user-data_v2')).toBe('user-data_v2');
        expect(sanitizeFilenameSegment('users.list')).toBe('users.list');
    });

    it('replaces unsafe characters with underscore', () => {
        expect(sanitizeFilenameSegment('user/data')).toBe('user_data');
        expect(sanitizeFilenameSegment('user data')).toBe('user_data');
        expect(sanitizeFilenameSegment('user:data?q=1')).toBe('user_data_q_1');
    });

    it('falls back to "export" when sanitization removes everything', () => {
        expect(sanitizeFilenameSegment('???')).toBe('___');
        expect(sanitizeFilenameSegment('')).toBe('export');
    });

    it('truncates to 80 characters', () => {
        const long = 'a'.repeat(200);
        expect(sanitizeFilenameSegment(long).length).toBe(80);
    });
});

describe('buildExportFilename', () => {
    it('builds the expected csv filename', () => {
        expect(buildExportFilename('userData', 'csv', FIXED)).toBe('userData_2026-05-08_14-30-00.csv');
    });

    it('builds the expected json filename', () => {
        expect(buildExportFilename('userData', 'json', FIXED)).toBe('userData_2026-05-08_14-30-00.json');
    });

    it('sanitizes the type segment', () => {
        expect(buildExportFilename('a/b c', 'csv', FIXED)).toBe('a_b_c_2026-05-08_14-30-00.csv');
    });
});
