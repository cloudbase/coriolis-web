/*
Copyright (C) 2020  Cloudbase Solutions SRL
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
import { observer } from "mobx-react";
import styled from "styled-components";
import { CSSTransition } from "react-transition-group";

import Modal from "@src/components/ui/Modal";
import { Providers, ProviderTypes } from "@src/@types/Providers";
import { Endpoint } from "@src/@types/Endpoint";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import Switch from "@src/components/ui/Switch";
import { providerTypes } from "@src/constants";
import EndpointLogos from "@src/components/modules/EndpointModule/EndpointLogos";
import Dropdown from "@src/components/ui/Dropdowns/Dropdown";
import Button from "@src/components/ui/Button";
import { ThemePalette } from "@src/components/Theme";

const Wrapper = styled.div``;
const LoadingWrapper = styled.div`
  margin: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
const ContentWrapper = styled.div`
  padding: 48px;
  > span {
    display: flex;
    justify-content: center;
    margin-left: -24px;
    margin-top: -24px;
    transition: all 250ms ease-out;
    flex-wrap: wrap;
    > div {
      margin-left: 24px;
      margin-top: 24px;
    }
  }
`;
const NoEndpoints = styled.div`
  padding: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
const NoEndpointsMessage = styled.div`
  text-align: center;
  margin-top: 48px;
`;
const ProviderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  &.providers-group-transition-exit {
    opacity: 1;
  }
  &.providers-group-transition-exit-active {
    opacity: 0.01;
    transition: opacity 250ms ease-out;
  }
  &.providers-group-transition-enter {
    opacity: 0.01;
  }
  &.providers-group-transition-enter-active {
    opacity: 1;
    transition: opacity 250ms ease-out;
  }
`;
const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 32px 32px 32px;
`;
const PoolPlatformWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0 64px 0;
`;
const PoolPlatformOptions = styled.div`
  display: flex;
  align-items: center;
`;
const PoolPlatformOption = styled.div``;
const SwitchWrapper = styled.div`
  margin: 0 16px;
`;

type Props = {
  providers: Providers | null;
  endpoints: Endpoint[];
  loading: boolean;
  onRequestClose: () => void;
  onSelectEndpoint: (
    endpoint: Endpoint,
    platform: "source" | "destination",
  ) => void;
};

type State = {
  selectedEndpoint: Endpoint | null;
  platform: "source" | "destination";
};

@observer
class MinionEndpointModal extends React.Component<Props, State> {
  state: State = {
    selectedEndpoint: null,
    platform: "source",
  };

  handleNextClick() {
    this.props.onSelectEndpoint(
      this.state.selectedEndpoint!,
      this.state.platform,
    );
  }

  renderNoEndpoints() {
    return (
      <NoEndpoints>
        <StatusImage status="ERROR" />
        <NoEndpointsMessage>
          Please create a Coriolis Endpoint with Minion Pool support before
          creating a Coriolis Minion Pool.
        </NoEndpointsMessage>
      </NoEndpoints>
    );
  }

  renderPoolPlatform() {
    return (
      <PoolPlatformWrapper>
        <PoolPlatformOptions>
          <PoolPlatformOption>Source Minion Pool</PoolPlatformOption>
          <SwitchWrapper>
            <Switch
              big
              checked={this.state.platform === "destination"}
              checkedColor={ThemePalette.primary}
              uncheckedColor={ThemePalette.primary}
              onChange={value => {
                this.setState({
                  platform: value ? "destination" : "source",
                });
              }}
            />
          </SwitchWrapper>
          <PoolPlatformOption>Destination Minion Pool</PoolPlatformOption>
        </PoolPlatformOptions>
      </PoolPlatformWrapper>
    );
  }

  renderContent() {
    if (!this.props.providers) {
      return this.renderNoEndpoints();
    }

    const availableProviders = Object.keys(this.props.providers).filter(
      (name: any) => {
        const providerName = name as ProviderTypes;
        const providerType =
          this.state.platform === "source"
            ? providerTypes.SOURCE_MINION_POOL
            : providerTypes.DESTINATION_MINION_POOL;
        const types =
          this.props.providers?.[providerName].types.indexOf(providerType);
        return types != null && types > -1;
      },
    );

    const availableEndpoints = this.props.endpoints.filter(
      e => availableProviders.indexOf(e.type) > -1,
    );

    if (availableProviders.length === 0 || availableEndpoints.length === 0) {
      return this.renderNoEndpoints();
    }

    return (
      <ContentWrapper>
        <CSSTransition
          classNames="providers-group-transition"
          exit
          enter
          timeout={{ exit: 250, enter: 250 }}
        >
          <div>
            {availableProviders.map(providerName => (
              <ProviderWrapper key={providerName}>
                <EndpointLogos
                  height={128}
                  endpoint={providerName}
                  style={{ marginBottom: "16px" }}
                />
                <Dropdown
                  items={this.props.endpoints.filter(
                    e => e.type === providerName,
                  )}
                  valueField="id"
                  labelField="name"
                  noSelectionMessage="Choose an endpoint"
                  centered
                  selectedItem={
                    this.state.selectedEndpoint?.type === providerName
                      ? this.state.selectedEndpoint
                      : null
                  }
                  onChange={endpoint => {
                    this.setState({ selectedEndpoint: endpoint });
                  }}
                />
              </ProviderWrapper>
            ))}
          </div>
        </CSSTransition>
      </ContentWrapper>
    );
  }

  renderLoading() {
    return (
      <LoadingWrapper>
        <StatusImage loading />
      </LoadingWrapper>
    );
  }

  render() {
    return (
      <Modal
        isOpen
        title="Choose Minion Pool Endpoint"
        onRequestClose={this.props.onRequestClose}
      >
        <Wrapper>
          {!this.props.loading ? this.renderContent() : null}
          {this.props.loading ? this.renderLoading() : null}
          {!this.props.loading ? this.renderPoolPlatform() : null}
          <ButtonWrapper>
            <Button secondary onClick={this.props.onRequestClose}>
              Cancel
            </Button>
            <Button
              primary
              disabled={!this.state.selectedEndpoint}
              onClick={() => {
                this.handleNextClick();
              }}
            >
              Next
            </Button>
          </ButtonWrapper>
        </Wrapper>
      </Modal>
    );
  }
}

export default MinionEndpointModal;
