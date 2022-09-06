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

import * as React from "react";
import { observer } from "mobx-react";
import styled, { css } from "styled-components";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import { ProviderTypes } from "@src/@types/Providers";
import configLoader from "@src/utils/Config";
import {
  CustomerInfoTrial,
  SetupPageLicenceType,
} from "@src/@types/InitialSetup";
import SetupPageInputWrapper from "@src/components/modules/SetupModule/ui/SetupPageInputWrapper";
import RadioInput from "@src/components/ui/RadioInput";
import Dropdown from "@src/components/ui/Dropdowns/Dropdown";
import EndpointLogos from "@src/components/modules/EndpointModule/EndpointLogos";
import SetupPageTitle from "@src/components/modules/SetupModule/ui/SetupPageTitle";
import Checkbox from "@src/components/ui/Checkbox";
import { LEGAL_URLS } from "@src/constants";
import OpenInNewIcon from "@src/components/ui/OpenInNewIcon";
import transferItemIcon from "./resources/transferItemIcon";

const Wrapper = styled.div``;
const TrialForm = styled.div``;
const AgreementForm = styled.div`
  margin-top: 24px;
  > div {
    margin-top: 8px;
  }
`;
const RadioGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
`;
const RadioInputLabel = styled.div`
  display: flex;
`;
const TransferItemIcon = styled.div`
  ${ThemeProps.exactSize("16px")}
  display: flex;
  align-items: center;
  margin-right: 4px;
`;
const PlatformItemRenderer = styled.div`
  display: flex;
  align-items: center;
`;
const PlatformLogoBackground = styled.div<{ whiteBackground: boolean }>`
  ${props =>
    props.whiteBackground
      ? css`
          background: white;
        `
      : ""}
  margin-left: -15px;
  margin-top: -7px;
  padding-top: 7px;
  margin-bottom: -7px;
  padding-bottom: 7px;
  padding-left: 4px;
  margin-right: 8px;
  > div:first-child {
    transform: scale(0.6);
  }
`;
const CheckboxWrapper = styled.div`
  display: flex;
`;
const CheckboxLabel = styled.div`
  margin-left: 8px;
  cursor: pointer;
  display: inline-block;
`;
const CheckboxLink = styled.a`
  display: inline-block;
  color: ${ThemePalette.primary};
  cursor: pointer;
  text-decoration: none;
`;
const OpenInNewIconWrapper = styled.div`
  ${ThemeProps.exactSize("16px")}
  display: inline-block;
  position: relative;
  top: 9px;
  margin-top: -12px;
  transform: scale(0.6);
