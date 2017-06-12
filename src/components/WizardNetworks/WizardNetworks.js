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
import s from './WizardNetworks.scss';
import Dropdown from '../NewDropdown';
import {targetNetworkMock} from '../../config';

const title = 'Network mapping';

class WizardNetworks extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  static propTypes = {
    data: PropTypes.object,
    setWizardState: PropTypes.func
  }

  constructor(props) {
    super(props)
    console.log("PROPS", props)
    let networks = this.props.data.networks
    networks.forEach(network => {network.selected = false})
    /*this.props.data.vms.forEach((vm) => {
      if (vm.selected) {
        networks.forEach((network) => {
          if (vm.networks.indexOf(network.id) != -1) {
            network.selected = true
            if (network.migrateNetwork == null) {
              network.migrateNetwork = "Create new"
            }
          }
        })
      }
    })*/

    this.state = {
      networks: networks,
      nextStep: "WizardOptions",
      valid: true
    }

    this.networkOptions = ["Create new"]
    //this.props.data.targetNetworks.forEach((network) => {
    targetNetworkMock.forEach((network) => {
      this.networkOptions.push(network)
    }, this)
  }

  componentWillMount() {
    this.props.setWizardState(this.state)
    this.context.onSetTitle(title);
  }

  handleChangeNetwork(event, network) {
    let index = this.state.networks.indexOf(network)
    let networks = this.state.networks
    networks[index].migrateNetwork = event.value
    this.setState({ networks: networks }, () => {
      this.props.setWizardState(this.state)
    })
  }

  render() {
    let _this = this
    let networks = this.state.networks.map((network, index) => {
      if (network.selected || true) {
        return (
          <div className="item" key={"networks_" + index}>
            <div className="cell cell-icon">
              <div className="icon network"></div>
              <span className="details">
                {network.name}
              </span>
            </div>
            <div className="cell">
              <div className="arrow"></div>
            </div>
            <div className="cell">
              <Dropdown
                options={_this.networkOptions}
                onChange={(e) => _this.handleChangeNetwork(e, network)}
                value={network.migrateNetwork}
              />
            </div>
          </div>
        )
      } else {
        return null
      }
    })

    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className="items-list">
            {networks}
          </div>
        </div>
      </div>
    );
  }

}

export default withStyles(WizardNetworks, s);
