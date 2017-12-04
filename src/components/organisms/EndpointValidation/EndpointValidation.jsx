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
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'

import { Button, CopyButton, StatusImage } from 'components'

import Palette from '../../styleUtils/Palette'

import NotificationActions from '../../../actions/NotificationActions'
import DomUtils from '../../../utils/DomUtils'

const Wrapper = styled.div`
  padding: 48px 32px 32px 32px;
`
const contentStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Loading = styled.div`
  ${contentStyle}
`
const Validation = styled.div`
  ${contentStyle}
`
const Message = styled.div`
  margin-top: 48px;
  text-align: center;
`
const Title = styled.div`
  font-size: 18px;
  margin-bottom: 8px;
`
const Subtitle = styled.div`
  color: ${Palette.grayscale[4]};
`
const Buttons = styled.div`
  margin-top: 48px;
  display: flex;
  justify-content: ${props => props.center ? 'center' : 'space-between'};
`
const Error = styled.div`
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

class EndpointValidation extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    validation: PropTypes.object,
    onCancelClick: PropTypes.func,
    onRetryClick: PropTypes.func,
  }

  handleCopyClick(message) {
    let succesful = DomUtils.copyTextToClipboard(message)

    if (succesful) {
      NotificationActions.notify('The value has been copied to clipboard.')
    } else {
      NotificationActions.notify('The value couldn\'t be copied', 'error')
    }
  }

  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <Loading>
        <StatusImage loading />
        <Message>
          <Title>Validating Endpoint</Title>
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
        <StatusImage status="COMPLETED" />
        <Message>
          <Title>Endpoint is Valid</Title>
          <Subtitle>All tests passed succesfully.</Subtitle>
        </Message>
      </Validation>
    )
  }

  renderFailedValidationMessage() {
    if (!this.props.validation || this.props.validation.valid || this.props.loading) {
      return null
    }

    let message = this.props.validation.message || 'An unexpected error occurred.'

    return (
      <Validation>
        <StatusImage status="ERROR" />
        <Message>
          <Title>Validation Failed</Title>
          <Error onClick={() => { this.handleCopyClick(message) }}>
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
