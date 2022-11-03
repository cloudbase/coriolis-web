/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import styled, { css } from "styled-components";
import { observer } from "mobx-react";

import backgroundImage from "@src/components/ui/Images/star-bg.jpg";
import configLoader from "@src/utils/Config";
import {
  CustomerInfoBasic,
  CustomerInfoTrial,
  SetupPageLicenceType,
} from "@src/@types/InitialSetup";
import setupStore from "@src/stores/SetupStore";
import notificationStore from "@src/stores/NotificationStore";
import SetupPageModuleWrapper from "@src/components/modules/SetupModule/SetupPageModuleWrapper";
import LoadingButton from "@src/components/ui/LoadingButton";
import Button from "@src/components/ui/Button";
import SetupPageBackButton from "@src/components/modules/SetupModule/ui/SetupPageBackButton";
import SetupPageLicence from "@src/components/modules/SetupModule/SetupPageLicence";
import SetupPageLegal from "@src/components/modules/SetupModule/SetupPageLegal";
import SetupPageHelp from "@src/components/modules/SetupModule/SetupPageHelp";
import Logo from "@src/components/ui/Logo";
import EmptyTemplate from "@src/components/modules/TemplateModule/EmptyTemplate";
import SetupPageEmailBody from "@src/components/modules/SetupModule/SetupPageEmailBody";
import cbsImage from "@src/components/modules/SetupModule/resources/cbsl-logo.svg";
import SetupPageWelcome from "@src/components/modules/SetupModule/SetupPageWelcome";

const Wrapper = styled.div`
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
const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;
const Top = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
  flex-shrink: 0;
`;
const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding: 48px 0;
`;
const FooterText = styled.div`
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
const ActionWrapper = css`
  display: flex;
  width: 100%;
`;
const NextOnlyActionWrapper = styled.div`
  ${ActionWrapper}
  justify-content: flex-end;
`;
const BackNextActionWrapper = styled.div`
  ${ActionWrapper}
  align-items: center;
  justify-content: space-between;
`;
const ModuleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  > div {
    margin-top: 16px;
  }
