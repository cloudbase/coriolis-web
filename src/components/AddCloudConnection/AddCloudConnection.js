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
import s from './AddCloudConnection.scss';
import Reflux from 'reflux';
import ConnectionsStore from '../../stores/ConnectionsStore';
import ConnectionsActions from '../../actions/ConnectionsActions';
import NotificationActions from '../../actions/NotificationActions';
import Dropdown from '../NewDropdown';
import LoadingIcon from "../LoadingIcon/LoadingIcon";

const title = 'Add Cloud Connection';

class AddCloudConnection extends Reflux.Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  static defaultProps = {
    cloud: null,
    connection: null
  }

  constructor(props) {
    super(props)

    this.store = ConnectionsStore

    this.state = {
      connectionName: null,
      description: null,
      currentCloud: this.props.cloud,
      currentCloudData: null,
      connected: false,
      isConnecting: false,
      requiredFields: [],
      cloudFormsSubmitted: false
    }
  }

  componentWillMount() {
    super.componentWillMount.call(this)
    this.context.onSetTitle(title);
  }

  componentDidMount() {
    if (this.props.connection) {
      this.state.allClouds.forEach(item => {
        if (item.name === this.props.connection.type) {
          let credentials = this.props.connection.credentials
          for (var i in credentials) {
            credentials[i] = credentials[i] + ""
          }
          this.setState({
            currentCloudData: credentials,
            connectionName: this.props.connection.name,
            description: this.props.connection.description
          }, () => {
            this.chooseCloud(item)
          })
        }
      })
    } else if (this.props.cloud) {
      this.chooseCloud(this.props.cloud)
    }
  }

  handleChangeName(e) {
    this.setState({ connectionName: e.target.value })
  }

  handleChangeDescription(e) {
    this.setState({ description: e.target.value })
  }

  handleAdd() {
    let credentials = Object.assign({}, this.state.currentCloudData)
    for (var key in credentials) {
      if (credentials[key].label) {
        credentials[key] = credentials[key].value
      }
    }

    ConnectionsActions.newConnection({
      name: this.state.connectionName,
      description: this.state.description,
      type: this.state.currentCloud.name,
      connection_info: credentials
    })
    this.props.addHandle(this.state.connectionName);
  }

  chooseCloud(cloud) {
    let currentCloudData = {}
    if (this.state.currentCloudData !== null) {
      currentCloudData = this.state.currentCloudData
    }
    let requiredFields = []

    cloud.endpoint.fields.forEach(field => {
      if (typeof currentCloudData[field.name] == "undefined") {
        if (field.type == "dropdown") {
          currentCloudData[field.name] = field.options[0]
        } else {
          currentCloudData[field.name] = ""
        }
      } else {

      }
      if (field.required) {
        requiredFields.push(field.name)
      }

    })

    this.setState({
      currentCloud: cloud,
      currentCloudData: currentCloudData,
      requiredFields: requiredFields
    }, this.setDefaultValues)
  }

  handleBack() {
    this.setState({
      currentCloudData: null,
      currentCloud: null,
      requiredFields: null,
      connectionName: null,
      description: null
    })
  }

  setDefaultValues() {
    this.state.currentCloud.endpoint.fields.forEach(field => {
      let currentCloudData = this.state.currentCloudData
      switch (field.type) {
        case 'dropdown':
          field.options.forEach(option => {
            if (option.default === true && typeof currentCloudData[field.name] == "undefined") {
              currentCloudData[field.name] = option
              this.setState({ currentCloudData: currentCloudData })
            }
          }, this)
          break
        case 'switch-radio':
          field.options.forEach(option => {
            if (option.default && typeof currentCloudData[field.name] == "undefined") {
              currentCloudData[field.name] = option.value
              this.setState({ currentCloudData: currentCloudData })
            }
          }, this)
          break;
        case 'text':
          if (field.default && typeof currentCloudData[field.name] == "undefined") {
            currentCloudData[field.name] = field.default
            this.setState({ currentCloudData: currentCloudData })
          }
          break
        default:
          break;
      }
    }, this)
  }

  isValid(field) {
    if (field.required && this.state.cloudFormsSubmitted) {
      if (this.state.currentCloudData[field.name].length == 0) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  }

  handleCancel() {
    this.props.closeHandle();
  }

  renderCloudList() {
    let clouds = this.state.allClouds.map((cloud, index) => {
      let colorType = ""
      if (cloud.credentials != null && cloud.credentials.length != 0) {
        colorType = ""
      }

      return (
        <div className={s.cloudContainer} key={"cloudImage_" + index}>
          <div
            className={s.cloudImage + " icon large-cloud " + cloud.name + " " + colorType}
            onClick={() => this.chooseCloud(cloud)}
          ></div>
        </div>
      )
    }, this)

    return (
      <div className={s.container}>
        <div className={s.cloudList}>
          {clouds}
        </div>
        <div className={s.buttons}>
          <button className={s.centerBtn + " gray"} onClick={(e) => this.handleCancel(e)}>Cancel</button>
        </div>
      </div>
    )
  }

  renderField(field) {
    let returnValue
    switch (field.type) {
      case "text":
        returnValue = (
          <div className={"form-group " + (this.isValid(field) ? "" : s.error)} key={"cloudField_" + field.name}>
            <input
              type="text"
              placeholder={field.label + (field.required ? " *" : "")}
              onChange={(e) => this.handleCloudFieldChange(e, field)}
              value={this.state.currentCloudData[field.name]}
            />
          </div>
        )
        break;
      case "password":
        returnValue = (
          <div className={"form-group " + (this.isValid(field) ? "" : s.error)} key={"cloudField_" + field.name}>
            <input
              type="password"
              placeholder={field.label + (field.required ? " *" : "")}
              onChange={(e) => this.handleCloudFieldChange(e, field)}
              value={this.state.currentCloudData[field.name]}
            />
          </div>
        )
        break;
      case "dropdown":
        returnValue = (
          <div className={"form-group " + (this.isValid(field) ? "" : s.error)} key={"cloudField_" + field.name}>
            <Dropdown
              options={field.options}
              onChange={(e) => this.handleCloudFieldChange(e, field)}
              placeholder={field.label + (field.required ? " *" : "")}
              value={this.state.currentCloudData[field.name]}
            />
          </div>
        )
        break;
      case "switch-radio":
        let fields = ""
        field.options.forEach((option) => {
          if (option.value == this.state.currentCloudData[field.name]) {
            fields = option.fields.map((optionField) => this.renderField(optionField))
          }
        })
        let radioOptions = field.options.map((option, key) => (
            <div key={"radio_option_" + key} className={s.radioOption}>
              <input
                type="radio"
                value={option.value}
                id={option.name}
                checked={option.value == this.state.currentCloudData[field.name]}
                onChange={(e) => this.handleCloudFieldChange(e, field)}
              /> <label htmlFor={option.name}>{option.label}</label>
            </div>
          )
        )
        returnValue = (
          <div key={"cloudField_" + field.name}>
            <div className="form-group switch-radio" key={"cloudField_" + field.name}>
              { radioOptions }
            </div>
            <div></div>
            {fields}
          </div>
        )
        break;
      default:
        break
    }
    return returnValue
  }

  connectToCloud() {
    // TODO: Validation here
    let valid = true

    for (var i in this.state.currentCloudData) {
      if (this.state.requiredFields.indexOf(i) > -1 && !this.state.currentCloudData[i]) {
        valid = false
      }
    }
    if (!valid) {
      NotificationActions.notify("Please fill all required fields", "error")
      this.setState({ cloudFormsSubmitted: true })
    } else {
      this.setState({ isConnecting: true })
      setTimeout(() => {
        this.setState({ isConnecting: false, connected: true })
      }, 1000)
    }
  }

  handleCloudFieldChange(e, field) {
    let currentCloudData = this.state.currentCloudData
    if (field.type == 'dropdown') {
      currentCloudData[field.name] = e
    } else {
      currentCloudData[field.name] = e.target.value
    }
    this.setState({ currentCloudData: currentCloudData })
  }

  renderCloudFields(cloud) {
    if (this.state.currentCloudData == null) {
      this.setState({ currentCloudData: {} })
    }
    if (!this.state.isConnecting) {
      let fields = cloud.endpoint.fields.map(field => this.renderField(field), this)
      return (
        <div className={s.container}>
          <div className={s.cloudImage}>
            <div className={" icon large-cloud " + this.state.currentCloud.name}></div>
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Endpoint Name"
              onChange={(e) => this.handleChangeName(e)}
              value={this.state.connectionName}
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Endpoint Description"
              onChange={(e) => this.handleChangeDescription(e)}
              value={this.state.description}
            ></textarea>
          </div>
          <div className={s.cloudFields + (cloud.endpoint.fields.length > 6 ? " " + s.larger : "")}>
            {fields}
          </div>
          <div className={s.buttons}>
            <button className={s.leftBtn + " gray"} onClick={(e) => this.handleBack(e)}>Back</button>
            <button className={s.rightBtn} onClick={(e) => this.handleAdd(e)}>Save</button>
          </div>
        </div>
      )
    } else {
      return (
        <div className={s.connecting}>
          <LoadingIcon/>
          <div className={s.text}>Connecting ...</div>
        </div>)
    }
  }

  renderSaveConnection() {
    return (
      <div className={s.container}>
        <div className={s.cloudImage}>
          <div className={" icon large-cloud " + this.state.currentCloud.name}></div>
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Connection name"
            onChange={(e) => this.handleChangeName(e)}
            value={this.state.connectionName}
          />
        </div>
        <div className="form-group">
          <textarea onChange={(e) => this.handleChangeDescription(e)} value={this.state.description}></textarea>
        </div>
        <div className={s.buttons}>
          <button className={s.leftBtn + " gray"} onClick={(e) => this.handleBack(e)}>Back</button>
          <button className={s.rightBtn} onClick={(e) => this.handleAdd(e)}>Add</button>
        </div>
      </div>
    )
  }

  render() {
    let modalBody

    if (this.state.currentCloud == null) {
      if (this.state.allClouds) {
        modalBody = this.renderCloudList()
      } else {
        modalBody = <LoadingIcon/>
      }
    } else {
      modalBody = this.renderCloudFields(this.state.currentCloud)
    }
    return (
      <div className={s.root}>
        <div className={s.header}>
          <h3>{title}</h3>
        </div>
        {modalBody}
      </div>
    );
  }

}

export default withStyles(AddCloudConnection, s);