`;

const SOURCE_PLATFORMS: ProviderTypes[] = [
  "aws",
  "openstack",
  "vmware_vsphere",
  "azure",
  "hyper-v",
  "oci",
  "oracle_vm",
];
const DESTINATION_PLATFORMS: ProviderTypes[] = [
  "aws",
  "openstack",
  "vmware_vsphere",
  "azure",
  "scvmm",
  "oci",
  "opc",
  "oracle_vm",
];

type PlatformDropdownItemType = { value: ProviderTypes | null; label: string };

const preparePlatformItems = (providers: ProviderTypes[]) => {
  const mappedItems = providers.map(provider => ({
    value: provider,
    label: configLoader.config.providerNames[provider],
  }));
  const sortPriority = configLoader.config.providerSortPriority;
  mappedItems.sort((a, b) => {
    if (sortPriority[a.value] && sortPriority[b.value]) {
      return (
        sortPriority[a.value] - sortPriority[b.value] ||
        a.value.localeCompare(b.value)
      );
    }
    if (sortPriority[a.value]) {
      return -1;
    }
    if (sortPriority[b.value]) {
      return 1;
    }
    return a.value.localeCompare(b.value);
  });
  const mappedItemsNullabled = mappedItems as PlatformDropdownItemType[];
  mappedItemsNullabled.unshift({ value: null, label: "Choose Platform" });
  return mappedItemsNullabled;
};
const getPlatformLabelForValue = (value: ProviderTypes | null) =>
  value ? configLoader.config.providerNames[value] : "Choose Platform";

type State = {
  privacyAgreement: boolean;
  eulaAgreement: boolean;
};

type Props = {
  licenceType: SetupPageLicenceType;
  customerInfoTrial: CustomerInfoTrial;
  onCustomerInfoChange: (field: keyof CustomerInfoTrial, value: any) => void;
  onLegalChange: (accepted: boolean) => void;
};

@observer
class SetupPageLegal extends React.Component<Props, State> {
  state = {
    privacyAgreement: false,
    eulaAgreement: false,
  } as State;

  _sourcePlatformItems: PlatformDropdownItemType[] = [];

  _destinationPlatformItems: PlatformDropdownItemType[] = [];

  get sourcePlatformItems() {
    if (this._sourcePlatformItems.length) {
      return this._sourcePlatformItems;
    }
    this._sourcePlatformItems = preparePlatformItems(SOURCE_PLATFORMS);
    return this._sourcePlatformItems;
  }

  get destinationPlatformItems() {
    if (this._destinationPlatformItems.length) {
      return this._destinationPlatformItems;
    }
    this._destinationPlatformItems = preparePlatformItems(
      DESTINATION_PLATFORMS
    );
    return this._destinationPlatformItems;
  }

  handleLegalChange() {
    this.props.onLegalChange(
      this.state.privacyAgreement && this.state.eulaAgreement
    );
  }

  handlePrivacyChange(privacyAgreement: boolean) {
    this.setState({ privacyAgreement }, () => {
      this.handleLegalChange();
    });
  }

  handleEulaChange(eulaAgreement: boolean) {
    this.setState({ eulaAgreement }, () => {
      this.handleLegalChange();
    });
  }

  renderTrialForm() {
    return (
      <TrialForm>
        <SetupPageInputWrapper label="Interested in">
          <RadioGroup>
            <RadioInput
              label={
                <RadioInputLabel>
                  <TransferItemIcon
                    dangerouslySetInnerHTML={{
                      __html: transferItemIcon(ThemePalette.primary),
                    }}
                  />
                  Migrations
                </RadioInputLabel>
              }
              checked={
                this.props.customerInfoTrial.interestedIn === "migrations"
              }
              onChange={checked => {
                if (checked) {
                  this.props.onCustomerInfoChange("interestedIn", "migrations");
                }
              }}
            />
            <RadioInput
              label={
                <RadioInputLabel>
                  <TransferItemIcon
                    dangerouslySetInnerHTML={{
                      __html: transferItemIcon(ThemePalette.alert),
                    }}
                  />
                  Replicas
                </RadioInputLabel>
              }
              checked={this.props.customerInfoTrial.interestedIn === "replicas"}
              onChange={checked => {
                if (checked) {
                  this.props.onCustomerInfoChange("interestedIn", "replicas");
                }
              }}
            />
            <RadioInput
              label="Both"
              checked={this.props.customerInfoTrial.interestedIn === "both"}
              onChange={checked => {
                if (checked) {
                  this.props.onCustomerInfoChange("interestedIn", "both");
                }
              }}
            />
          </RadioGroup>
        </SetupPageInputWrapper>
        <SetupPageInputWrapper label="Source Platform">
          <Dropdown
            width={450}
            items={this.sourcePlatformItems}
            // eslint-disable-next-line react/no-unstable-nested-components
            labelRenderer={(item: PlatformDropdownItemType, idx: number) => (
              <PlatformItemRenderer>
                <PlatformLogoBackground whiteBackground={idx > 0}>
                  <EndpointLogos endpoint={item.value} height={32} />
                </PlatformLogoBackground>
                {item.label}
              </PlatformItemRenderer>
            )}
            selectedItem={{
              value: this.props.customerInfoTrial.sourcePlatform,
              label: getPlatformLabelForValue(
                this.props.customerInfoTrial.sourcePlatform
              ),
            }}
            onChange={item => {
              this.props.onCustomerInfoChange("sourcePlatform", item.value);
            }}
          />
        </SetupPageInputWrapper>
        <SetupPageInputWrapper label="Destination Platform">
          <Dropdown
            width={450}
            items={this.destinationPlatformItems}
            // eslint-disable-next-line react/no-unstable-nested-components
            labelRenderer={(item: PlatformDropdownItemType, idx: number) => (
              <PlatformItemRenderer>
                <PlatformLogoBackground whiteBackground={idx > 0}>
                  <EndpointLogos endpoint={item.value} height={32} />
                </PlatformLogoBackground>
                {item.label}
              </PlatformItemRenderer>
            )}
            selectedItem={{
              value: this.props.customerInfoTrial.destinationPlatform,
              label: getPlatformLabelForValue(
                this.props.customerInfoTrial.destinationPlatform
              ),
            }}
            onChange={item => {
              this.props.onCustomerInfoChange(
                "destinationPlatform",
                item.value
              );
            }}
          />
        </SetupPageInputWrapper>
      </TrialForm>
    );
  }

  render() {
    return (
      <Wrapper>
        <SetupPageTitle
          title={
            this.props.licenceType === "trial"
              ? "Coriolis® Trial License"
              : "Coriolis® Agreement"
          }
        />
        {this.props.licenceType === "trial" ? this.renderTrialForm() : null}
        <AgreementForm>
          <CheckboxWrapper>
            <Checkbox
              checked={this.state.privacyAgreement}
              onChange={privacyAgreement => {
                this.handlePrivacyChange(privacyAgreement);
              }}
            />
            <CheckboxLabel
              onClick={() => {
                this.handlePrivacyChange(!this.state.privacyAgreement);
              }}
            >
              By submitting I agree to the usage of my data according to
              the&nbsp;
              <CheckboxLink
                href={LEGAL_URLS.privacy}
                target="_blank"
                onClick={e => {
                  e.stopPropagation();
                }}
              >
                Privacy Policy
                <OpenInNewIconWrapper
                  dangerouslySetInnerHTML={{
                    __html: OpenInNewIcon(ThemePalette.primary),
                  }}
                />
              </CheckboxLink>
              .
            </CheckboxLabel>
          </CheckboxWrapper>
          <CheckboxWrapper>
            <Checkbox
              checked={this.state.eulaAgreement}
              onChange={eulaAgreement => {
                this.handleEulaChange(eulaAgreement);
              }}
            />
            <CheckboxLabel
              onClick={() => {
                this.handleEulaChange(!this.state.eulaAgreement);
              }}
            >
              By submitting I agree to the&nbsp;
              <CheckboxLink
                href={LEGAL_URLS.eula}
                target="_blank"
                onClick={e => {
                  e.stopPropagation();
                }}
              >
                Coriolis® EULA
                <OpenInNewIconWrapper
                  dangerouslySetInnerHTML={{
                    __html: OpenInNewIcon(ThemePalette.primary),
                  }}
                />
              </CheckboxLink>
              .
            </CheckboxLabel>
          </CheckboxWrapper>
        </AgreementForm>
      </Wrapper>
    );
  }
}

export default SetupPageLegal;
