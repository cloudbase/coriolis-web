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

// @flow

import React from 'react'
import styled from 'styled-components'

import TextArea from '../../../components/atoms/TextArea'
import ToggleButtonBar from '../../../components/atoms/ToggleButtonBar'
import type { Field } from '../../../types/Field'

import Palette from '../../../components/styleUtils/Palette'
import StyleProps from '../../../components/styleUtils/StyleProps'
import KeyboardManager from '../../../utils/KeyboardManager'
import { Wrapper, Fields, FieldStyled, Row } from '../default/ContentPlugin'

const ToggleButtonBarStyled = styled(ToggleButtonBar)`
  margin-top: 16px;
`
const RadioGroup = styled.div`
  width: 100%;
`
const PasteWrapper = styled.div``
const PasteLabel = styled.div`
  display: flex;
  font-size: 10px;
`
const PasteLabelText = styled.div`
  font-weight: ${StyleProps.fontWeights.medium};
  color: ${Palette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 4px;
`
const PasteLabelShowMore = styled.div`
  color: ${Palette.primary};
  margin-left: 5px;
  cursor: pointer;
`

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

type Props = {
  connectionInfoSchema: Field[],
  validation: { valid: boolean, validation: { message: string } },
  invalidFields: string[],
  getFieldValue: (field: ?Field) => any,
  handleFieldChange: (field: Field, value: any) => void,
  handleFieldsChange: (updatedFields: { field: Field, value: any }[]) => void,
  disabled: boolean,
  cancelButtonText: string,
  validating: boolean,
  onRef: (contentPlugin: any) => void,
  onResizeUpdate: (scrollOfset: number) => void,
  scrollableRef: (ref: HTMLElement) => void,
}
type State = {
  jsonConfig: string,
  showPasteInput: boolean,
  showAdvancedOptions: boolean,
}
class ContentPlugin extends React.Component<Props, State> {
  state = {
    jsonConfig: '',
    showPasteInput: false,
    showAdvancedOptions: false,
  }

  cloudProfileChanged: boolean
  lastBlurValue: string

