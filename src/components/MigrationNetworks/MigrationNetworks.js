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

import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Table from '../Table';
import s from './MigrationNetworks.scss';

const title = 'Migration Networks';

class MigrationNetworks extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  static propTypes = {
    migration: PropTypes.object
  }

  constructor(props) {
    super(props)
    this.headers = [
      { label: "Source Network", key: 'source_network' },
      { label: "Connected VMs", key: 'connected_vms' },
      { label: "Destination Network", key: 'destination_network' },
      { label: "Destination Type", key: 'destination_type' }
    ]

    this.listItems = []
    this.processProps(props)
  }

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  getConnectedVms(networkId) {
    let vms = []
    this.props.migration.instances.forEach((item) => {
      if (item.networks.indexOf(networkId) != -1) {
        vms.push(item.name)
      }
    })
    return vms
  }

  processProps(props) {
    if (props.migration && props.migration.destination_environment) {
      for (let i in props.migration.destination_environment.network_map) {
        let newItem = {
          source_network: i,
          connected_vms: "-",
          destination_network: props.migration.destination_environment.network_map[i],
          destination_type: "Existing network"
        }
        this.listItems.push(newItem)
      }
      /*
       props.migration.destination_environment.network_map.forEach((item) => {
       //let connectedVms = this.getConnectedVms(item.id).join(", ")
       let connectedVms = "-"
       let newItem = {
       source_network: item.name,
       connected_vms: connectedVms,
       destination_network: item.migrateNetwork,
       destination_type: item.migrateNetwork == "Create new" ? "New network" : "Existing network"
       }
       this.listItems.push(newItem)
       }*/
    }
  }

  render() {
    if (this.listItems.length) {
      return (
        <div className={s.root}>
          <div className={s.container}>
            <Table headerItems={this.headers} listItems={this.listItems} />
          </div>
        </div>
      );
    } else {
      return (<div className="no-results">No networks mapped</div>)
    }
  }
}

export default withStyles(MigrationNetworks, s);
