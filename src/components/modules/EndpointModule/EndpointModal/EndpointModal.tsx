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
import { observer } from 'mobx-react'
import { observe } from 'mobx'

import EndpointLogos from '../EndpointLogos/EndpointLogos'
import StatusIcon from '../../../ui/StatusComponents/StatusIcon/StatusIcon'
import CopyButton from '../../../ui/CopyButton/CopyButton'
import StatusImage from '../../../ui/StatusComponents/StatusImage/StatusImage'
import Button from '../../../ui/Button/Button'
import LoadingButton from '../../../ui/LoadingButton/LoadingButton'

import type { Endpoint as EndpointType } from '../../../../@types/Endpoint'
import type { Field } from '../../../../@types/Field'
import notificationStore from '../../../../stores/NotificationStore'
import endpointStore from '../../../../stores/EndpointStore'
import providerStore from '../../../../stores/ProviderStore'
import ObjectUtils from '../../../../utils/ObjectUtils'
import { ThemePalette } from '../../../Theme'
import DomUtils from '../../../../utils/DomUtils'
import { ContentPlugin } from '../../../../plugins'
import DefaultContentPlugin from '../../../../plugins/default/ContentPlugin'
import KeyboardManager from '../../../../utils/KeyboardManager'
import { ProviderTypes } from '../../../../@types/Providers'

const Wrapper = styled.div<any>`
  padding: 48px 0 32px 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  min-height: 0;
`
const Status = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
`
const StatusHeader = styled.div<any>`
  display: flex;
  align-items: center;
`
const StatusMessage = styled.div<any>`
  margin-left: 8px;
  display: flex;
  align-items: center;
  line-height: 12px;
`
const ShowErrorButton = styled.span`
  font-size: 10px;
  color: ${ThemePalette.primary};
  margin-left: 8px;
  cursor: pointer;
`
const StatusError = styled.div<any>`
  max-width: 100%;
  margin: 16px 16px 0 16px;
  max-height: 140px;
  overflow: auto;
  cursor: pointer;

  &:hover > span {
    opacity: 1;
  }
  > span {
    background-position-y: 4px;
    margin-left: 4px;
  }
`
const Content = styled.div<any>`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
`
const LoadingWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;
`
const LoadingText = styled.div<any>`
  font-size: 18px;
  margin-top: 32px;
`
const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  flex-shrink: 0;
  padding: 0 32px;
