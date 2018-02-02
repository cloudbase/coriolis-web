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
import connectToStores from 'alt-utils/lib/connectToStores'

import {
  EndpointLogos,
  EndpointField,
  Button,
  StatusIcon,
  LoadingButton,
  CopyButton,
  Tooltip,
  StatusImage,
  RadioInput,
  TextArea,
} from 'components'
import NotificationActions from '../../../actions/NotificationActions'
import EndpointStore from '../../../stores/EndpointStore'
import EndpointActions from '../../../actions/EndpointActions'
import ProviderStore from '../../../stores/ProviderStore'
import ProviderActions from '../../../actions/ProviderActions'
import ObjectUtils from '../../../utils/ObjectUtils'
import Palette from '../../styleUtils/Palette'
import DomUtils from '../../../utils/DomUtils'
import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div`
  padding: 48px 32px 32px 32px;
  display: flex;
  align-items: center;
  flex-direction: column;
`
const Fields = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: -64px;
  margin-top: 32px;
`
const FieldStyled = styled(EndpointField)`
  margin-left: 64px;
  min-width: 224px;
  max-width: 224px;
  margin-bottom: 16px;
`
const RadioGroup = styled.div`
  width: 100%;
`
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 32px;
`
const Status = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const StatusHeader = styled.div`
  display: flex;
`
const StatusMessage = styled.div`
  margin-left: 8px;
  display: flex;
  align-items: center;
  line-height: 12px;
`
const ShowErrorButton = styled.span`
  font-size: 10px;
  color: ${Palette.primary};
  margin-left: 8px;
  cursor: pointer;
`
const StatusError = styled.div`
  margin-top: 32px;
  cursor: pointer;

  &:hover > span {
    opacity: 1;
  }
  > span {
    background-position-y: 4px;
    margin-left: 4px;
  }
`
const Content = styled.div`
  width: 100%;
`
const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;
`
const LoadingText = styled.div`
  font-size: 18px;
  margin-top: 32px;
`
const ConfigLabel = styled.div`
  font-size: 11px;
  margin-top: -10px;
  color: ${Palette.grayscale[3]};
`
const AdditionalConfigTitle = styled.div`
  text-align: center;
`
const AzureConfigInputType = styled.div`
  margin-top: 32px;
  > div {
    margin-bottom: 16px;
  }
`
const PasteField = styled.div`
  margin-top: 32px;
