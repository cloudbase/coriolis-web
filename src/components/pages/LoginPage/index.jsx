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

import EmptyTemplate from '../../templates/EmptyTemplate'
import Logo from '../../atoms/Logo'
import LoginForm from '../../organisms/LoginForm'

import StyleProps from '../../styleUtils/StyleProps'
import UserStore from '../../../stores/UserStore'

import backgroundImage from './images/star-bg.jpg'
import cbsImage from './images/cbs-logo.svg'

const Wrapper = styled.div`
  background-image: url('${backgroundImage}');
  background-color: transparent;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  position: absolute;
  overflow: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`
const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 77px;
  ${StyleProps.media.handheld`
    margin-top: 96px;
  `}
`
const StyledLoginForm = styled(LoginForm)`
  margin-top: 32px;
  ${StyleProps.media.handheld`
    margin-top: 32px;
  `}
`
const Footer = styled.div`
  position: absolute;
  bottom: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const FooterText = styled.div`
  font-size: 12px;
  color: white;
  margin-bottom: 16px;
`
const CbsLogo = styled.a`
  width: 128px;
  height: 32px;
  background: url('${cbsImage}') center no-repeat;
  cursor: pointer;
`

@observer
class LoginPage extends React.Component<{}> {
  componentDidMount() {
    document.title = 'Log In'
  }

  handleFormSubmit(data: { username: string, password: string }) {
    UserStore.login({
      name: data.username,
      password: data.password,
    })
  }

  render() {
    if (UserStore.user) {
      window.location.href = '/#/replicas'
    }

    return (
      <EmptyTemplate>
        <Wrapper>
          <Content>
            <Logo />
            <StyledLoginForm
              onFormSubmit={data => this.handleFormSubmit(data)}
              loading={UserStore.loading}
              loginFailedResponse={UserStore.loginFailedResponse}
            />
            <Footer>
              <FooterText>Coriolis® is a service offered by</FooterText>
              <CbsLogo href="https://cloudbase.it" target="_blank" />
            </Footer>
          </Content>
        </Wrapper>
      </EmptyTemplate>
    )
  }
}

export default LoginPage
