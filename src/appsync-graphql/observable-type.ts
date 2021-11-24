import Observable from 'zen-observable-ts';
import { hasMethod } from 'dmonesi-utils-ts';

/**
 * Check if the given object is an Observable. This utility checks
 * that the object have 3 different methods:
 * - subscribe
 * @param p -
 * @returns
 */
export const isObservable = <T>(p: any): p is Observable<T> => {
    return hasMethod(p, 'subscribe');
};

/**
 * Subscribes to the observable and return a promise resolved
 * with the last value emitted.
 * @param p -
 * @returns
 */
export const observableToPromise = async <T>(obs: Observable<T>) => {
    return new Promise<T>((resolve, reject) => {
        let lastResult: T;
        obs.subscribe({
            next(x) {
                lastResult = x;
            },
            error: reject,
            complete() {
                resolve(lastResult);
            }
        });
    });
};
