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
import s from './CloudConnection.scss';
import ConnectionsStore from '../../stores/ConnectionsStore';
import ConnectionsActions from '../../actions/ConnectionsActions';


class CloudConnection extends Reflux.Component {
  title = ""
  constructor(props) {
    super(props)
    this.store = ConnectionsStore

    this.state = {
      connection: {
        name: null,
        cloudName: null,
        id: null
      },
      title: 'Edit'
    }
  }

  static propTypes = {
    type: PropTypes.string,

  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  componentWillMount() {
    super.componentWillMount.call(this)
    ConnectionsActions.loadConnectionDetail(this.props.connectionId)
  }

  componentDidMount() {
    this.context.onSetTitle(this.title);
  }

  render() {
    return (
      <div className={s.root}>
        {React.cloneElement(this.props.children, {
          connections: this.state.connections,
          connectionId: this.props.connectionId })}
      </div>
    );
  }

}

export default withStyles(CloudConnection, s);