  componentDidMount() {
    this.props.onRef(this)
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.showAdvancedOptions !== this.state.showAdvancedOptions || this.cloudProfileChanged
      || prevState.showPasteInput !== this.state.showPasteInput) {
      let scrollOffset = 0
      if (prevState.showPasteInput !== this.state.showPasteInput && this.state.showPasteInput) {
        scrollOffset = 100
      }
      this.props.onResizeUpdate(scrollOffset)
      this.cloudProfileChanged = false
    }
  }

  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  handleJsonConfigBlur() {
    if (this.lastBlurValue && this.lastBlurValue === this.state.jsonConfig) {
      return
    }
    this.lastBlurValue = this.state.jsonConfig

    let json
    try {
      json = JSON.parse(this.state.jsonConfig)
    } catch (e) {
      return
    }

    if (!json.endpoints || !json.suffixes) {
      return
    }

    let managementUrl = json.endpoints.management
    if (managementUrl && !json.endpoints.sqlManagement) {
      if (managementUrl.lastIndexOf('/') === managementUrl.length - 1) {
        managementUrl = managementUrl.substr(0, managementUrl.length - 1)
      }
      json.endpoints.sqlManagement = `${managementUrl}:8443/`
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

  handleFieldChange(field: Field, value: any) {
    if (field.name === 'cloud_profile') {
      this.cloudProfileChanged = true
    }
    this.props.handleFieldChange(field, value)
  }

  handleAdvancedOptionsToggle(showAdvancedOptions: boolean) {
    this.setState({ showAdvancedOptions })
  }

  getSelectedLoginTypeField() {
    let loginTypeField = this.props.connectionInfoSchema.find(f => f.name === 'login_type')
    return loginTypeField && loginTypeField.items ? loginTypeField.items.find(f => f.name === this.props.getFieldValue(loginTypeField)) : null
  }

  isServicePrincipalLogin() {
    let selectedLoginTypeField = this.getSelectedLoginTypeField()
    return selectedLoginTypeField && selectedLoginTypeField.name === 'service_principal_credentials'
  }

  findInvalidFields = () => {
    let invalidFields = []
    let selectedLoginTypeField = this.getSelectedLoginTypeField()
    const isCustomCloud = this.props.getFieldValue({ name: 'cloud_profile' }) === 'CustomCloud'

    const find = fields => {
      if (!fields) {
        return
      }
      fields.forEach(field => {
        if ((field.name === 'tenant' && (isCustomCloud || this.isServicePrincipalLogin())) || field.required) {
          if (!this.props.getFieldValue(field)) {
            invalidFields.push(field.name)
          }
        }
      })
    }
    find(this.props.connectionInfoSchema)
    find(selectedLoginTypeField && selectedLoginTypeField.fields)

    if (isCustomCloud) {
      // $FlowIgnore
      let customCloudFields = this.props.connectionInfoSchema.find(f => f.name === 'cloud_profile').custom_cloud_fields
      find(customCloudFields)
    }

    return invalidFields
  }

  renderField(field: Field, customProps?: { value: any, onChange: (value: any) => void }) {
    return (
      <FieldStyled
        {...field}
        width={StyleProps.inputSizes.large.width}
        disabled={this.props.disabled}
        key={field.name}
        password={field.name === 'password'}
        highlight={this.props.invalidFields.findIndex(fn => fn === field.name) > -1}
        value={this.props.getFieldValue(field)}
        onChange={value => { this.handleFieldChange(field, value) }}
        {...customProps}
      />
    )
  }

  renderFieldRows(fields: Field[], skipRequiredCheck?: boolean) {
    const rows = []
    let lastField

    let tenantField = fields.find(f => f.name === 'tenant')
    if (tenantField) {
      tenantField.required = this.isServicePrincipalLogin() || this.props.getFieldValue({ name: 'cloud_profile' }) === 'CustomCloud'
    }

    let filteredFields = skipRequiredCheck || this.state.showAdvancedOptions ? fields : fields.filter(f => f.required)

    filteredFields.forEach((field, i) => {
      const currentField = this.renderField(field)
      if (i % 2 !== 0) {
        rows.push((
          <Row key={`${lastField.key}-${field.name}`}>
            {lastField}
            {currentField}
          </Row>
        ))
      } else if (i === filteredFields.length - 1) {
        rows.push((
          <Row id={field.name}>
            {currentField}
          </Row>
        ))
      }
      lastField = currentField
    })

    return rows
  }

  renderPasteField() {
    const textArea = (
      <TextArea
        width="100%"
        height="96px"
        placeholder="Use the Azure CLI to get the details of a registered cloud and paste it here"
        value={this.state.jsonConfig}
        onFocus={() => { KeyboardManager.onKeyDown('json-config', null, 3) }} // disable key down propagation
        onBlur={() => { KeyboardManager.removeKeyDown('json-config'); this.handleJsonConfigBlur() }}
        onChange={e => { this.setState({ jsonConfig: e.target.value }) }}
        disabled={this.props.disabled}
      />
    )

    return (
      <PasteWrapper>
        <PasteLabel>
          <PasteLabelText>Paste Configuration (optional)</PasteLabelText>
          <PasteLabelShowMore
            onClick={() => { this.setState({ showPasteInput: !this.state.showPasteInput }) }}
          >{this.state.showPasteInput ? 'Hide' : 'Show'}</PasteLabelShowMore>
        </PasteLabel>
        {this.state.showPasteInput ? textArea : null}
      </PasteWrapper>
    )
  }

  renderFields() {
    const fields = this.props.connectionInfoSchema
    const cloudProfileField = fields.find(f => f.name === 'cloud_profile')
    const loginTypeField = fields.find(f => f.name === 'login_type')
    if (!loginTypeField || !loginTypeField.items) {
      return null
    }
    let loginTypeFieldItems = loginTypeField.items.find(f => f.name === this.props.getFieldValue(loginTypeField))
    if (!loginTypeFieldItems || !loginTypeFieldItems.fields || !cloudProfileField) {
      return null
    }
    const allowUntrustedField = loginTypeFieldItems.fields.find(f => f.name === 'allow_untrusted')

    let fieldsRows = this.renderFieldRows(fields.filter(f => f.name !== loginTypeField.name && f.name !== cloudProfileField.name), true)

    const radioGroupRow = (
      <Row key="radio-group-row">
        <RadioGroup key="radio-group">
          {loginTypeField.items && loginTypeField.items.map(field =>
            this.renderField(field, {
              value: this.props.getFieldValue(loginTypeField) === field.name,
              onChange: value => { if (value) this.props.handleFieldChange(loginTypeField, field.name) },
            })
          )}
        </RadioGroup>
        {allowUntrustedField ? this.renderField(allowUntrustedField) : null}
      </Row>
    )

    fieldsRows.push(radioGroupRow)
    if (!loginTypeField || !loginTypeField.items) {
      return null
    }
    if (!loginTypeFieldItems || !loginTypeFieldItems.fields || !allowUntrustedField) {
      return null
    }

    let fieldsToRender = [
      ...loginTypeFieldItems.fields.filter(f => f.name !== allowUntrustedField.name),
      cloudProfileField,
    ]

    const isCustomCloud = this.props.getFieldValue(cloudProfileField) === 'CustomCloud'
    if (isCustomCloud) {
      fieldsToRender = [
        ...fieldsToRender,
        // $FlowIgnore
        ...cloudProfileField.custom_cloud_fields,
      ]
    }

    fieldsRows = fieldsRows.concat(this.renderFieldRows(fieldsToRender))

    return (
      <Fields innerRef={ref => { this.props.scrollableRef(ref) }}>
        {fieldsRows}
        {isCustomCloud ? this.renderPasteField() : null}
      </Fields>
    )
  }

  renderSimpleAdvancedToggle() {
    return (
      <ToggleButtonBarStyled
        items={[{ label: 'Simple', value: 'simple' }, { label: 'Advanced', value: 'advanced' }]}
        selectedValue={this.state.showAdvancedOptions ? 'advanced' : 'simple'}
        onChange={item => { this.handleAdvancedOptionsToggle(item.value === 'advanced') }}
      />
    )
  }

  render() {
    const fields = this.props.connectionInfoSchema
    if (fields.length === 0) {
      return null
    }

    return (
      <Wrapper>
        {this.renderSimpleAdvancedToggle()}
        {this.renderFields()}
      </Wrapper>
    )
  }
}

export default ContentPlugin
