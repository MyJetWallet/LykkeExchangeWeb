import {computed, observable, reaction} from 'mobx';
import {RootStore} from '.';
import {AuthApi} from '../api';
import {RandomString, StorageUtils} from '../utils/index';

const TOKEN_KEY = 'lww-token';
const STATE_KEY = 'lww-state';

const randomString = RandomString();
const tokenStorage = StorageUtils.withKey(TOKEN_KEY);
const stateStorage = StorageUtils.withKey(STATE_KEY);

const decodeState = (state: any): any => {
  return JSON.parse(atob(state));
};

const encodeState = (state: any): string => {
  return btoa(JSON.stringify(state));
};

export class AuthStore {
  readonly rootStore: RootStore;
  @observable token = tokenStorage.get();

  constructor(rootStore: RootStore, private api?: AuthApi) {
    this.rootStore = rootStore;
    reaction(
      () => this.token,
      token => {
        if (token) {
          tokenStorage.set(token);
        } else {
          tokenStorage.clear();
        }
      }
    );
  }

  catchUnauthorized = () => {
    this.signOut();
  };

  fetchToken = async (
    accessToken: string,
    state: string
  ): Promise<string | undefined> => {
    let redirectRoute = '';
    state = decodeURIComponent(state);
    if (state === stateStorage.get()) {
      const {token} = await this.api!.fetchToken(accessToken);
      this.token = token;
      redirectRoute = decodeState(state).route;
      tokenStorage.set(token);
      stateStorage.clear();
      return Promise.resolve(redirectRoute);
    } else {
      this.catchUnauthorized();
      return;
    }
  };

  signIn = () => {
    const {
      REACT_APP_AUTH_URL: url,
      REACT_APP_CLIENT_ID: clientId
    } = process.env;
    const nonce = randomString.mixed(20);
    // Send pathname as state to Oauth server
    // Parse it in fetchToken() component
    // Later pass it to use in AuthPage component for correct redirection
    const state = encodeState({
      nonce,
      route: window.location.pathname
    });
    stateStorage.set(state);

    const callbackUrl = window.location.origin + '/auth';

    location.replace(
      `${url}/connect/authorize?client_id=${clientId}&scope=profile email address&response_type=token&redirect_uri=${encodeURIComponent(
        callbackUrl!
      )}&nonce=${nonce}&state=${state}`
    );
  };

  signOut = async () => {
    this.rootStore.reset();
    const {REACT_APP_AUTH_URL: url} = process.env;
    location.replace(
      `${url}/connect/logout?post_logout_redirect_uri=${encodeURIComponent(
        process.env.REACT_APP_SITE_URL || 'https://lykke.com'
      )}`
    );
  };

  reset = () => {
    tokenStorage.clear();
  };

  @computed
  get isAuthenticated() {
    return !!this.token;
  }

  redirectToAuthServer = () => {
    tokenStorage.clear();
    this.signIn();
  };
}