`
const PasteFieldLabel = styled.div`
  font-size: 10px;
  font-weight: ${StyleProps.fontWeights.medium};
  color: ${Palette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 4px;
`
const PasteFieldInput = styled.div``

class Endpoint extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    cancelButtonText: PropTypes.string,
    deleteOnCancel: PropTypes.bool,
    endpoint: PropTypes.object,
    connectionInfo: PropTypes.object,
    onFieldChange: PropTypes.func,
    onCancelClick: PropTypes.func,
    onResizeUpdate: PropTypes.func,
    onValidateClick: PropTypes.func,
    endpointStore: PropTypes.object,
    providerStore: PropTypes.object,
  }

  static defaultProps = {
    cancelButtonText: 'Cancel',
  }

  static getStores() {
    return [EndpointStore, ProviderStore]
  }

  static getPropsFromStores() {
    return {
      endpointStore: EndpointStore.getState(),
      providerStore: ProviderStore.getState(),
    }
  }

  constructor() {
    super()

    this.state = {
      fields: null,
      invalidFields: [],
      validating: false,
      showErrorMessage: false,
      endpoint: {},
      isNew: null,
      showAdditionalConfig: false, // if azure
      additionConfigManualInput: false, // if azure
      masJsonConfig: '', // if azure
    }
  }

  componentDidMount() {
    ProviderActions.getConnectionInfoSchema(this.getEndpointType())
  }

  componentWillReceiveProps(props) {
    let selectedRadio = this.getSelectedRadio(props.endpointStore.connectionInfo,
      props.providerStore.connectionInfoSchema)

    if (this.state.validating) {
      if (props.endpointStore.validation && !props.endpointStore.validation.valid) {
        this.setState({ validating: false })
      }
    }

    if (props.endpoint && props.endpointStore.connectionInfo) {
      this.setState({
        endpoint: {
          ...ObjectUtils.flatten(props.endpoint),
          ...selectedRadio,
          ...ObjectUtils.flatten(props.endpointStore.connectionInfo),
        },
      })
    } else {
      this.setState({
        isNew: this.state.isNew === null || this.state.isNew,
        endpoint: {
          type: props.type,
          ...selectedRadio,
          ...ObjectUtils.flatten(this.state.endpoint),
        },
      })
    }

    this.props.onResizeUpdate()
  }

  // if azure?
  componentDidUpdate(prevProps, prevState) {
    if (prevState.showAdditionalConfig !== this.state.showAdditionalConfig ||
      prevState.additionConfigManualInput !== this.state.additionConfigManualInput) {
      this.props.onResizeUpdate()
    }
  }

  componentWillUnmount() {
    EndpointActions.clearValidation()
    clearTimeout(this.closeTimeout)
  }

  getEndpointType() {
    if (this.props.endpoint) {
      return this.props.endpoint.type
    }

    return this.props.type
  }

  getSelectedRadio(connectionInfo, schema) {
    let radioGroup = schema.find(f => f.type === 'radio-group')

    if (!radioGroup) {
      return null
    }

    let selectedGroupItem = {}

    if (!connectionInfo) {
      selectedGroupItem[radioGroup.name] = radioGroup.default
    } else {
      radioGroup.items.forEach(i => {
        let key = Object.keys(connectionInfo).find(k => k === i.name)
        if (key) {
          selectedGroupItem[radioGroup.name] = key
        }
      })
    }

    return selectedGroupItem
  }

  getFieldValue(field, parentGroup) {
    if (parentGroup) {
      return this.state.endpoint[parentGroup.name] === field.name
    }

    if (this.state.endpoint[field.name]) {
      return this.state.endpoint[field.name]
    }

    if (Object.keys(field).find(k => k === 'default')) {
      return field.default
    }

    return ''
  }

  isValidating() {
    return this.state.validating
  }

  // if azure - isFinal
  findInvalidFields(invalidFields, schemaRoot, isFinal) {
    schemaRoot.forEach(field => {
      if (field.type === 'radio-group') {
        let selectedItem = field.items.find(i => i.name === this.state.endpoint[field.name])
        this.findInvalidFields(invalidFields, selectedItem.fields)
      } else if (field.required) {
        let value = this.getFieldValue(field)
        if (!value) {
          invalidFields.push(field.name)
        }
      } else if (isFinal && field.name === 'cloud_profile' && this.state.endpoint.cloud_profile === 'CustomCloud') {
        this.findInvalidFields(invalidFields, field.custom_cloud_fields)
      }
    })
  }

  highlightRequired(isFinal) {
    let invalidFields = []
    this.findInvalidFields(invalidFields, this.props.providerStore.connectionInfoSchema, isFinal)
    this.setState({ invalidFields })
    return invalidFields.length > 0
  }

  update() {
    EndpointActions.update(this.state.endpoint).promise.then(() => {
      NotificationActions.notify('Validating endpoint ...')
      EndpointActions.validate(this.state.endpoint)
    })
  }

  add() {
    EndpointActions.add(this.state.endpoint).promise.then(() => {
      let endpoint = EndpointStore.getState().endpoints[0]
      this.setState({ isNew: false, endpoint })
      NotificationActions.notify('Validating endpoint ...')
      EndpointActions.validate(endpoint)
    })
  }

  handleFieldChange(field, value, parentGroup) {
    let endpoint = { ...this.state.endpoint }

    if (parentGroup) {
      endpoint[parentGroup.name] = field.name
    } else {
      endpoint[field.name] = value
    }

    this.setState({ endpoint })
  }

  handleValidateClick() {
    if (!this.highlightRequired(true)) {
      this.setState({ validating: true })

      NotificationActions.notify('Saving endpoint ...')
      EndpointActions.clearValidation()

      if (this.state.isNew) {
        this.add()
      } else {
        this.update()
      }
    } else {
      NotificationActions.notify('Please fill all the required fields', 'error')
    }
  }

  handleShowErrorMessageClick() {
    this.setState({ showErrorMessage: !this.state.showErrorMessage })
  }

  handleCopyErrorMessageClick() {
    let succesful = DomUtils.copyTextToClipboard(this.props.endpointStore.validation.message)

    if (succesful) {
      NotificationActions.notify('The message has been copied to clipboard.')
    }
  }

  handleCancelClick() {
    if (this.props.deleteOnCancel && this.state.isNew === false) {
      EndpointActions.delete(EndpointStore.getState().endpoints[0])
    }
    this.props.onCancelClick()
  }

  // if azure
  handleNextClick() {
    if (!this.highlightRequired()) {
      this.setState({ showAdditionalConfig: true })
    } else {
      NotificationActions.notify('Please fill all the required fields', 'error')
    }
  }

  // if azure
  handleMasJsonConfigChange(value) {
    this.setState({ masJsonConfig: value })

    // JSON parse
    let json
    try {
      json = JSON.parse(value)
    } catch (e) {
      return
    }

    if (!json.endpoints || !json.suffixes) {
      return
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

    let endpoint = this.state.endpoint
    const setValue = (object, key) => {
      if (object[key]) {
        endpoint[fieldNameMapper[key]] = object[key]
      }
    }
    Object.keys(json.endpoints).forEach(k => {
      setValue(json.endpoints, k)
    })
    Object.keys(json.suffixes).forEach(k => {
      setValue(json.suffixes, k)
    })

    this.setState({ endpoint })
  }

  renderFields(fields, parentGroup) {
    let renderedFields = []

    fields.forEach(field => {
      if (field.type === 'radio-group') {
        renderedFields = renderedFields.concat(
          <RadioGroup key={field.name}>{this.renderFields(field.items, field)}</RadioGroup>
        )

        field.items.forEach(item => {
          if (this.getFieldValue(item, field)) {
            renderedFields = renderedFields.concat(this.renderFields(item.fields))
          }
        })

        return
      }

      renderedFields = renderedFields.concat(
        <FieldStyled
          {...field}
          large
          disabled={this.isValidating()
            || (this.props.endpointStore.validation && this.props.endpointStore.validation.valid)}
          key={field.name}
          password={field.name === 'password'}
          highlight={this.state.invalidFields.findIndex(fn => fn === field.name) > -1}
          value={this.getFieldValue(field, parentGroup)}
          onChange={value => { this.handleFieldChange(field, value, parentGroup) }}
        />
      )
    })

    return renderedFields
  }

  renderEndpointStatus() {
    let validation = this.props.endpointStore.validation
    if (!this.isValidating() && !validation) {
      return null
    }

    let status = 'RUNNING'
    let message = 'Validating Endpoint ...'
    let error = null
    let showErrorButton = null

    if (validation) {
      if (validation.valid) {
        message = 'Endpoint is Valid'
        status = 'COMPLETED'
      } else {
        status = 'ERROR'
        message = 'Validation failed'
        if (validation.message) {
          showErrorButton = (
            <ShowErrorButton onClick={() => { this.handleShowErrorMessageClick() }}>
              {this.state.showErrorMessage ? 'Hide' : 'Show'} Error</ShowErrorButton>
          )
          error = this.state.showErrorMessage ?
            <StatusError onClick={() => { this.handleCopyErrorMessageClick() }}>{validation.message}<CopyButton /></StatusError> : null
        }
      }
    }

    return (
      <Status>
        <StatusHeader>
          <StatusIcon status={status} />
          <StatusMessage>{message}{showErrorButton}</StatusMessage>
        </StatusHeader>
        {error}
      </Status>
    )
  }

  // if azure
  renderNextButton() {
    if (!this.state.endpoint.cloud_profile || this.state.endpoint.cloud_profile !== 'CustomCloud' || this.state.showAdditionalConfig) {
      return null
    }

    return <Button large onClick={() => this.handleNextClick()}>Next</Button>
  }

  renderActionButton() {
    let nextButton = this.renderNextButton()
    if (nextButton) {
      return nextButton
    }

    let button = <Button large onClick={() => this.handleValidateClick()}>Validate and save</Button>

    let message = 'Validating Endpoint ...'
    let validation = this.props.endpointStore.validation

    if (this.isValidating() || (validation && validation.valid)) {
      if (validation && validation.valid) {
        message = 'Saving ...'
      }

      button = <LoadingButton large>{message}</LoadingButton>
    }

    return button
  }

  renderCancelButton() {
    // if azure
    if (this.state.showAdditionalConfig) {
      return <Button large secondary onClick={() => { this.setState({ showAdditionalConfig: false }) }}>Back</Button>
    }

    return <Button large secondary onClick={() => { this.handleCancelClick() }}>{this.props.cancelButtonText}</Button>
  }

  // if azure
  renderAdditionalConfigLabel() {
    if (!this.state.endpoint.cloud_profile || this.state.endpoint.cloud_profile !== 'CustomCloud') {
      return null
    }

    return <ConfigLabel>* Additional configuration required</ConfigLabel>
  }

  renderContent() {
    // if azure
    if (this.props.providerStore.connectionSchemaLoading || this.state.showAdditionalConfig) {
      return null
    }

    return (
      <Content>
        {this.renderEndpointStatus()}
        <Fields>
          {this.renderFields(this.props.providerStore.connectionInfoSchema)}
        </Fields>
        {this.renderAdditionalConfigLabel()}
        <Buttons>
          {this.renderCancelButton()}
          {this.renderActionButton()}
        </Buttons>
        <Tooltip />
        {Tooltip.rebuild()}
      </Content>
    )
  }

  // if azure
  renderAdditionalConfigContent() {
    if (!this.state.showAdditionalConfig) {
      return null
    }

    let fieldsContent = null

    if (this.state.additionConfigManualInput) {
      fieldsContent = (
        <Fields>
          {this.renderFields(this.props.providerStore.connectionInfoSchema.find(f => f.name === 'cloud_profile').custom_cloud_fields)}
        </Fields>
      )
    } else {
      fieldsContent = (
        <PasteField>
          <PasteFieldLabel>Azure Stack Profile Configuration</PasteFieldLabel>
          <PasteFieldInput>
            <TextArea
              width="100%"
              height="164px"
              placeholder="Paste JSON output here"
              value={this.state.masJsonConfig}
              onChange={e => { this.handleMasJsonConfigChange(e.target.value) }}
            />
          </PasteFieldInput>
        </PasteField>
      )
    }

    let title = <AdditionalConfigTitle>Azure Stack Additional Configuration</AdditionalConfigTitle>
    if (this.isValidating() || this.props.endpointStore.validation) {
      title = null
    }

    return (
      <Content>
        {title}
        {this.renderEndpointStatus()}
        <AzureConfigInputType>
          <RadioInput
            checked={!this.state.additionConfigManualInput}
            label="Paste Configuration"
            onChange={e => { this.setState({ additionConfigManualInput: !e.target.checked }) }}
          />
          <RadioInput
            checked={this.state.additionConfigManualInput}
            label="Manual Input"
            onChange={e => { this.setState({ additionConfigManualInput: e.target.checked }) }}
          />
        </AzureConfigInputType>
        {fieldsContent}
        <Buttons>
          {this.renderCancelButton()}
          {this.renderActionButton()}
        </Buttons>
        <Tooltip />
        {Tooltip.rebuild()}
      </Content>
    )
  }

  renderLoading() {
    if (!this.props.providerStore.connectionSchemaLoading) {
      return null
    }

    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>Loading connection schema ...</LoadingText>
      </LoadingWrapper>
    )
  }

  render() {
    if (this.props.endpointStore.validation && this.props.endpointStore.validation.valid
      && !this.closeTimeout) {
      this.closeTimeout = setTimeout(() => {
        this.props.onCancelClick({ autoClose: true })
      }, 2000)
    }

    return (
      <Wrapper>
        <EndpointLogos style={{ marginBottom: '16px' }} height={128} endpoint={this.getEndpointType()} />
        {this.renderContent()}
        {this.renderAdditionalConfigContent()}
        {this.renderLoading()}
      </Wrapper>
    )
  }
}

export default connectToStores(Endpoint)
