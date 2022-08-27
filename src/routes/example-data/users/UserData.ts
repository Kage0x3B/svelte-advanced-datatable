import type { DataRecord } from '$lib/types/DataRecord.js';

export interface UserData extends DataRecord {
	id: number;
	userName: string;
	firstName: string;
	lastName: string;
	mailAddress: string;
	/**
	 * This is only example data for showcasing the datatables.
	 * --> Never store passwords in plaintext anywhere!
	 */
	password: string;
	gender: 'male' | 'female';
}
