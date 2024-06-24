export class FetchError extends Error {
    override name = this.constructor.name;
    status = 500;
    details = {};

    constructor(message: string, code?: string) {
        super(message || code || 'Request failed');
        this.details = {
            code,
        };
        this.stack = '';
    }
}
