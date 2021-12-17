import { GraphQLResult } from '@aws-amplify/api-graphql';
import { api as API } from '../services';
import Observable from 'zen-observable-ts';
import { UnexpectedGraphqlResult } from './Errors';
import { isObservable, observableToPromise } from './observable-type';

export type GraphQLStamentsObject = { [k: string] : string };

export class GraphqlAPI<Q extends GraphQLStamentsObject, M extends GraphQLStamentsObject> {
    constructor(
        public queries: Q,
        public mutations: M
    ) {
    }

    async unwrapGraphQLResponse<T>(
        prom: Promise<GraphQLResult> | Observable<object>,
        queryName: keyof Q | keyof M
    ): Promise<T | undefined> {
        const result = await prom;
        if (isObservable<T>(result))
            return observableToPromise<T>(result);

        const data = (result as GraphQLResult<T>).data as any;
        return data ? data[queryName] : undefined;
    };


    async query<T>(name: keyof Q, variables?: object): Promise<T> {
        const query = this.queries[name] as string;
        if (!query) throw new Error(`Can't find a query named ${name}`);

        const result = await this.unwrapGraphQLResponse<T>(API.graphql({ query, variables }), name);

        if (result === undefined)
            throw new UnexpectedGraphqlResult(result, `query.${name}`);
        return result;
    }

    async mutation<T>(name: keyof M, variables: object = {}): Promise<T> {
        const mutation = this.mutations[name] as string;
        if (!mutation) throw new Error(`Can't find a query named ${name}`);

        const result = await this.unwrapGraphQLResponse<T>(API.graphql({ query: mutation, variables }), name);

        if (result === undefined)
            throw new UnexpectedGraphqlResult(result, `mutation.${name}`);
        return result;
    };

    async booleanMutation(name: keyof M, variables: object = {}): Promise<boolean> {
        const result = await this.mutation<boolean>(name, variables);

        if (!result) {
            throw new Error(`Unexpected value "true" from mutation ${name}. Got: ${result}`);
        }
        return Promise.resolve(!!result);
    };
}
