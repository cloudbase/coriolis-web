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
import { observer } from 'mobx-react'
import { observe } from 'mobx'

import EndpointLogos from '../../atoms/EndpointLogos'
import StatusIcon from '../../atoms/StatusIcon'
import CopyButton from '../../atoms/CopyButton'
import Tooltip from '../../atoms/Tooltip'
import StatusImage from '../../atoms/StatusImage'
import Button from '../../atoms/Button'
import LoadingButton from '../../molecules/LoadingButton'

import type { Endpoint as EndpointType } from '../../../types/Endpoint'
import type { Field } from '../../../types/Field'
import NotificationStore from '../../../stores/NotificationStore'
import EndpointStore from '../../../stores/EndpointStore'
import ProviderStore from '../../../stores/ProviderStore'
import ObjectUtils from '../../../utils/ObjectUtils'
import Palette from '../../styleUtils/Palette'
import DomUtils from '../../../utils/DomUtils'
import { ContentPlugin } from '../../../plugins/endpoint'
import DefaultContentPlugin from '../../../plugins/endpoint/default/ContentPlugin'
import KeyboardManager from '../../../utils/KeyboardManager'

const Wrapper = styled.div`
  padding: 48px 32px 32px 32px;
  display: flex;
  align-items: center;
  flex-direction: column;
  min-height: 0;
`
const Status = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
`
const StatusHeader = styled.div`
  display: flex;
  align-items: center;
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
  margin-top: 16px;
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
const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 32px;
  flex-shrink: 0;
