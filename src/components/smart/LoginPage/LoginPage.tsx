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

import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import { useNavigate } from "react-router";

import EmptyTemplate from "@src/components/modules/TemplateModule/EmptyTemplate";
import Logo from "@src/components/ui/Logo";
import LoginForm from "@src/components/modules/LoginModule/LoginForm";

import userStore from "@src/stores/UserStore";
import configStore from "@src/utils/Config";
import disclaimerStore from "@src/stores/DisclaimerStore";

import backgroundImage from "@src/components/ui/Images/star-bg.jpg";
import cbsImage from "./images/cbsl-logo.svg";
import { ThemeProps } from "@src/components/Theme";

const Wrapper = styled.div<any>`
  background-image: url("${backgroundImage}");
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
`;
const Content = styled.div<any>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;
const Top = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 77px;
  flex-shrink: 0;
  @media (max-height: 760px) {
    margin-top: 96px;
  }
`;
const StyledLoginForm = styled(LoginForm)`
  margin-top: 32px;
  @media (max-height: 760px) {
    margin-top: 32px;
  }
`;
const Footer = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  margin: 48px 0;
`;
const FooterText = styled.div<any>`
  font-size: 12px;
  color: white;
  margin-bottom: 16px;
`;
const CbsLogo = styled.a`
  width: 128px;
  height: 32px;
  background: url("${cbsImage}") center no-repeat;
  cursor: pointer;
`;

const Disclaimer = styled.div<any>`
  background: rgba(27, 39, 51, 0.7);
  border-radius: ${ThemeProps.borderRadius};
  position: relative;
  padding: 8px;
  margin-top: 16px;
  overflow-wrap: break-word;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: pre-wrap;
  color: white;
  width: fit-content;
  height: fit-content;
  max-width: 50%;
  max-height: 25%;
`;

type Props = {
  onNavigate: (path: string) => void;
};

type State = {
  domain: string;
};

@observer
class LoginPage extends React.Component<Props, State> {
  state = {
    domain: "",
  };

  UNSAFE_componentWillMount() {
    this.setState({
      domain: userStore.domainName,
    });
  }

  componentDidMount() {
    document.title = "Log In";

    disclaimerStore.loadDisclaimer();
  }

  renderDisclaimer() {
    if (!disclaimerStore.disclaimer) {
      return null;
    }
    return <Disclaimer>{disclaimerStore.disclaimer}</Disclaimer>;
  }

  async handleFormSubmit(data: { username: string; password: string }) {
    await userStore.login({
      name: data.username,
      password: data.password,
      domain: this.state.domain,
    });
    if (!userStore.loggedIn) {
      return;
    }
    const prevExp = /\?prev=(.*)/;
    const prevMatch = prevExp.exec(window.location.search);
    if (prevMatch) {
      this.props.onNavigate(prevMatch[1]);
    } else {
      this.props.onNavigate("/");
    }
  }

  render() {
    return (
      <EmptyTemplate>
        <Wrapper>
          <Content>
            <Top>
              <Logo />
              <StyledLoginForm
                domain={this.state.domain}
                onDomainChange={domain => {
                  this.setState({ domain });
                }}
                onFormSubmit={data => this.handleFormSubmit(data)}
                loading={userStore.loading}
                loginFailedResponse={userStore.loginFailedResponse}
                showUserDomainInput={configStore.config.showUserDomainInput}
              />
              {this.renderDisclaimer()}
            </Top>
            <Footer>
              <FooterText>Coriolis® is a service created by</FooterText>
              <CbsLogo href="https://cloudbase.it" target="_blank" />
            </Footer>
          </Content>
        </Wrapper>
      </EmptyTemplate>
    );
  }
}

function LoginPageWithNavigate() {
  const navigate = useNavigate();

  return <LoginPage onNavigate={navigate} />;
}

export default LoginPageWithNavigate;
