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
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'

import Button from '../../atoms/Button'
import CopyButton from '../../atoms/CopyButton'
import StatusImage from '../../atoms/StatusImage'

import Palette from '../../styleUtils/Palette'
import type { Validation as ValidationType } from '../../../@types/Endpoint'

import notificationStore from '../../../stores/NotificationStore'
import DomUtils from '../../../utils/DomUtils'

const Wrapper = styled.div<any>`
  padding: 48px 32px 32px 32px;
`
const contentStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Loading = styled.div<any>`
  ${contentStyle}
`
const Validation = styled.div<any>`
  ${contentStyle}
`
const Message = styled.div<any>`
  max-width: 100%;
  overflow: auto;
  margin-top: 48px;
  text-align: center;
`
const Title = styled.div<any>`
  font-size: 18px;
  margin-bottom: 8px;
`
const Subtitle = styled.div<any>`
  color: ${Palette.grayscale[4]};
`
const Buttons = styled.div<any>`
  margin-top: 48px;
  display: flex;
  justify-content: ${props => (props.center ? 'center' : 'space-between')};
`
const Error = styled.div<any>`
  text-align: left;
  cursor: pointer;

  &:hover > span {
    opacity: 1;
  }
  > span {
    background-position-y: 4px;
    margin-left: 4px;
  }
`

type Props = {
  loading: boolean,
  validation?: ValidationType | null,
  onCancelClick: () => void,
  onRetryClick: () => void,
}
@observer
class EndpointValidation extends React.Component<Props> {
  handleCopyClick(message: string) {
    const succesful = DomUtils.copyTextToClipboard(message)

    if (succesful) {
      notificationStore.alert('The value has been copied to clipboard.')
    } else {
      notificationStore.alert('The value couldn\'t be copied', 'error')
    }
  }

  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <Loading>
        <StatusImage loading data-test-id="eValidation-status" />
        <Message>
          <Title data-test-id="eValidation-title">Validating Endpoint</Title>
          <Subtitle>Please wait ...</Subtitle>
        </Message>
      </Loading>
    )
  }

  renderSuccessValidationMessage() {
    if (!this.props.validation || !this.props.validation.valid || this.props.loading) {
      return null
    }

    return (
      <Validation>
        <StatusImage status="COMPLETED" data-test-id="eValidation-status" />
        <Message>
          <Title data-test-id="eValidation-title">Endpoint is Valid</Title>
          <Subtitle>All tests passed succesfully.</Subtitle>
        </Message>
      </Validation>
    )
  }

  renderFailedValidationMessage() {
    if (!this.props.validation || this.props.validation.valid || this.props.loading) {
      return null
    }

    const message = this.props.validation.message || 'An unexpected error occurred.'

    return (
      <Validation>
        <StatusImage status="ERROR" data-test-id="eValidation-status" />
        <Message>
          <Title data-test-id="eValidation-title">Validation Failed</Title>
          <Error onClick={() => { this.handleCopyClick(message) }} data-test-id="eValidation-errorMessage">
            {message}<CopyButton />
          </Error>
        </Message>
      </Validation>
    )
  }

  renderButtons() {
    if (!this.props.loading && this.props.validation && this.props.validation.valid) {
      return (
        <Buttons center>
          <Button secondary onClick={this.props.onCancelClick}>Dismiss</Button>
        </Buttons>
      )
    }

    return (
      <Buttons>
        <Button secondary onClick={this.props.onCancelClick}>Cancel</Button>
        <Button disabled={this.props.loading} onClick={this.props.onRetryClick}>Retry</Button>
      </Buttons>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderLoading()}
        {this.renderFailedValidationMessage()}
        {this.renderSuccessValidationMessage()}
        {this.renderButtons()}
      </Wrapper>
    )
  }
}

export default EndpointValidation
