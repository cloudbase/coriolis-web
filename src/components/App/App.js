/*
Copyright (C) 2017  Cloudbase Solutions SRL

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import React, { PropTypes } from 'react';
import Reflux from 'reflux';
import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './App.scss';
import UserStore from '../../stores/UserStore';
import NotificationsStore from '../../stores/NotificationsStore';
import ConnectionsStore from '../../stores/ConnectionsStore';
import NotificationActions from '../../actions/NotificationActions';
import MigrationStore from '../../stores/MigrationStore';
import Notifications from '../Notifications'
import Api from '../ApiCaller'
import cookie from 'react-cookie'
import Location from '../../core/Location'

class App extends Reflux.Component {

  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
      onSetTitle: PropTypes.func,
      onSetMeta: PropTypes.func,
      onPageNotFound: PropTypes.func,
      onNewMigration: PropTypes.func,
      notify: PropTypes.func
    }),
    children: PropTypes.element.isRequired,
    error: PropTypes.object
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired,
    onSetTitle: PropTypes.func.isRequired,
    onSetMeta: PropTypes.func.isRequired,
    onPageNotFound: PropTypes.func.isRequired,
    notify: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props)
    this.stores = [UserStore, NotificationsStore, ConnectionsStore, MigrationStore]
    this.state = {
      notifications: []
    }

    // init token if page is refreshed
    let token = cookie.load('token')
    if (token) {
      Api.setDefaultHeader('X-Auth-Token', token)
    } else {
      Location.push("/login")
    }
  }

  getChildContext() {
    const context = this.props.context;
    return {
      insertCss: context.insertCss || emptyFunction,
      onSetTitle: context.onSetTitle || emptyFunction,
      onSetMeta: context.onSetMeta || emptyFunction,
      onPageNotFound: context.onPageNotFound || emptyFunction,
      notify: this.notify
    };
  }

  notify(message, type = "info", title = null) {
    NotificationActions.notify(message, type, title)
  }

  componentWillMount() {
    super.componentWillMount.call(this)
    const { insertCss } = this.props.context;
    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss()
  }

  render() {
    return !this.props.error ? (
      <div className={s.root}>
        <Notifications notifications={this.state.notifications} />
        {this.props.children}
      </div>
    ) : (<div className={s.root}>
      {this.props.children}
    </div>)
  }

}

export default App;
