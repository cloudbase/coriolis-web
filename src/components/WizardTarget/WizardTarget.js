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
import s from './WizardTarget.scss';
import CloudItem from '../CloudItem';
import ConnectionsActions from '../../actions/ConnectionsActions';
import WizardActions from '../../actions/WizardActions';
import {networkMock} from '../../config';

const title = 'Select your target cloud';

class WizardTarget extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  static propTypes = {
    clouds: PropTypes.array,
    cloud: PropTypes.object,
    setWizardState: PropTypes.func,
    exclude: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      valid: false,
      clouds: this.props.clouds,
      selected: null
    }
  }

  componentWillMount() {
    this.context.onSetTitle(title);

    // Load cloud if already in wizard state
    if (this.props.cloud != null) {
      this.state.clouds.forEach((item) => {
        if (item.name == this.props.cloud.name) {
          item.selected = true
          item.credentialSelected = this.props.cloud.credentials
          WizardActions.updateWizardState({ valid: true, nextStep: "WizardVms" })
        }
      }, this)
    }
  }

  componentWillReceiveProps(props) {
    this.setState({ clouds: props.clouds })
  }

  clouds = []

  selectCloud(cloudData) {
    if (cloudData) {
      let newCloudsState = this.state.clouds
      let selected = false
      newCloudsState.forEach((item) => {
        if (item.name == cloudData.name) {
          //item.selected = cloudData.credentials
          selected = cloudData.credentials

          // load import endpoints if missing
          if (item.replica.import && !cloudData.import_replica) {
            ConnectionsActions.loadProviderType(item.name, "import_replica")
          }
          if (item.migration.import && !cloudData.import_migration) {
            ConnectionsActions.loadProviderType(item.name, "import_migration")
          }
        }
      })

      this.setState({ clouds: newCloudsState }, () => {
        // we're all good, next step
        WizardActions.updateWizardState({
          targetCloud: Object.assign({}, cloudData),
          selected: selected,
          valid: true,
          nextCallback: (e) => this.nextCallback(e),
          nextStep: "WizardVms",
          networks: null
        })
      })
    }
  }

  nextCallback(callback) {
    let connection = this.props.cloud.credential
    // TODO: change this, shitty callback, go through stores
    if (this.props.cloud.credential && this.props.cloud.credential.id === this.props.cloud.credential.name) {
      connection = this.state.connections.filter(item => item.name === connection.name)[0]
    }

    ConnectionsActions.loadNetworks(connection)
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
    let cloudCount = 0
    let cloudList = this.state.clouds.map((item, index) => {
      if (item[this.props.type].import) {
        cloudCount++
        return (<CloudItem
          selected={this.props.cloud ? this.props.cloud.name == item.name : false}
          credentialSelected={this.props.cloud && this.props.cloud.credential}
          exclude={this.props.exclude}
          cloud={item}
          callback={(e) => this.selectCloud(e)}
          addCredentialsCallback={(e) => this.addCredentialsCallback(e)}
          key={index}
        />)
      } else {
        return null
      }
    }, this)

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

export default withStyles(WizardTarget, s);
