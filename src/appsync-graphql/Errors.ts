
export class UnexpectedGraphqlResult extends Error {
    constructor(
        public readonly result: any,
        public readonly apiName: string
    ) {
        super(`Unexpected result "${result ? JSON.stringify(result) : result}" from API "${apiName}".`);
    }
}
