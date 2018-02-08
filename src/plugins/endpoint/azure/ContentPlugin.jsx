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

import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import NotificationActions from '../../../actions/NotificationActions'
import Palette from '../../../components/styleUtils/Palette'
import StyleProps from '../../../components/styleUtils/StyleProps'
import {
  Button,
  LoadingButton,
  TextArea,
  RadioInput,
} from '../../../components'
import { Wrapper, Fields, FieldStyled, Buttons, Row } from '../default/ContentPlugin'

const RadioGroup = styled.div`
  width: 100%;
`
const CloudProfile = styled.div``
const ConfigLabel = styled.div`
  font-size: 11px;
  color: ${Palette.grayscale[3]};
  margin-top: -10px;
`
const CustomConfigWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
`
const CustomConfigTitle = styled.div`
  text-align: center;
`
const CustomInputType = styled.div`
  margin-top: 32px;
  > div {
    margin-bottom: 16px;
  }
`
const PasteField = styled.div`
  margin-top: 32px;
  overflow: auto;
`
const PasteFieldLabel = styled.div`
  font-size: 10px;
  font-weight: ${StyleProps.fontWeights.medium};
  color: ${Palette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 4px;
`
const PasteFieldInput = styled.div``

const Pages = {
  main: 'main',
  custom: 'custom',
}
const CustomTypes = {
  manual: 'manual',
  json: 'json',
}

const fieldNameMapper = {
  activeDirectory: 'active_directory_url',
  activeDirectoryDataLakeResourceId: 'active_directory_data_lake_resource_id',
  activeDirectoryGraphResourceId: 'active_directory_graph_resource_id',
  activeDirectoryResourceId: 'active_directory_resource_id',
  batchResourceId: 'batch_resource_endpoint',
  gallery: 'gallery_endpoint',
  management: 'management_endpoint',
  resourceManager: 'resource_manager_endpoint',
  sqlManagement: 'sql_management_endpoint',
  vmImageAliasDoc: 'vm_image_alias_doc',
  azureDatalakeAnalyticsCatalogAndJobEndpoint: 'azure_datalake_analytics_catalog_and_job_endpoint',
  azureDatalakeStoreFileSystemEndpoint: 'azure_datalake_store_file_system_endpoint',
  keyvaultDns: 'keyvault_dns',
  sqlServerHostname: 'sql_server_hostname',
  storageEndpoint: 'storage_endpoint',
}

class ContentPlugin extends React.Component {
  static propTypes = {
    connectionInfoSchema: PropTypes.array,
    validation: PropTypes.object,
    invalidFields: PropTypes.array,
    getFieldValue: PropTypes.func,
    handleFieldChange: PropTypes.func,
    handleFieldsChange: PropTypes.func,
    disabled: PropTypes.bool,
    cancelButtonText: PropTypes.string,
    validating: PropTypes.bool,
    handleValidateClick: PropTypes.func,
    handleCancelClick: PropTypes.func,
    highlightRequired: PropTypes.func,
    onRef: PropTypes.func,
    onResizeUpdate: PropTypes.func,
  }

  constructor() {
    super()

    this.state = {
      currentPage: Pages.main,
      customType: CustomTypes.json,
      jsonConfig: '',
    }
  }

  componentDidMount() {
    this.props.onRef(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.customType !== this.state.customType || prevState.currentPage !== this.state.currentPage) {
      this.props.onResizeUpdate()
    }
  }

  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  handleNextClick() {
    if (!this.props.highlightRequired()) {
      this.setState({ currentPage: Pages.custom })
    } else {
      NotificationActions.notify('Please fill all the required fields', 'error')
    }
  }

  findInvalidFields = () => {
    let invalidFields = []
    const find = fields => {
      fields.forEach(field => {
        if (field.required) {
          let value = this.props.getFieldValue(field)
          if (!value) {
            invalidFields.push(field.name)
          }
        }
      })
    }
    find(this.props.connectionInfoSchema)

    let loginTypeField = this.props.connectionInfoSchema.find(f => f.name === 'login_type')
    let selectedLoginTypeField = loginTypeField.items.find(f => f.name === this.props.getFieldValue(loginTypeField))
    find(selectedLoginTypeField.fields)

    if (this.state.currentPage === Pages.custom) {
      let customCloudFields = this.props.connectionInfoSchema.find(f => f.name === 'cloud_profile').custom_cloud_fields
      find(customCloudFields)
    }

    return invalidFields
  }

  handleJsonConfigChange(value) {
    this.setState({ jsonConfig: value })

    let json
    try {
      json = JSON.parse(value)
    } catch (e) {
      return
    }

    if (!json.endpoints || !json.suffixes) {
      return
    }

    let updatedFields = []
    const setValue = (object, key) => {
      if (object[key]) {
        updatedFields.push({ field: { name: fieldNameMapper[key] }, value: object[key] })
      }
    }
    Object.keys(json.endpoints).forEach(k => {
      setValue(json.endpoints, k)
    })
    Object.keys(json.suffixes).forEach(k => {
      setValue(json.suffixes, k)
    })
    this.props.handleFieldsChange(updatedFields)
  }

  handleJsonPaste() {
    if (this.pasteTimeout) {
      clearTimeout(this.pasteTimeout)
      this.pasteTimeout = null
    }

    this.pasteTimeout = setTimeout(() => {
      this.setState({ customType: CustomTypes.manual })
    }, 1000)
  }

  renderField(field, customProps) {
    return (
      <FieldStyled
        {...field}
        large
        disabled={this.props.disabled}
        key={field.name}
        password={field.name === 'password'}
        highlight={this.props.invalidFields.findIndex(fn => fn === field.name) > -1}
        value={this.props.getFieldValue(field)}
        onChange={value => { this.props.handleFieldChange(field, value) }}
        {...customProps}
      />
    )
  }

  renderFieldGroup(fields) {
    const rows = []
    let lastField
    fields.forEach((field, i) => {
      const currentField = this.renderField(field)
      if (i % 2 !== 0) {
        rows.push((
          <Row key={field.name}>
            {lastField}
            {currentField}
          </Row>
        ))
      }
      lastField = currentField
    })

    return rows
  }

  renderCustomPage() {
    if (this.state.currentPage !== Pages.custom) {
      return null
    }

    let fields = null

    if (this.state.customType === CustomTypes.manual) {
      fields = (
        <Fields>
          {this.renderFieldGroup(this.props.connectionInfoSchema.find(f => f.name === 'cloud_profile').custom_cloud_fields)}
        </Fields>
      )
    } else {
      fields = (
        <PasteField>
          <PasteFieldLabel>Azure Stack Profile Configuration JSON</PasteFieldLabel>
          <PasteFieldInput>
            <TextArea
              width="100%"
              height="164px"
              placeholder="Paste JSON output here"
              value={this.state.jsonConfig}
              onChange={e => { this.handleJsonConfigChange(e.target.value) }}
              onPaste={() => { this.handleJsonPaste() }}
            />
          </PasteFieldInput>
        </PasteField>
      )
    }

    let title = <CustomConfigTitle>Azure Stack Additional Configuration</CustomConfigTitle>
    if (this.props.validating || this.props.validation) {
      title = null
    }

    return (
      <CustomConfigWrapper>
        {title}
        <CustomInputType>
          <RadioInput
            checked={this.state.customType === CustomTypes.json}
            label="Paste Configuration"
            onChange={e => { if (e.target.checked) this.setState({ customType: CustomTypes.json }) }}
          />
          <RadioInput
            checked={this.state.customType === CustomTypes.manual}
            label="Manual Input"
            onChange={e => { if (e.target.checked) this.setState({ customType: CustomTypes.manual }) }}
          />
        </CustomInputType>
        {fields}
      </CustomConfigWrapper>
    )
  }

  renderMainPage() {
    if (this.state.currentPage === Pages.custom) {
      return null
    }

    const fields = this.props.connectionInfoSchema

    let renderedFields = this.renderFieldGroup(fields.filter(f => f.name !== 'login_type' && f.name !== 'cloud_profile'))

    let loginTypeField = fields.find(f => f.name === 'login_type')

    renderedFields.push((
      <RadioGroup key="radio-group">
        {loginTypeField.items.map(field =>
          this.renderField(field, {
            value: this.props.getFieldValue(loginTypeField) === field.name,
            onChange: value => { if (value) this.props.handleFieldChange(loginTypeField, field.name) },
          })
        )}
      </RadioGroup>
    ))

    renderedFields = renderedFields.concat(this.renderFieldGroup(loginTypeField.items.find(f => f.name === this.props.getFieldValue(loginTypeField)).fields))

    const cloudProfileWrapper = (
      <CloudProfile key="cloudProfile">
        {this.renderField(fields.find(f => f.name === 'cloud_profile'))}
        {this.renderAdditionalConfigLabel()}
      </CloudProfile>
    )
    renderedFields.push(cloudProfileWrapper)

    return (
      <Fields>
        {renderedFields}
      </Fields>
    )
  }

  renderAdditionalConfigLabel() {
    const fields = this.props.connectionInfoSchema

    if (fields.length === 0 ||
      this.props.getFieldValue(this.props.connectionInfoSchema.find(f => f.name === 'cloud_profile')) !== 'CustomCloud') {
      return null
    }

    return <ConfigLabel>* Additional configuration required</ConfigLabel>
  }

  renderActionButton() {
    let cloudProfileField = this.props.connectionInfoSchema.find(f => f.name === 'cloud_profile')

    if (this.props.getFieldValue(cloudProfileField) === 'CustomCloud' && this.state.currentPage === Pages.main) {
      return <Button large onClick={() => this.handleNextClick()}>Next</Button>
    }

    let actionButton = <Button large onClick={() => this.props.handleValidateClick()}>Validate and save</Button>

    let message = 'Validating Endpoint ...'
    if (this.props.validating || (this.props.validation && this.props.validation.valid)) {
      if (this.props.validation && this.props.validation.valid) {
        message = 'Saving ...'
      }

      actionButton = <LoadingButton large>{message}</LoadingButton>
    }

    return actionButton
  }

  renderCancelButton() {
    let cancelButton

    if (this.state.currentPage === Pages.main) {
      cancelButton = <Button large secondary onClick={() => { this.props.handleCancelClick() }}>{this.props.cancelButtonText}</Button>
    } else {
      cancelButton = <Button large secondary onClick={() => { this.setState({ currentPage: Pages.main }) }}>Back</Button>
    }

    return cancelButton
  }

  renderButtons() {
    return (
      <Buttons>
        {this.renderCancelButton()}
        {this.renderActionButton()}
      </Buttons>
    )
  }

  render() {
    const fields = this.props.connectionInfoSchema
    if (fields.length === 0) {
      return null
    }

    return (
      <Wrapper>
        {this.renderMainPage()}
        {this.renderCustomPage()}
        {this.renderButtons()}
      </Wrapper>
    )
  }
}

export default ContentPlugin
