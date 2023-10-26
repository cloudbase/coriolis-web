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

import { observer } from "mobx-react";
import * as React from "react";
import styled from "styled-components";

import licenceImage from "@src/components/modules/LicenceModule/images/licence";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import Button from "@src/components/ui/Button";
import CopyMultineValue from "@src/components/ui/CopyMultilineValue";
import InfoIcon from "@src/components/ui/InfoIcon";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import DateUtils from "@src/utils/DateUtils";
import ObjectUtils from "@src/utils/ObjectUtils";

import type { Licence, LicenceServerStatus } from "@src/@types/Licence";
const Wrapper = styled.div<any>`
  flex-grow: 1;
`;
const Title = styled.div<any>`
  font-size: 24px;
  font-weight: ${ThemeProps.fontWeights.light};
  margin-bottom: 12px;
`;
const Module = styled.div<any>`
  background: ${ThemePalette.grayscale[0]};
  display: flex;
  overflow: auto;
  border-radius: ${ThemeProps.borderRadius};
  padding: 24px 16px 16px 16px;
  height: 232px;
`;
const LicenceInfo = styled.div<any>`
  width: 100%;
`;
const LicenceError = styled.span`
  display: flex;
  flex-direction: column;
  p {
    margin: 16px 0 0 0;
    &:first-child {
      margin: 0;
    }
  }
`;
const ApplianceIdWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
`;
const ApplianceId = styled.div`
  margin-top: 16px;
`;
const AddLicenceButtonWrapper = styled.div`
  margin-top: 16px;
  text-align: center;
`;
const TopInfo = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const TopInfoText = styled.div`
  margin-bottom: 8px;
  color: ${ThemePalette.grayscale[4]};
`;
const TopInfoDate = styled.div<any>`
  ${ThemeProps.exactWidth("76px")}
  ${ThemeProps.exactHeight("80px")}
  display: flex;
  flex-direction: column;
  ${ThemeProps.boxShadow}
  border-radius: ${ThemeProps.borderRadius};
  overflow: hidden;
