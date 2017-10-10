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
import ReactTooltip from 'react-tooltip'
import Reflux from 'reflux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './WizardOptions.scss';
import Dropdown from '../NewDropdown';
import Helper from '../Helper'
import WizardActions from '../../actions/WizardActions';
import WizardStore from '../../stores/WizardStore';
import NotificationActions from '../../actions/NotificationActions';
import Switch from '../Switch'
import InfoIcon from '../InfoIcon'

const title = 'Migration Options';

class WizardOptions extends Reflux.Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };
  static propTypes = {
    setWizardState: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.store = WizardStore

    this.state = {
      autoFlavors: true,
      diskFormat: "VHD",
      fipPool: "public",
      valid: true,
      nextStep: "WizardNetworks",
      formSubmitted: false,
      nextCallback: (e) => this.nextCallback(e),
      showAdvancedOptions: props.data.showAdvancedOptions
    }
  }

  componentWillMount() {
    super.componentWillMount.call(this)
    WizardActions.updateWizardState(this.state)
    this.context.onSetTitle(title)
  }

  componentDidMount() {
    let destinationEnvironment = this.state.destination_environment
    this.state.targetCloud.cloudRef["import_" + this.state.migrationType].fields.forEach(field => {
      if (typeof field.default !== "undefined" && typeof destinationEnvironment[field.name] === "undefined") {
        destinationEnvironment[field.name] = field.default
      }
    }, this)

    WizardActions.updateWizardState({ destination_environment: destinationEnvironment })
  }

  handleChangeAutoFlavor() {
    this.setState({ autoFlavors: !this.state.autoFlavors }, this.updateWizard)
  }

  handleChangeDiskFormat(value) {
    this.setState({ diskFormat: value }, this.updateWizard)
  }

  handleChangeFipPool(value) {
    this.setState({ fipPool: value }, this.updateWizard)
  }

  updateWizard() {
    WizardActions.updateWizardState(this.state)
  }

  isValid(field) {
    if (field.required && this.state.formSubmitted && field.name != "network_map"
      && field.name != "destination_network") {
      if (!this.state.destination_environment[field.name]) {
        return false
      } else {
        return this.state.destination_environment[field.name].trim().length != 0;
      }
    } else {
      return true
    }
  }

  nextCallback(callback) {
    let valid = true
    this.setState({ formSubmitted: true }, () => {
      this.state.targetCloud.cloudRef["import_" + this.state.migrationType].fields.forEach(field => {
        if (!this.isValid(field)) {
          valid = false
        }
      })
      if (callback && valid) {
        callback()
      }
      if (!valid) {
        NotificationActions.notify("Please fill all required fields", "error")
      }
    })
  }

  toggleAdvancedOptions() {
    let showAdvancedOptions = !this.state.showAdvancedOptions
    this.setState({ showAdvancedOptions: showAdvancedOptions })
    WizardActions.updateWizardState({ showAdvancedOptions: showAdvancedOptions })
  }

  handleAdvancedOptionsSwitch(e) {
    this.setState({ showAdvancedOptions: e.target.checked })
    WizardActions.updateWizardState({ showAdvancedOptions: e.target.checked })
  }

  handleOptionsFieldChange(e, field) {
    let destinationEnvironment = this.state.destination_environment
    if (field.type === 'dropdown') {
      destinationEnvironment[field.name] = e.value
    } else if (field.type === 'switch') {
      destinationEnvironment[field.name] = e.target.checked
    } else {
      destinationEnvironment[field.name] = e.target.value
    }
    WizardActions.updateWizardState({ destination_environment: destinationEnvironment })
  }

  renderField(field) {
    let returnValue
    let extraClasses = ""
    if (field.required) {
      extraClasses += "required"
    }
    if (this.state.showAdvancedOptions) {
      extraClasses += " showAdvanced"
    }
    if (!this.isValid(field)) {
      extraClasses += " error"
    }
    switch (field.type) {
      case "text":
        returnValue = (
          <div
            className={"form-group " + extraClasses}
            key={"cloudField_" + field.name}
          >
            <div className="input-label">
              {field.label + (field.required ? " *" : "")}
              <InfoIcon text={Helper.getCloudFieldDescription(field.name)} />
            </div>
            <input
              type="text"
              placeholder={field.label + (field.required ? " *" : "")}
              onChange={(e) => this.handleOptionsFieldChange(e, field)}
              value={this.state.destination_environment[field.name]}
            />
          </div>
        )
        break;
      case "password":
        returnValue = (
          <div
            className={"form-group " + extraClasses}
            key={"cloudField_" + field.name}
          >
            <div className="input-label">{
              field.label + (field.required ? " *" : "")}
              <InfoIcon text={Helper.getCloudFieldDescription(field.name)} />
            </div>
            <input
              type="password"
              placeholder={field.label + (field.required ? " *" : "")}
              onChange={(e) => this.handleOptionsFieldChange(e, field)}
              value={this.state.destination_environment[field.name]}
            />
          </div>
        )
        break;
      case 'switch':
        returnValue = (
          <div
            className={"form-group " + extraClasses}
            key={"cloudField_" + field.name}
          >
            <div className="input-label">
              {field.label + (field.required ? " *" : "")}
              <InfoIcon text={Helper.getCloudFieldDescription(field.name)} />
            </div>
            <Switch
              checked={this.state.destination_environment[field.name] === true ||
                this.state.destination_environment[field.name] === 'true'}
              onChange={(e) => this.handleOptionsFieldChange(e, field)}
              checkedLabel="Yes"
              uncheckedLabel="No"
            />
          </div>
        )
        break
      case "dropdown":
        let value = this.state.destination_environment[field.name]

        if (value) {
          value = field.options && field.options.length && field.options.find(o => o.value === value).label
        }

        returnValue = (
          <div
            className={"form-group " + extraClasses}
            key={"cloudField_" + field.name}
          >
            <div className="input-label">
              {field.label + (field.required ? " *" : "")}
              <InfoIcon text={Helper.getCloudFieldDescription(field.name)} />
            </div>
            <Dropdown
              options={field.options}
              onChange={(e) => this.handleOptionsFieldChange(e, field)}
              placeholder={field.label + (field.required ? " *" : "")}
              value={value}
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
                checked={option.value == this.state.destination_environment[field.name]}
                onChange={(e) => this.handleOptionsFieldChange(e, field)}
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

  renderOptionsFields(fields) {
    if (this.state.currentCloudData == null) {
      this.setState({ currentCloudData: {} })
    }
    if (!this.state.isConnecting) {
      let optionFields = fields.map(field => this.renderField(field), this)
      let totalFields = optionFields.filter(f => f !== undefined).length
      let requiredFields = fields.filter(f => f.required).length
      let visibleFields = this.state.showAdvancedOptions ? totalFields : requiredFields

      return (
        <div className={s.optionsFieldsContainer + ' ' + (visibleFields <= 4 ? s.oneColumn : '')}>
          {optionFields}
        </div>
      )
    } else {
      return (
        <div className={s.connecting}>
          <div className={s.loadingImg}></div>
          <div className={s.text}>Connecting ...</div>
        </div>)
    }
  }

  render() {
    let toggleAdvancedSwitch = (
      <div className={s.toggleAdvancedSwitch}>
        <div className={s.toggleAdvancedLabel}>Simple</div>
        <Switch
          checked={this.state.showAdvancedOptions}
          onChange={this.handleAdvancedOptionsSwitch.bind(this)}
        />
        <div className={s.toggleAdvancedLabel}>Advanced</div>
      </div>
    )

    return (
      <div className={s.root}>
        <div className={s.container}>
          {toggleAdvancedSwitch}
          <div className={s.containerCenter}>
            {this.renderOptionsFields(this.state.targetCloud.cloudRef["import_" + this.state.migrationType].fields)}
          </div>
        </div>
        <ReactTooltip place="right" effect="solid" className="reactTooltip" />
      </div>
    );
  }

}

export default withStyles(WizardOptions, s);
