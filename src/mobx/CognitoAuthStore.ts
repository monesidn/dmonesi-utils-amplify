import Auth, { CognitoUser } from '@aws-amplify/auth';
import { Hub } from 'aws-amplify';
import { makeAutoObservable, runInAction } from 'mobx';

/**
 * Ready to use Mobx Store interfacing with Cognito APIs. This Store
 * is expected to be instantiated on application startup. The best
 * way to use it is to declare a member of your RootStore to hold it.
 * Example:
 * ```
 * export class RootStore {
 *      authStore = new CognitoAutoStore();
 * }
 * ```
 */
export default class CognitoAutoStore {
    user?: CognitoUser | null;
    userId?: string | null;
    username?: string | null;

    userAttributes?: Record<string, string> | null;

    private async updateUser(user: CognitoUser | null) {
        if (!user) {
            runInAction(() => {
                this.user = null;
                this.username = null;
                this.userId = null;
                this.userAttributes = null;
            });
        } else {
            const attrs = await Auth.userAttributes(user);
            const emailAttr = attrs.find((a) => a.Name === 'email');
            const username = emailAttr ? emailAttr.Value : user.getUsername();

            const unwrappedAttrs: Record<string, string> = {};
            for (const a of attrs) {
                unwrappedAttrs[a.Name] = a.Value;
            }

            runInAction(() => {
                this.userAttributes = unwrappedAttrs;
                this.userId = user.getUsername();
                this.user = user;
                this.username = username;
            });
        }
    }

    private createListener() {
        return (data: any) => {
            switch (data.payload.event) {
            case 'signIn':
                this.updateUser(data.payload.data);
                break;
            case 'signOut':
                this.updateUser(null);
                break;
            }
        };
    }

    private async restoreSession() {
        let user: CognitoUser | null;
        try {
            this.updateUser(await Auth.currentAuthenticatedUser());
        } catch (ex) {
            console.log('currentAuthenticatedUser returned an error', ex);
            this.updateUser(null);
        }
        runInAction(() => this.user = user);
        console.log('Current user', this.user);
    }

    get loggedIn() {
        return !!this.user;
    }

    async logout() {
        return Auth.signOut();
    }

    constructor() {
        makeAutoObservable(this);

        Hub.listen('auth', this.createListener());
        this.restoreSession();
    }
}