`;
const TopInfoDateTop = styled.div<any>`
  width: 100%;
  height: 27px;
  background: linear-gradient(#007ae7, #0044ca);
  color: white;
  text-align: center;
  line-height: 27px;
`;
const TopInfoDateBottom = styled.div<any>`
  background: white;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${ThemePalette.primary};
  font-size: 37px;
  font-weight: ${ThemeProps.fontWeights.extraLight};
`;
const Charts = styled.div<any>`
  margin-top: -8px;
`;
const ChartRow = styled.div`
  display: flex;
  margin-left: -32px;
  margin-top: 32px;
`;
const Chart = styled.div<any>`
  width: 100%;
  margin-left: 32px;
`;
const ChartHeader = styled.div<any>`
  display: flex;
  justify-content: space-between;
`;
const ChartHeaderCurrent = styled.div<any>``;
const ChartHeaderTotal = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
`;
const ChartBodyWrapper = styled.div<any>`
  height: 8px;
  background: ${ThemePalette.grayscale[2]};
  border-radius: ${ThemeProps.borderRadius};
  margin-top: 4px;
  overflow: hidden;
`;
const ChartBody = styled.div<any>`
  width: ${props => props.width}%;
  background: ${props => props.color};
  height: 100%;
`;
const Logo = styled.div`
  width: 96px;
  height: 96px;
  margin: 0 auto;
  transform: scale(0.7);
  text-align: center;
`;
const LoadingWrapper = styled.div<any>`
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

type Props = {
  licence: Licence | null;
  licenceServerStatus: LicenceServerStatus | null;
  loading: boolean;
  style?: React.CSSProperties;
  licenceError: string | null;
  onAddClick: () => void;
};
@observer
class DashboardLicence extends React.Component<Props> {
  buttonWrapperRef?: HTMLElement | null;
  licenceLogoRef?: HTMLElement | null;

  componentDidMount() {
    const resetLayout = async () => {
      await ObjectUtils.waitFor(
        () => !!this.buttonWrapperRef && !!this.licenceLogoRef,
        {
          silent: true,
        }
      );
      this.resetLayout();
    };
    resetLayout();
    window.addEventListener("resize", this.resetLayout.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resetLayout.bind(this));
  }

  resetLayout() {
    if (!this.buttonWrapperRef || !this.licenceLogoRef) {
      return;
    }
    if (this.buttonWrapperRef.getBoundingClientRect().width < 370) {
      this.licenceLogoRef.style.display = "none";
    } else {
      this.licenceLogoRef.style.display = "block";
    }
  }

  renderLicenceStatusText(info: Licence): React.ReactNode {
    const graphDataRows = [
      [
        {
          color: ThemePalette.alert,
          current: info.currentPerformedReplicas,
          total: info.currentAvailableReplicas,
          label: "Used Replica",
          info: `The number of replicas consumed over the number of replicas available in
          all currently active licences (including non-activated floating licences)`,
        },
      ],
      [
        {
          color: ThemePalette.primary,
          current: info.currentPerformedMigrations,
          total: info.currentAvailableMigrations,
          label: "Used Migration",
          info: `The number of migrations consumed over the number of migrations available in
          all currently active licences (including non-activated floating licences)`,
        },
      ],
    ];
    const expirationData = DateUtils.getLocalDate(
      info.earliestLicenceExpiryDate
    );
    return (
      <LicenceInfo>
        <TopInfo>
          <TopInfoText>Expires on</TopInfoText>
          <TopInfoDate>
            <TopInfoDateTop>
              {expirationData.toFormat("LLL")} &#39;
              {expirationData.toFormat("yy")}
            </TopInfoDateTop>
            <TopInfoDateBottom>
              {expirationData.toFormat("dd")}
            </TopInfoDateBottom>
          </TopInfoDate>
        </TopInfo>
        <Charts>
          {graphDataRows.map((row, i) => (
            <ChartRow key={i}>
              {row.map(data => (
                <Chart key={data.label}>
                  <ChartHeader>
                    <ChartHeaderCurrent>
                      {data.current}{" "}
                      {data.current === 1 ? data.label : `${data.label}s`}{" "}
                      <InfoIcon marginBottom={-3} text={data.info} />
                    </ChartHeaderCurrent>
                    <ChartHeaderTotal>Total {data.total}</ChartHeaderTotal>
                  </ChartHeader>
                  <ChartBodyWrapper>
                    <ChartBody
                      color={data.color}
                      width={(data.current / data.total) * 100}
                    />
                  </ChartBodyWrapper>
                </Chart>
              ))}
            </ChartRow>
          ))}
        </Charts>
      </LicenceInfo>
    );
  }

  renderLicenceError() {
    return (
      <LicenceError>
        {this.props.licenceError?.split("\n").map((str, i) => (
          <p key={i}>{str}</p>
        ))}
      </LicenceError>
    );
  }

  renderLicenceExpired(licence: Licence, serverStatus: LicenceServerStatus) {
    const applianceId = `${licence.applianceId}-licence${serverStatus.supported_licence_versions[0]}`;
    return (
      <LicenceError>
        <p>
          Please contact Cloudbase Solutions with your Appliance ID in order to
          obtain a Coriolis® licence.
        </p>
        <ApplianceIdWrapper>
          <ApplianceId>
            Appliance ID:
            <CopyMultineValue value={applianceId} />
          </ApplianceId>
          <AddLicenceButtonWrapper
            ref={(ref: HTMLElement | null) => (this.buttonWrapperRef = ref)}
          >
            <Logo
              ref={(ref: HTMLElement | null) => {
                this.licenceLogoRef = ref;
              }}
              dangerouslySetInnerHTML={{
                __html: licenceImage(ThemePalette.grayscale[5]),
              }}
            />
            <Button primary onClick={this.props.onAddClick}>
              Add Licence
            </Button>
          </AddLicenceButtonWrapper>
        </ApplianceIdWrapper>
      </LicenceError>
    );
  }

  renderLoading() {
    return (
      <LoadingWrapper>
        <StatusImage status="RUNNING" />
      </LoadingWrapper>
    );
  }

  render() {
    const licence = this.props.licence;
    let moduleContent = null;
    if (licence && this.props.licenceServerStatus) {
      if (
        new Date(licence.earliestLicenceExpiryDate).getTime() >
        new Date().getTime()
      ) {
        moduleContent = this.renderLicenceStatusText(licence);
      } else {
        moduleContent = this.renderLicenceExpired(
          licence,
          this.props.licenceServerStatus
        );
      }
    } else if (this.props.loading) {
      moduleContent = this.renderLoading();
    } else if (this.props.licenceError) {
      moduleContent = this.renderLicenceError();
    }

    return licence || this.props.loading || this.props.licenceError ? (
      <Wrapper style={this.props.style}>
        <Title>Current Licence</Title>
        <Module>{moduleContent}</Module>
      </Wrapper>
    ) : null;
  }
}

export default DashboardLicence;
