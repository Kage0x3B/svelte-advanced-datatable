export class SearchError extends Error {
	public readonly args: string[];

	constructor(i18nMessage: string, ...args: string[]) {
		super(i18nMessage);

		Error.captureStackTrace && Error.captureStackTrace(this, SearchError);

		this.args = args;
	}
}