`

type Props = {
  type?: ProviderTypes | null,
  cancelButtonText: string,
  deleteOnCancel?: boolean,
  endpoint?: EndpointType | null,
  isNewEndpoint?: boolean,
  onCancelClick: (opts?: { autoClose?: boolean }) => void,
  onResizeUpdate?: (scrollableRef: HTMLElement, scrollOffset?: number) => void,
}
type State = {
  invalidFields: any[],
  validating: boolean,
  showErrorMessage: boolean,
  endpoint: EndpointType | null,
  isNew: boolean | null,
}
@observer
class EndpointModal extends React.Component<Props, State> {
  static defaultProps = {
    cancelButtonText: 'Cancel',
  }

  state: State = {
    invalidFields: [],
    validating: false,
    showErrorMessage: false,
    endpoint: null,
    isNew: null,
  }

  scrollableRef!: HTMLElement

  closeTimeout: number | undefined

  contentPluginRef!: DefaultContentPlugin

  isValidateButtonEnabled: boolean = false

  providerStoreObserver!: () => void

  endpointValidationObserver!: () => void

  UNSAFE_componentWillMount() {
    this.UNSAFE_componentWillReceiveProps(this.props)
    this.providerStoreObserver = observe(providerStore, 'connectionInfoSchema', () => {
      if (this.props.onResizeUpdate) this.props.onResizeUpdate(this.scrollableRef)
    })
    this.endpointValidationObserver = observe(endpointStore, 'validation', () => {
      this.UNSAFE_componentWillReceiveProps(this.props)
    })
  }

  componentDidMount() {
    const loadSchema = async () => {
      if (!this.endpointType) {
        return
      }
      await providerStore.getConnectionInfoSchema(this.endpointType)
      this.fillRequiredDefaults()
    }
    loadSchema()
    KeyboardManager.onEnter('endpoint', () => {
      if (this.isValidateButtonEnabled) this.handleValidateClick()
    }, 2)
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    if (this.state.validating) {
      if (endpointStore.validation && !endpointStore.validation.valid) {
        this.setState({ validating: false })
      }
    }

    if (props.endpoint && endpointStore.connectionInfo) {
      const plugin: any = ContentPlugin.for(props.endpoint.type)
      this.setState(prevState => ({
        isNew: this.props.isNewEndpoint
          ? (prevState.isNew === null || prevState.isNew) : prevState.isNew,
        endpoint: {
          ...prevState.endpoint,
          ...ObjectUtils.flatten(props.endpoint || {},
            plugin.REQUIRES_PARENT_OBJECT_PATH),
          ...ObjectUtils.flatten(endpointStore.connectionInfo || {},
            plugin.REQUIRES_PARENT_OBJECT_PATH),
        },
      }))
    } else {
      this.setState(prevState => ({
        isNew: prevState.isNew === null || prevState.isNew,
        endpoint: {
          type: props.type,
          ...ObjectUtils.flatten(prevState.endpoint || {}),
        },
      }))
    }

    if (props.onResizeUpdate) props.onResizeUpdate(this.scrollableRef)
  }

  componentWillUnmount() {
    endpointStore.clearValidation()
    providerStore.clearConnectionInfoSchema()
    clearTimeout(this.closeTimeout)
    KeyboardManager.removeKeyDown('endpoint')
    this.providerStoreObserver()
    this.endpointValidationObserver()
  }

  get endpointType() {
    if (this.props.endpoint) {
      return this.props.endpoint.type
    }

    return this.props.type
  }

  getFieldValue(field: Field | null) {
    if (!field || !this.state.endpoint) {
      return ''
    }
    if (this.state.endpoint[field.name] != null) {
      return this.state.endpoint[field.name]
    }

    if (Object.keys(field).find(k => k === 'default')) {
      return field.default
    }

    if (field.type === 'integer') {
      return null
    }
    return ''
  }

  fillRequiredDefaults() {
    this.setState(prevState => {
      const endpoint: any = { ...prevState.endpoint }
      const requiredFieldsDefaults = providerStore.connectionInfoSchema
        .filter(f => f.required && f.default != null)
      requiredFieldsDefaults.forEach(f => {
        if (endpoint[f.name] == null) {
          endpoint[f.name] = f.default
        }
      })
      return { endpoint }
    })
  }

  handleFieldsChange(items: { field: Field, value: any }[]) {
    this.setState(prevState => {
      const endpoint: any = { ...prevState.endpoint }

      items.forEach(item => {
        let value = item.value
        if (item.field.type === 'array') {
          const arrayItems = endpoint[item.field.name] || []
          value = arrayItems.find((v: any) => v === item.value)
            ? arrayItems.filter((v: any) => v !== item.value) : [...arrayItems, item.value]
        }

        endpoint[item.field.name] = value
      })

      return { endpoint }
    })
  }

  handleValidateClick() {
    if (!this.highlightRequired()) {
      this.setState({ validating: true })

      notificationStore.alert('Saving endpoint ...')
      endpointStore.clearValidation()

      if (this.state.isNew) {
        this.add()
      } else {
        this.update()
      }
    } else {
      notificationStore.alert('Please fill all the required fields', 'error')
    }
  }

  handleShowErrorMessageClick() {
    this.setState(prevState => ({ showErrorMessage: !prevState.showErrorMessage }), () => {
      if (this.props.onResizeUpdate) this.props.onResizeUpdate(this.scrollableRef)
    })
  }

  handleCopyErrorMessageClick() {
    if (!endpointStore.validation) {
      return
    }

    const succesful = DomUtils.copyTextToClipboard(endpointStore.validation.message)

    if (succesful) {
      notificationStore.alert('The message has been copied to clipboard.')
    }
  }

  handleCancelClick() {
    if (this.props.deleteOnCancel && this.state.isNew === false) {
      endpointStore.delete(endpointStore.endpoints[0])
    }
    this.props.onCancelClick()
  }

  highlightRequired() {
    const invalidFields = this.contentPluginRef.findInvalidFields()
    this.setState({ invalidFields })
    return invalidFields.length > 0
  }

  async update() {
    const stateEndpoint = this.state.endpoint
    if (!stateEndpoint) {
      return
    }
    const endpoint = endpointStore.endpoints.find(e => e.id === stateEndpoint.id)
    if (!endpoint) {
      throw new Error('Endpoint not found in store')
    }
    await endpointStore.update(stateEndpoint)

    this.setState({ endpoint: ObjectUtils.flatten(endpoint) })
    notificationStore.alert('Validating endpoint ...')
    endpointStore.validate(endpoint)
  }

  async add() {
    if (!this.state.endpoint) {
      return
    }

    await endpointStore.add(this.state.endpoint)
    const endpoint = endpointStore.endpoints[0]
    this.setState({ isNew: false, endpoint: ObjectUtils.flatten(endpoint) })
    notificationStore.alert('Validating endpoint ...')
    endpointStore.validate(endpoint)
  }

  renderEndpointStatus() {
    const validation = endpointStore.validation
    if (!this.state.validating && !validation) {
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
              {this.state.showErrorMessage ? 'Hide' : 'Show'} Error
            </ShowErrorButton>
          )
          error = this.state.showErrorMessage
            ? (
              <StatusError
                onClick={() => { this.handleCopyErrorMessageClick() }}
              >{validation.message}<CopyButton />
              </StatusError>
            ) : null
        }
      }
    }

    return (
      <Status data-test-id="endpointStatus">
        <StatusHeader>
          <StatusIcon status={status} />
          <StatusMessage>{message}{showErrorButton}</StatusMessage>
        </StatusHeader>
        {error}
      </Status>
    )
  }

  renderButtons() {
    this.isValidateButtonEnabled = true
    let actionButton = (
      <Button
        large
        onClick={() => this.handleValidateClick()}
      >Validate and save
      </Button>
    )

    let message = 'Validating Endpoint ...'
    if (this.state.validating || (endpointStore.validation && endpointStore.validation.valid)) {
      if (endpointStore.validation && endpointStore.validation.valid) {
        message = 'Saving ...'
      }

      this.isValidateButtonEnabled = false
      actionButton = <LoadingButton large>{message}</LoadingButton>
    }

    return (
      <Buttons>
        <Button
          large
          secondary
          onClick={() => {
            this.handleCancelClick()
          }}
        >{this.props.cancelButtonText}
        </Button>
        {actionButton}
      </Buttons>
    )
  }

  renderContent() {
    if (providerStore.connectionSchemaLoading || !this.endpointType) {
      return null
    }
    const contentElement: any = ContentPlugin.for(this.endpointType)
    return (
      <Content>
        {/* Fix browsers autofilling password fields */}
        <div style={{ position: 'absolute', left: '-10000px' }}>
          <input name="username" type="text" />
          <input name="password" type="password" />
        </div>
        {this.renderEndpointStatus()}
        {React.createElement(contentElement, {
          connectionInfoSchema: providerStore.connectionInfoSchema,
          validation: endpointStore.validation,
          invalidFields: this.state.invalidFields,
          validating: this.state.validating,
          disabled: this.state.validating,
          cancelButtonText: this.props.cancelButtonText,
          originalConnectionInfo: endpointStore.connectionInfo,
          getFieldValue: (field: Field | null) => this.getFieldValue(field),
          highlightRequired: () => { this.highlightRequired() },
          handleFieldChange: (field: Field | null, value: any) => {
            if (field) this.handleFieldsChange([{ field, value }])
          },
          handleFieldsChange: (fields: { field: Field; value: any }[]) => {
            this.handleFieldsChange(fields)
          },
          handleValidateClick: () => { this.handleValidateClick() },
          handleCancelClick: () => { this.handleCancelClick() },
          scrollableRef: (ref: HTMLElement) => { this.scrollableRef = ref },
          onRef: (ref: DefaultContentPlugin) => { this.contentPluginRef = ref },
          onResizeUpdate: (scrollOffset: number) => {
            if (this.props.onResizeUpdate) {
              this.props.onResizeUpdate(this.scrollableRef, scrollOffset)
            }
          },
        })}
        {this.renderButtons()}
      </Content>
    )
  }

  renderLoading() {
    if (!providerStore.connectionSchemaLoading) {
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
    if (endpointStore.validation && endpointStore.validation.valid
      && !this.closeTimeout) {
      this.closeTimeout = window.setTimeout(() => {
        this.props.onCancelClick({ autoClose: true })
      }, 2000)
    }

    return (
      <Wrapper>
        <EndpointLogos style={{ marginBottom: '16px' }} height={128} endpoint={this.endpointType} />
        {this.renderContent()}
        {this.renderLoading()}
      </Wrapper>
    )
  }
}

export default EndpointModal
