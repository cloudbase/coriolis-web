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
import connectToStores from 'alt-utils/lib/connectToStores'

import EndpointLogos from '../../atoms/EndpointLogos'
import StatusIcon from '../../atoms/StatusIcon'
import CopyButton from '../../atoms/CopyButton'
import Tooltip from '../../atoms/Tooltip'
import StatusImage from '../../atoms/StatusImage'
import Button from '../../atoms/Button'
import LoadingButton from '../../molecules/LoadingButton'

import type { Endpoint as EndpointType } from '../../../types/Endpoint'
import NotificationActions from '../../../actions/NotificationActions'
import EndpointStore from '../../../stores/EndpointStore'
import EndpointActions from '../../../actions/EndpointActions'
import ProviderStore from '../../../stores/ProviderStore'
import ProviderActions from '../../../actions/ProviderActions'
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
  type: string,
  cancelButtonText: string,
  deleteOnCancel: boolean,
  endpoint: EndpointType,
  connectionInfo: { [string]: mixed },
  onCancelClick: (opts?: { autoClose?: boolean }) => void,
  onResizeUpdate: (scrollableRef: HTMLElement, scrollOffset?: number) => void,
  endpointStore: any,
  providerStore: any,
}
type State = {
  invalidFields: any[],
  validating: boolean,
  showErrorMessage: boolean,
  endpoint: EndpointType | {},
  isNew: ?boolean,
}
class Endpoint extends React.Component<Props, State> {
  static defaultProps: $Shape<Props> = {
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

  scrollableRef: HTMLElement
  closeTimeout: TimeoutID
  contentPluginRef: DefaultContentPlugin
  isValidateButtonEnabled: boolean

  constructor() {
    super()

    this.state = {
      invalidFields: [],
      validating: false,
      showErrorMessage: false,
      endpoint: {},
      isNew: null,
    }
  }

  componentDidMount() {
    ProviderActions.getConnectionInfoSchema(this.getEndpointType())
    KeyboardManager.onEnter('endpoint', () => { if (this.isValidateButtonEnabled) this.handleValidateClick() }, 2)
  }

  componentWillReceiveProps(props) {
    if (this.state.validating) {
      if (props.endpointStore.validation && !props.endpointStore.validation.valid) {
        this.setState({ validating: false })
      }
    }

    if (props.endpoint && props.endpointStore.connectionInfo) {
      this.setState({
        endpoint: {
          ...ObjectUtils.flatten(props.endpoint),
          ...ObjectUtils.flatten(props.endpointStore.connectionInfo),
        },
      })
    } else {
      this.setState({
        isNew: this.state.isNew === null || this.state.isNew,
        endpoint: {
          type: props.type,
          ...ObjectUtils.flatten(this.state.endpoint),
        },
      })
    }

    this.props.onResizeUpdate(this.scrollableRef)
  }

  componentWillUnmount() {
    EndpointActions.clearValidation()
    ProviderActions.clearConnectionInfoSchema()
    clearTimeout(this.closeTimeout)
    KeyboardManager.removeKeyDown('endpoint')
  }

  getEndpointType() {
    if (this.props.endpoint) {
      return this.props.endpoint.type
    }

    return this.props.type
  }

  getFieldValue(field) {
    if (!field) {
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

  isValidating() {
    return this.state.validating
  }

  handleFieldsChange(items) {
    let endpoint: EndpointType = { ...this.state.endpoint }

    items.forEach(item => {
      endpoint[item.field.name] = item.value
    })

    this.setState({ endpoint })
  }

  handleValidateClick() {
    if (!this.highlightRequired()) {
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

  highlightRequired() {
    let invalidFields = this.contentPluginRef.findInvalidFields()
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

  renderButtons() {
    this.isValidateButtonEnabled = true
    let actionButton = <Button large onClick={() => this.handleValidateClick()}>Validate and save</Button>

    let message = 'Validating Endpoint ...'
    if (this.state.validating || (this.props.endpointStore.validation && this.props.endpointStore.validation.valid)) {
      if (this.props.endpointStore.validation && this.props.endpointStore.validation.valid) {
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
    if (this.props.providerStore.connectionSchemaLoading) {
      return null
    }

    return (
      <Content>
        {this.renderEndpointStatus()}
        {React.createElement(ContentPlugin[this.getEndpointType()] || ContentPlugin.default, {
          connectionInfoSchema: this.props.providerStore.connectionInfoSchema,
          validation: this.props.endpointStore.validation,
          invalidFields: this.state.invalidFields,
          validating: this.state.validating,
          disabled: this.isValidating() || (this.props.endpointStore.validation && this.props.endpointStore.validation.valid),
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
        {this.renderLoading()}
      </Wrapper>
    )
  }
}

export default connectToStores(Endpoint)