`

type Props = {
  type: ?string,
  cancelButtonText: string,
  deleteOnCancel: boolean,
  endpoint: ?EndpointType,
  onCancelClick: (opts?: { autoClose?: boolean }) => void,
  onResizeUpdate: (scrollableRef: HTMLElement, scrollOffset?: number) => void,
}
type State = {
  invalidFields: any[],
  validating: boolean,
  showErrorMessage: boolean,
  endpoint: ?EndpointType,
  isNew: ?boolean,
}
@observer
class Endpoint extends React.Component<Props, State> {
  static defaultProps: $Shape<Props> = {
    cancelButtonText: 'Cancel',
  }

  scrollableRef: HTMLElement
  closeTimeout: TimeoutID
  contentPluginRef: DefaultContentPlugin
  isValidateButtonEnabled: boolean
  providerStoreObserver: () => void
  endpointValidationObserver: () => void

  constructor() {
    super()

    this.state = {
      invalidFields: [],
      validating: false,
      showErrorMessage: false,
      endpoint: null,
      isNew: null,
    }
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
    this.providerStoreObserver = observe(ProviderStore, 'connectionInfoSchema', () => {
      this.props.onResizeUpdate(this.scrollableRef)
    })
    this.endpointValidationObserver = observe(EndpointStore, 'validation', () => {
      this.componentWillReceiveProps(this.props)
    })
  }

  componentDidMount() {
    ProviderStore.getConnectionInfoSchema(this.getEndpointType())
    KeyboardManager.onEnter('endpoint', () => { if (this.isValidateButtonEnabled) this.handleValidateClick() }, 2)
  }

  componentWillReceiveProps(props: Props) {
    if (this.state.validating) {
      if (EndpointStore.validation && !EndpointStore.validation.valid) {
        this.setState({ validating: false })
      }
    }

    if (props.endpoint && EndpointStore.connectionInfo) {
      this.setState({
        endpoint: {
          ...ObjectUtils.flatten(props.endpoint || {}),
          ...ObjectUtils.flatten(EndpointStore.connectionInfo || {}),
        },
      })
    } else {
      this.setState({
        isNew: this.state.isNew === null || this.state.isNew,
        endpoint: {
          type: props.type,
          ...ObjectUtils.flatten(this.state.endpoint || {}),
        },
      })
    }

    props.onResizeUpdate(this.scrollableRef)
  }

  componentWillUnmount() {
    EndpointStore.clearValidation()
    ProviderStore.clearConnectionInfoSchema()
    clearTimeout(this.closeTimeout)
    KeyboardManager.removeKeyDown('endpoint')
    this.providerStoreObserver()
    this.endpointValidationObserver()
  }

  getEndpointType() {
    if (this.props.endpoint) {
      return this.props.endpoint.type
    }

    return this.props.type || ''
  }

  getFieldValue(field: ?Field) {
    if (!field || !this.state.endpoint) {
      return ''
    }
    if (this.state.endpoint[field.name]) {
      return this.state.endpoint[field.name]
    }

    if (Object.keys(field).find(k => k === 'default')) {
      return field.default
    }

    return ''
  }

  handleFieldsChange(items: { field: Field, value: any }[]) {
    let endpoint: EndpointType = { ...this.state.endpoint }

    items.forEach(item => {
      endpoint[item.field.name] = item.value
    })

    this.setState({ endpoint })
  }

  handleValidateClick() {
    if (!this.highlightRequired()) {
      this.setState({ validating: true })

      NotificationStore.notify('Saving endpoint ...')
      EndpointStore.clearValidation()

      if (this.state.isNew) {
        this.add()
      } else {
        this.update()
      }
    } else {
      NotificationStore.notify('Please fill all the required fields', 'error')
    }
  }

  handleShowErrorMessageClick() {
    this.setState({ showErrorMessage: !this.state.showErrorMessage }, () => {
      this.props.onResizeUpdate(this.scrollableRef)
    })
  }

  handleCopyErrorMessageClick() {
    if (!EndpointStore.validation) {
      return
    }
    // $FlowIssue
    let succesful = DomUtils.copyTextToClipboard(EndpointStore.validation.message)

    if (succesful) {
      NotificationStore.notify('The message has been copied to clipboard.')
    }
  }

  handleCancelClick() {
    if (this.props.deleteOnCancel && this.state.isNew === false) {
      EndpointStore.delete(EndpointStore.endpoints[0])
    }
    this.props.onCancelClick()
  }

  highlightRequired() {
    let invalidFields = this.contentPluginRef.findInvalidFields()
    this.setState({ invalidFields })
    return invalidFields.length > 0
  }

  update() {
    if (!this.state.endpoint) {
      return
    }

    EndpointStore.update(this.state.endpoint).then(() => {
      NotificationStore.notify('Validating endpoint ...')
      // $FlowIssue
      EndpointStore.validate(this.state.endpoint)
    })
  }

  add() {
    if (!this.state.endpoint) {
      return
    }

    EndpointStore.add(this.state.endpoint).then(() => {
      let endpoint = EndpointStore.endpoints[0]
      this.setState({ isNew: false, endpoint: ObjectUtils.flatten(endpoint) })
      NotificationStore.notify('Validating endpoint ...')
      EndpointStore.validate(endpoint)
    })
  }

  renderEndpointStatus() {
    const validation = EndpointStore.validation
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
              {this.state.showErrorMessage ? 'Hide' : 'Show'} Error</ShowErrorButton>
          )
          error = this.state.showErrorMessage ?
            <StatusError onClick={() => { this.handleCopyErrorMessageClick() }}>{validation.message}<CopyButton /></StatusError> : null
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
    let actionButton = <Button large onClick={() => this.handleValidateClick()}>Validate and save</Button>

    let message = 'Validating Endpoint ...'
    if (this.state.validating || (EndpointStore.validation && EndpointStore.validation.valid)) {
      if (EndpointStore.validation && EndpointStore.validation.valid) {
        message = 'Saving ...'
      }

      this.isValidateButtonEnabled = false
      actionButton = <LoadingButton large>{message}</LoadingButton>
    }

    return (
      <Buttons>
        <Button large secondary onClick={() => { this.handleCancelClick() }}>{this.props.cancelButtonText}</Button>
        {actionButton}
      </Buttons>
    )
  }

  renderContent() {
    const endpointType = this.getEndpointType()
    if (ProviderStore.connectionSchemaLoading || !endpointType) {
      return null
    }
    return (
      <Content>
        {this.renderEndpointStatus()}
        {React.createElement(ContentPlugin[endpointType] || ContentPlugin.default, {
          connectionInfoSchema: ProviderStore.connectionInfoSchema,
          // $FlowIgnore
          validation: EndpointStore.validation,
          invalidFields: this.state.invalidFields,
          validating: this.state.validating,
          disabled: this.state.validating,
          cancelButtonText: this.props.cancelButtonText,
          getFieldValue: field => this.getFieldValue(field),
          highlightRequired: () => this.highlightRequired(),
          handleFieldChange: (field, value) => { this.handleFieldsChange([{ field, value }]) },
          handleFieldsChange: fields => { this.handleFieldsChange(fields) },
          handleValidateClick: () => { this.handleValidateClick() },
          handleCancelClick: () => { this.handleCancelClick() },
          scrollableRef: ref => { this.scrollableRef = ref },
          onRef: ref => { this.contentPluginRef = ref },
          onResizeUpdate: (scrollOffset: number) => { this.props.onResizeUpdate(this.scrollableRef, scrollOffset) },
        })}
        {this.renderButtons()}
        <Tooltip />
        {Tooltip.rebuild()}
        {/* Fix browsers autofilling password fields */}
        <div style={{ position: 'absolute', left: '-10000px' }}>
          <input type="text" />
          <input type="password" />
        </div>
      </Content>
    )
  }

  renderLoading() {
    if (!ProviderStore.connectionSchemaLoading) {
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
    if (EndpointStore.validation && EndpointStore.validation.valid
      && !this.closeTimeout) {
      this.closeTimeout = setTimeout(() => {
        this.props.onCancelClick({ autoClose: true })
      }, 2000)
    }

    return (
      <Wrapper>
        <EndpointLogos style={{ marginBottom: '16px' }} height={128} endpoint={this.getEndpointType()} />
        {this.renderContent()}
        {this.renderLoading()}
      </Wrapper>
    )
  }
}

export default Endpoint