`;
type PageName = "welcome/password" | "licence" | "legal/help" | "email/error";
// const SETUP_PAGES: PageName[] = ['welcome/password', 'licence', 'legal/help', 'email/error']
const SETUP_PAGES: PageName[] = ["legal/help"];

type Props = {
  history: any;
};

type State = {
  currentPage: number;
  customerInfoBasic: CustomerInfoBasic;
  customerInfoTrial: CustomerInfoTrial;
  highlightEmptyFields: boolean;
  highlightEmail: boolean;
  licenceType: SetupPageLicenceType;
  submitDisabled: boolean;
  submitting: boolean;
};

@observer
class SetupPage extends React.Component<Props, State> {
  state = {
    currentPage: 0,
    customerInfoBasic: {
      fullName: "",
      email: "",
      company: "",
      country: "",
    },
    customerInfoTrial: {
      sourcePlatform: null,
      destinationPlatform: null,
      interestedIn: "migrations",
    },
    highlightEmptyFields: false,
    highlightEmail: false,
    // licenceType: 'trial',
    licenceType: "paid",
    submitDisabled: true,
    submitting: false,
  } as State;

  scrollableElement: HTMLElement | null = null;

  componentDidMount() {
    setupStore.loadApplianceId();
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (prevState.currentPage !== this.state.currentPage) {
      this.scrollableElement?.scrollTo(0, 0);
    }
  }

  handleCustomerInfoBasicChange(field: keyof CustomerInfoBasic, value: any) {
    const newCustomerInfo: any = this.state.customerInfoBasic;
    newCustomerInfo[field] = value;
    this.setState(() => ({ customerInfoBasic: newCustomerInfo }));
  }

  handleCustomerInfoTrialChange(field: keyof CustomerInfoTrial, value: any) {
    const newCustomerInfo: any = this.state.customerInfoTrial;
    newCustomerInfo[field] = value;
    this.setState(() => ({ customerInfoTrial: newCustomerInfo }));
  }

  handleLegalChange(accepted: boolean) {
    this.setState({ submitDisabled: !accepted });
  }

  // async handleUpdatePassword() {
  //   this.setState({ showPasswordLoading: true })
  //   try {
  //     await ObjectUtils.waitFor(() => !setupStore.loadingApplianceId)
  //     await configLoader.setNotFirstLaunch()
  //     this.handleNextPage()
  //   } finally {
  //     this.setState({ showPasswordLoading: false })
  //   }
  // }

  handleNextPage() {
    this.setState(prevState => ({
      currentPage: prevState.currentPage + 1,
      submitDisabled: true,
    }));
  }

  handleBackPage() {
    this.setState(prevState => ({
      currentPage: prevState.currentPage - 1,
      submitDisabled: true,
    }));
  }

  handleValidateLicenceForm() {
    if (!this.validateLicenceInputs()) {
      return;
    }
    this.handleNextPage();
  }

  // async handleSubmit() {
  //   this.setState({ submitting: true })
  //   try {
  //     if (this.state.licenceType === 'trial') {
  //       await setupStore.sendLicenceRequest('trial', { ...this.state.customerInfoBasic, ...this.state.customerInfoTrial })
  //     } else {
  //       await setupStore.sendLicenceRequest('paid', { ...this.state.customerInfoBasic })
  //     }
  //     this.props.history.push('/login')
  //   } catch (err) {
  //     this.setState({ submitting: false })
  //     this.handleNextPage()
  //   }
  // }

  async handleGoToLogin() {
    this.setState({ submitting: true });
    await configLoader.setNotFirstLaunch();
    this.props.history.push("/login");
    this.setState({ submitting: false });
  }

  validateLicenceInputs() {
    const customerInfo = this.state.customerInfoBasic;
    if (
      !customerInfo.fullName ||
      !customerInfo.email ||
      !customerInfo.company ||
      !customerInfo.country
    ) {
      notificationStore.alert("Please fill all the required fields", "error");
      this.setState({ highlightEmptyFields: true, highlightEmail: false });
      return false;
    }
    const emailExp =
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\],;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    if (!emailExp.test(customerInfo.email)) {
      notificationStore.alert("Please fill in a correct email format", "error");
      this.setState({ highlightEmail: true });
      return false;
    }
    this.setState({ highlightEmail: false });
    return true;
  }

  renderCurrentPage() {
    const renderModule = (
      actions: React.ReactNode,
      content: React.ReactNode
    ) => (
      <SetupPageModuleWrapper actions={actions}>
        {content}
      </SetupPageModuleWrapper>
    );
    const currentPageName = SETUP_PAGES[this.state.currentPage];
    const BUTTON_WIDTH = "132px";
    switch (currentPageName) {
      case "licence":
        return renderModule(
          <BackNextActionWrapper>
            <SetupPageBackButton
              onClick={() => {
                this.handleBackPage();
              }}
            />
            <Button
              width={BUTTON_WIDTH}
              onClick={() => {
                this.handleValidateLicenceForm();
              }}
            >
              Next
            </Button>
          </BackNextActionWrapper>,
          <SetupPageLicence
            customerInfo={this.state.customerInfoBasic}
            onUpdateCustomerInfo={(field, value) => {
              this.handleCustomerInfoBasicChange(field, value);
            }}
            highlightEmptyFields={this.state.highlightEmptyFields}
            highlightEmail={this.state.highlightEmail}
            licenceType={this.state.licenceType}
            onLicenceTypeChange={licenceType => {
              this.setState({ licenceType });
            }}
            onSubmit={() => {
              this.handleValidateLicenceForm();
            }}
          />
        );
      case "legal/help":
        return renderModule(
          <NextOnlyActionWrapper>
            {setupStore.sendingLicenceRequest || this.state.submitting ? (
              <LoadingButton width={BUTTON_WIDTH}>Redirecting...</LoadingButton>
            ) : (
              <Button
                width={BUTTON_WIDTH}
                onClick={() => {
                  this.handleGoToLogin();
                }}
                disabled={this.state.submitDisabled}
              >
                Submit
              </Button>
            )}
          </NextOnlyActionWrapper>,
          // <BackNextActionWrapper>
          //   <SetupPageBackButton onClick={() => { this.handleBackPage() }} />
          //   {setupStore.sendingLicenceRequest || this.state.submitting ? (
          //     <LoadingButton width={BUTTON_WIDTH}>Sending...</LoadingButton>
          //   ) : (
          //     <Button
          //       width={BUTTON_WIDTH}
          //       onClick={() => { this.handleSubmit() }}
          //       disabled={this.state.submitDisabled}
          //     >
          //       Submit
          //     </Button>
          //   )}
          // </BackNextActionWrapper>
          <ModuleWrapper>
            <SetupPageWelcome />
            <SetupPageLegal
              licenceType={this.state.licenceType}
              customerInfoTrial={this.state.customerInfoTrial}
              onCustomerInfoChange={(f, v) => {
                this.handleCustomerInfoTrialChange(f, v);
              }}
              onLegalChange={a => {
                this.handleLegalChange(a);
              }}
            />
            <SetupPageHelp style={{ marginTop: "32px" }} />
          </ModuleWrapper>
        );
      case "email/error":
        return renderModule(
          <BackNextActionWrapper>
            <SetupPageBackButton
              onClick={() => {
                this.handleBackPage();
              }}
            />
            {this.state.submitting ? (
              <LoadingButton width={BUTTON_WIDTH}>Redirecting...</LoadingButton>
            ) : (
              <Button
                width={BUTTON_WIDTH}
                onClick={() => {
                  this.handleGoToLogin();
                }}
              >
                Go to Login
              </Button>
            )}
          </BackNextActionWrapper>,
          <ModuleWrapper>
            <SetupPageEmailBody
              customerInfoBasic={this.state.customerInfoBasic}
              customerInfoTrial={this.state.customerInfoTrial}
              licenceType={this.state.licenceType}
              applianceId={setupStore.applianceId}
            />
          </ModuleWrapper>
        );
      default:
        return null;
    }
  }

  render() {
    return (
      <EmptyTemplate>
        <Wrapper
          ref={ref => {
            this.scrollableElement = ref;
          }}
        >
          <Content>
            <Top>
              <Logo />
              {this.renderCurrentPage()}
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

export default SetupPage;
