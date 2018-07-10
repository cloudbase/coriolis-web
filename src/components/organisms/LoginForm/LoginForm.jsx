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
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'

import Button from '../../atoms/Button'
import LoginOptions from '../../molecules/LoginOptions'
import LoadingButton from '../../molecules/LoadingButton'
import LoginFormField from '../../molecules/LoginFormField'

import StyleProps from '../../styleUtils/StyleProps'

import errorIcon from './images/error.svg'

import { loginButtons } from '../../../config'
import notificationStore from '../../../stores/NotificationStore'

const Form = styled.form`
  background: rgba(221, 224, 229, 0.5);
  padding: 16px 32px 32px 32px;
  border-radius: 8px;
`

const FormFields = styled.div`
  display: flex;
  margin-left: -16px;
  ${loginButtons.length < 3 ? css`flex-direction: column;` : ''}
`

const LoginSeparator = styled.div`
  margin: 8px 0 24px;
  opacity: 0.5;
  display: flex;
  justify-content: center;
  align-items: center;
`

const SeparatorLine = styled.div`
  width: 19px;
  border-top: 1px solid white;
`

const SeparatorText = styled.div`
  font-size: 12px;
  color: white;
  flex-grow: 1;
  text-align: center;
`
const LoginError = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4px;
  margin-bottom: 16px;
`

const LoginErrorIcon = styled.div`
  width: 26px;
  height: 26px;
  background-image: url('${errorIcon}');
`

const LoginErrorText = styled.div`
  color: white;
  font-size: 12px;
  margin-top: 4px;
  width: ${StyleProps.inputSizes.regular.width}px;
  text-align: center;
`

type Props = {
  className: string,
  loading: boolean,
  loginFailedResponse: { status: string, message?: string },
  onFormSubmit: (credentials: { username: string, password: string }) => void,
}
type State = {
  username: string,
  password: string,
}
@observer
class LoginForm extends React.Component<Props, State> {
  static defaultProps = {
    className: '',
  }

  constructor() {
    super()

    this.state = {
      username: '',
      password: '',
    }
  }

  handleUsernameChange(username: string) {
    this.setState({ username })
  }

  handlePasswordChange(password: string) {
    this.setState({ password })
  }

  handleFormSubmit(e: Event) {
    e.preventDefault()

    if (this.state.username.length === 0 || this.state.password.length === 0) {
      notificationStore.alert('Please fill in all fields')
    } else {
      this.props.onFormSubmit({ username: this.state.username, password: this.state.password })
    }
  }

  renderErrorMessage() {
    if (!this.props.loginFailedResponse) {
      return null
    }

    let errorMessage = 'Request failed, there might be a problem with the connection to the server.'

    if (this.props.loginFailedResponse.status) {
      switch (this.props.loginFailedResponse.status) {
        case 401:
          errorMessage = 'The username or password did not match. Please try again.'
          break
        default:
          errorMessage = this.props.loginFailedResponse.message || errorMessage
      }
    }

    return (
      <LoginError>
        <LoginErrorIcon />
        <LoginErrorText data-test-id="loginForm-errorText">
          {errorMessage}
        </LoginErrorText>
      </LoginError>
    )
  }

  render() {
    let loginSeparator = loginButtons.length ? (
      <LoginSeparator>
        <SeparatorLine />
        <SeparatorText>or sign in with username</SeparatorText>
        <SeparatorLine />
      </LoginSeparator>
    ) : null

    let buttonStyle = { width: '100%', marginTop: '16px' }
    let button = this.props.loading ?
      <LoadingButton style={buttonStyle}>Please wait ... </LoadingButton>
      : <Button style={buttonStyle}>Login</Button>

    return (
      <Form className={this.props.className} onSubmit={(e) => { this.handleFormSubmit(e) }}>
        {this.renderErrorMessage()}
        <LoginOptions />
        {loginSeparator}
        <FormFields>
          <LoginFormField
            label="Username"
            value={this.state.username}
            name="username"
            onChange={e => { this.handleUsernameChange(e.target.value) }}
            data-test-id="loginForm-usernameField"
          />
          <LoginFormField
            label="Password"
            value={this.state.password}
            onChange={e => { this.handlePasswordChange(e.target.value) }}
            name="password"
            type="password"
            data-test-id="loginForm-passwordField"
          />
        </FormFields>
        {button}
      </Form>
    )
  }
}

export default LoginForm
