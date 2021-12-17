import * as Amplify from 'aws-amplify';
import * as Mobx from 'mobx';


export let amplify: typeof Amplify;
export let mobx: typeof Mobx;
export let hub: typeof Amplify.Hub;
export let api: typeof Amplify.API;
export let auth: typeof Amplify.Auth;


export const configureServices = (amplifyInstance: typeof Amplify, mobxInstance: typeof Mobx) => {
    amplify = amplifyInstance;
    mobx = mobxInstance;
    api = amplifyInstance.API;
    auth = amplifyInstance.Auth;
    hub = amplifyInstance.Hub;
};
