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

import React from 'react';
import Reflux from 'reflux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import UserDropdown from '../UserDropdown';
import s from './UserIcon.scss';
import UserStore from '../../stores/UserStore';

class UserIcon extends Reflux.Component {

  static defaultProps = {
    dark: false
  }

  constructor(props) {
    super(props)
    this.store = UserStore
  }

  componentWillMount() {
    super.componentWillMount.call(this)
  }

  render() {
    return (
      <div className={s.root}>
        <UserDropdown userData={this.state.currentUser} dark={this.props.dark}/>
      </div>
    );
  }

}

export default withStyles(UserIcon, s);
