import API, { GraphQLResult } from '@aws-amplify/api-graphql';
import Observable from 'zen-observable-ts';
import { UnexpectedGraphqlResult } from './Errors';
import { isObservable, observableToPromise } from './observable-type';

export class GraphqlAPI {
    constructor(
        public queries: Record<string, string>,
        public mutations: Record<string, string>
    ) {
    }

    async unwrapGraphQLResponse<T>(
        prom: Promise<GraphQLResult> | Observable<object>,
        queryName: string
    ): Promise<T | undefined> {
        const result = await prom;
        if (isObservable<T>(result))
            return observableToPromise<T>(result);

        const data = (result as GraphQLResult<T>).data as any;
        return data ? data[queryName] : undefined;
    };


    async query<T>(name: string, variables?: object): Promise<T> {
        const query = this.queries[name] as string;
        if (!query) throw new Error(`Can't find a query named ${name}`);

        const result = await this.unwrapGraphQLResponse<T>(API.graphql({ query, variables }), name);

        if (result === undefined)
            throw new UnexpectedGraphqlResult(result, `query.${name}`);
        return result;
    }

    async mutation<T>(name: string, variables: object = {}): Promise<T> {
        const mutation = this.mutations[name] as string;
        if (!mutation) throw new Error(`Can't find a query named ${name}`);

        const result = await this.unwrapGraphQLResponse<T>(API.graphql({ query: mutation, variables }), name);

        if (result === undefined)
            throw new UnexpectedGraphqlResult(result, `mutation.${name}`);
        return result;
    };

    async booleanMutation(name: string, variables: object = {}): Promise<boolean> {
        const result = this.mutation<boolean>(name, variables);

        if (!result) {
            throw new Error(`Unexpected value "true" from mutation ${name}. Got: ${result}`);
        }
        return Promise.resolve(!!result);
    };
}
