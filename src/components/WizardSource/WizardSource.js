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
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './WizardSource.scss';
import CloudItem from '../CloudItem';
import ConnectionStore from '../../stores/ConnectionsStore';
import ConnectionsActions from '../../actions/ConnectionsActions';
import Reflux from 'reflux';
import LoadingIcon from '../LoadingIcon';

const title = 'Select your source cloud';


class WizardSource extends Reflux.Component {
  clouds = []
  constructor(props) {
    super(props)

    this.store = ConnectionStore

    this.state = {
      valid: false,
      clouds: this.props.clouds
    }
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  componentWillMount() {
    super.componentWillMount.call(this)
    this.context.onSetTitle(title);

    // Load cloud if already in wizard state
    if (this.props.cloud != null) {
      this.state.clouds.forEach((item) => {
        if (item.name == this.props.cloud.name) {
          item.selected = true
          item.credentialSelected = this.props.cloud.credentials
          this.props.setWizardState({ valid: true, nextStep: "WizardTarget" })
        }
      }, this)
    }
  }

  componentWillReceiveProps(props) {
    this.setState({ clouds: props.clouds })
  }

  selectCloud(cloudData) {
    if (cloudData) {
      let newCloudsState = this.state.clouds
      let vms
      let networks
      let selected = false
      newCloudsState.forEach((item) => {
        if (item.name == cloudData.name) {
          selected = cloudData.credentials

          vms = []
          /*item.vms.forEach((vm) => {
            vms.push(Object.assign({}, vm))
          }, this)*/

          /*item.networks.forEach((network) => {
            networks.push(Object.assign({}, network))
          }, this)*/
        }
      })

      this.setState({ clouds: newCloudsState, selected: selected }, () => {
        // we're all good, next step
        this.props.setWizardState({
          sourceCloud: Object.assign({}, cloudData),
          valid: true,
          nextStep: "WizardTarget",
          nextCallback: (e) => this.nextCallback(e),
          vms: vms
        })
      })
    }
  }

  nextCallback(callback) {
    let connection = this.props.cloud.credential
    // TODO: change this, shitty callback, go through stores
    if (this.props.cloud.credential && this.props.cloud.credential.id === this.props.cloud.credential.name) { // new connection, does not have an ID yet, search it
      connection = this.state.connections.filter(item => item.name === connection.name)[0]
    }

    ConnectionsActions.loadInstances(connection, 0, "", false, true)
    if (callback) {
      callback()
    }
  }

  addCredentialsCallback(data) {
    let targetCloud = null

    this.state.clouds.forEach((cloud) => {
      if (cloud.name == data.cloudName) {
        targetCloud = cloud
      }
    })
    // Select cloud after new credentials have been added
    this.selectCloud(targetCloud)
  }

  render() {
    let cloudList = <LoadingIcon />
    let cloudCount = 0
    if (this.state.clouds) {
      cloudList = this.state.clouds.map((item, index) => {
        if (item[this.props.type].export) {
          cloudCount++
          return (<CloudItem
            cloud={item}
            credentialSelected={this.props.cloud && this.props.cloud.credential}
            selected={this.props.cloud ? this.props.cloud.name == item.name : false}
            callback={(e) => this.selectCloud(e)}
            addCredentialsCallback={(e) => this.addCredentialsCallback(e)}
            key={index}
          />)
        } else {
          return null
        }
      }, this)
    }

    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.cloudList + " cloudCount_" + cloudCount}>
            {cloudList}
          </div>
        </div>
      </div>
    );
  }

}

export default withStyles(WizardSource, s);
