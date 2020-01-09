import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {RootStoreProps} from '../../App';
import {STORE_ROOT} from '../../constants/stores';
import {AuthUtils} from '../../utils';

type AuthPageProps = RootStoreProps & RouteComponentProps<any>;

export class AuthPage extends React.Component<AuthPageProps> {
  private readonly authStore = this.props.rootStore!.authStore;

  componentDidMount() {
    const accessToken = AuthUtils.getOAuthParamFromUrl(
      location.href,
      'access_token'
    )!;
    const state = AuthUtils.getOAuthParamFromUrl(location.href, 'state')!;

    if (accessToken) {
      this.authStore
        .fetchToken(accessToken, state)
        .then((route: string) => this.props.history.push(route));
    } else {
      this.authStore.signIn();
    }
  }

  render() {
    return null;
  }
}

export default inject(STORE_ROOT)(observer(AuthPage));
