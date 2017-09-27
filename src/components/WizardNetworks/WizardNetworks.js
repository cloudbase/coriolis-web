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
import WizardActions from '../../actions/WizardActions';
import LoadingIcon from '../LoadingIcon';
import ConnectionsActions from '../../actions/ConnectionsActions';

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

    this.networkOptions = null // [{ label: "Create new", value: null }]
    ConnectionsActions.loadNetworks(this.props.data.targetCloud.credential)

    props.data.selectedInstances.forEach((vm) => {
      ConnectionsActions.loadInstanceDetail({ id: this.props.data.sourceCloud.credential.id }, vm)
    })

    let valid = true
    if (props.data.networks) {
      props.data.networks.forEach(item => {
        if (item.migrateNetwork === null) {
          valid = false
        }
      })
    } else {
      valid = false
    }

    let networks = props.data.networks
    if (networks && networks.length) {
      networks.sort((a, b) => a.network_name > b.network_name)
    }

    this.state = {
      networks: networks || null,
      nextStep: "WizardSummary",
      valid: valid
    }
  }

  componentWillMount() {
    WizardActions.updateWizardState(this.state)
    this.context.onSetTitle(title);
  }

  componentWillReceiveProps(props) {
    this.processProps(props)
  }

  processProps(props) {
    let networks = []

    props.data.selectedInstances.forEach((vm) => {
      if (vm.devices && vm.devices.nics) {
        vm.devices.nics.forEach((item) => {
          let exists = false
          networks.forEach(network => {
            if (network.network_name == item.network_name) {
              exists = true
            }
          })
          if (!exists) {
            if (!item.migrateNetwork) {
              item.migrateNetwork = null
            }
            networks.push(item)
          }
        })
      }
    })

    if (networks.length == 0) {
      networks = null
    }
    if (props.data.targetNetworks && props.data.targetNetworks.length) {
      this.networkOptions = []

      let targetNetworks = props.data.targetNetworks
      targetNetworks.sort((a, b) => a.name > b.name)

      targetNetworks.forEach((network) => {
        this.networkOptions.push({
          label: network.name,
          value: network.name
        })
      }, this)
    }
    this.setState({ networks: networks })
  }

  handleChangeNetwork(event, network) {
    let index = this.state.networks.indexOf(network)
    let valid = true
    let networks = this.state.networks
    networks[index].migrateNetwork = event.value
    networks.forEach(item => {
      if (item.migrateNetwork === null) {
        valid = false
      }
    })

    this.setState({
      networks: networks,
      valid: valid
    }, () => {
      WizardActions.updateWizardState(this.state)
    })
  }

  render() {
    if (this.state.networks != null) {
      let networks = this.state.networks.map((network, index) => {
        let networkDropdown
        if (this.networkOptions == null) {
          networkDropdown = "Searching for networks ..."
        } else if (this.networkOptions.length) {
          networkDropdown = (<Dropdown
            options={this.networkOptions}
            onChange={(e) => this.handleChangeNetwork(e, network)}
            value={network.migrateNetwork}
          />)
        } else {
          networkDropdown = "Could not find networks"
        }
        return (
          <div className="item" key={"networks_" + index}>
            <div className="cell cell-icon">
              <div className={s.networkIcon}></div>
              <span className="details">
                {network.network_name}
              </span>
            </div>
            <div className="cell">
              <div className="arrow"></div>
            </div>
            <div className="cell">
              {networkDropdown}
            </div>
          </div>
        )
      }, this)

      return (
        <div className={s.root}>
          <div className={s.container}>
            <div className="items-list">
              {networks}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={s.root}>
          <div className={s.container}>
            <div className="items-list">
              <LoadingIcon text="Loading networks..." />
            </div>
          </div>
        </div>
      );
    }
  }

}

export default withStyles(WizardNetworks, s);
