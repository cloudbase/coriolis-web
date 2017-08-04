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
import MigrationStore from '../../stores/MigrationStore';

class EndpointUsage extends Reflux.Component {

  static propTypes = {
    connectionId: PropTypes.string
  };

  constructor(props) {
    super(props)

    this.store = MigrationStore;

    this.state = {
      connectionId: props.connectionId,
      migrationCount: 0,
      replicaCount: 0
    }
  }

  componentWillMount() {
    super.componentWillMount.call(this)
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(props) {
    if (props.connectionId && this.state.migrations) {
      let migrationCount = 0
      let replicaCount = 0
      this.state.migrations.forEach(migration => {
        if (migration.destination_endpoint_id === this.state.connectionId ||
          migration.origin_endpoint_id === this.state.connectionId) {
          migrationCount++
        }
      })
      this.state.replicas.forEach(replica => {
        if (replica.destination_endpoint_id === this.state.connectionId ||
          replica.origin_endpoint_id === this.state.connectionId) {
          replicaCount++
        }
      })
      this.setState({ migrationCount: migrationCount, replicaCount: replicaCount })
    }
  }

  render() {
    if (this.state && this.state.connectionId) {
      return <div>{this.state.migrationCount} migrations, {this.state.replicaCount} replicas</div>;
    } else {
      return null
    }
  }
}

export default EndpointUsage;
