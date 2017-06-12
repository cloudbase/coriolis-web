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
import s from './CloudItem.scss';
import sApp from '../App/App.scss';
import Dropdown from '../NewDropdown';
import AddCloudConnection from '../AddCloudConnection';
import Modal from 'react-modal';

class CloudItem extends Component {
  static propTypes = {
    cloud: PropTypes.object,
    addCredentialsCallback: PropTypes.func,
    callback: PropTypes.func,
    exclude: PropTypes.string
  }

  constructor(props) {
    super(props);

    let credentialSelected = null
    if (props.credentialSelected !== null && props.credentialSelected.id !== props.exclude) {
      props.cloud.credentials.forEach(credential => {
        if (credential.name === props.credentialSelected.name) {
          credentialSelected = {
            label: credential.name,
            value: credential.id
          }
        }
      })
    }

    let credentialsOptions = []

    if (this.props.cloud.credentials) {
      this.props.cloud.credentials.forEach((credential) => {
        if (credential.id != this.props.exclude) {
          credentialsOptions.push({ value: credential.id, label: credential.name })
        }
      })
      credentialsOptions.push({ value: "new", label: "Add New ..." })
    }

    this.state = {
      showModal: false,
      credentialsOptions: credentialsOptions,
      credentialSelected: credentialSelected
    }
  }

  componentWillReceiveProps(nextProps) {
    this.updateCredentialOptions(nextProps)
    if (nextProps.selected === false && this.props.selected === true) {
      this.setState( {credentialSelected: null })
    }
  }

  onCredentialsChange(credential) {
    this.setState({ credentialSelected: credential, credential: credential })
    if (credential.value != "new") {
      this.props.callback({
        name: this.props.cloud.name,
        cloudRef: this.props.cloud,
        credential: { name: credential.label, id: credential.value }
      });
    } else {
      this.addNew()
    }
    return credential;
  }

  addConnection(connection) {
    let newCredentials = { cloudName: this.props.cloud.name, connection: connection }
    this.props.addCredentialsCallback(newCredentials)
    this.setState({ showModal: false }, () => {
      this.onCredentialsChange({ label: connection, value: connection })
    })
  }

  closeModal() {
    this.setState({ showModal: false })
  }

  /**
   * Opens new popup
   */
  addNew() {
    this.setState({ showModal: true })
  }

  updateCredentialOptions(props) {
    let credentialsOptions = []
    if (props.cloud.credentials) {
      props.cloud.credentials.forEach((credential) => {
        if (credential.id != this.props.exclude) {
          credentialsOptions.push({value: credential.id, label: credential.name})
        }
      })
      credentialsOptions.push({ value: "new", label: "Add New ..." })
    }

    this.setState({ credentialsOptions: credentialsOptions })
  }

  render() {
    let colorType = ""
    let credential

    if (this.props.cloud.credentials == null || this.props.cloud.credentials.length == 0) {
      credential = <button className="transparent" onClick={(e) => this.addNew(e)}>Add</button>
      colorType = "dimmer"
    } else {
      credential = (<Dropdown
        options={this.state.credentialsOptions}
        onChange={(e) => this.onCredentialsChange(e)}
        placeholder="Select"
        value={this.state.credentialSelected}
      />)
    }

    let modalStyle = {
      content: {
        padding: "0px",
        borderRadius: "4px",
        bottom: "auto",
        width: "576px",
        height: "auto",
        left: "50%",
        top: "20%",
        marginLeft: "-288px"
      }
    }

    return (
      <div className={s.root + " " + (this.props.selected ? s.selected : "")}>
        <div className={s.container}>
          <div className={s.cloudImage + " icon large-cloud " + this.props.cloud.name + " " + colorType}></div>
          {credential}
        </div>
        <Modal
          isOpen={this.state.showModal}
          contentLabel="Add new cloud connection"
          style={modalStyle}
        >
          <AddCloudConnection
            closeHandle={(e) => this.closeModal(e)}
            addHandle={(e) => this.addConnection(e)}
            cloud={this.props.cloud}
          />
        </Modal>
      </div>
    );
  }

}

export default withStyles(CloudItem, s);
