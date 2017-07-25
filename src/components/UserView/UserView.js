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
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserView.scss';
import Header from '../Header';
import Link from '../Link';
import UserStore from '../../stores/UserStore';

class UserView extends Reflux.Component {
  title = ""
  constructor(props) {
    super(props)
    this.store = UserStore
  }
  static propTypes = {
    type: PropTypes.string
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  componentWillMount() {
    super.componentWillMount.call(this)
  }

  componentDidMount() {
    this.context.onSetTitle(this.title);
  }

  goBack() {
    window.history.back();
  }

  render() {
    let item = this.state.currentUser
    return (
      <div className={s.root}>
        <Header title="" />
        <div className={s.connectionHead}>
          <div className={s.container}>
            <div className="backBtn" onClick={(e) => this.goBack(e)}></div>
            <div className={s.userIcon}></div>
            <div className={s.connectionInfo}>
              <h2>{item.name}</h2>
            </div>
          </div>
        </div>
        <div className={s.container}>
          <div className={s.sidebar}>
            <Link
              to={"/user/profile/"}
              className={this.props.type == 'profile' ? "active" : ""}
            >Overview</Link>
            <Link
              to={"/user/billing/"}
              className={this.props.type == 'billing' ? "active" : ""}
            >Billing</Link>
          </div>
          <div className={s.content}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }

}

export default withStyles(UserView, s);
