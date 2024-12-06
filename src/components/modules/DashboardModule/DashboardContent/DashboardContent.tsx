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
import { observer } from "mobx-react";
import styled from "styled-components";
import autobind from "autobind-decorator";

import DashboardInfoCount from "@src/components/modules/DashboardModule/DashboardInfoCount";
import DashboardLicence from "@src/components/modules/DashboardModule/DashboardLicence";
import DashboardActivity from "@src/components/modules/DashboardModule/DashboardActivity";
import DashboardTopEndpoints from "@src/components/modules/DashboardModule/DashboardTopEndpoints";
import DashboardExecutions from "@src/components/modules/DashboardModule/DashboardExecutions";

import { ThemePalette } from "@src/components/Theme";

import type { Endpoint } from "@src/@types/Endpoint";
import type { Project } from "@src/@types/Project";
import type { User } from "@src/@types/User";
import type { Licence, LicenceServerStatus } from "@src/@types/Licence";
import type { NotificationItemData } from "@src/@types/NotificationItem";
import { TransferItem, DeploymentItem } from "@src/@types/MainItem";

const MIDDLE_WIDTHS = ["264px", "264px", "264px"];

const Wrapper = styled.div<any>`
  margin-bottom: 64px;
`;
const RowLayout = styled.div<any>`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 40px;
  margin-left: -32px;
  & > div {
    margin-top: 40px;
    margin-left: 32px;
  }
`;
const MiddleMobileLayout = styled.div<any>`
  margin: 40px 0;
`;

type Props = {
  transfers: TransferItem[];
  deployments: DeploymentItem[];
  endpoints: Endpoint[];
  projects: Project[];
  transfersLoading: boolean;
  deploymentsLoading: boolean;
  endpointsLoading: boolean;
  usersLoading: boolean;
  projectsLoading: boolean;
  licenceLoading: boolean;
  notificationItemsLoading: boolean;
  users: User[];
  licence: Licence | null;
  licenceServerStatus: LicenceServerStatus | null;
  licenceError: string | null;
  notificationItems: NotificationItemData[];
  isAdmin: boolean;
  onNewTransferClick: () => void;
  onNewEndpointClick: () => void;
  onAddLicenceClick: () => void;
};
type State = {
  useMobileLayout: boolean;
  useLargeActivity: boolean;
};
@observer
class DashboardContent extends React.Component<Props, State> {
  state = {
    useMobileLayout: false,
    useLargeActivity: false,
  };

  UNSAFE_componentWillMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize, false);
  }

  @autobind
  handleResize() {
    if (window.innerWidth < 1120 && !this.state.useMobileLayout) {
      this.setState({ useMobileLayout: true });
    } else if (window.innerWidth >= 1120 && this.state.useMobileLayout) {
      this.setState({ useMobileLayout: false });
    }
    if (window.innerWidth >= 2100 && !this.state.useLargeActivity) {
      this.setState({ useLargeActivity: true });
    } else if (window.innerWidth < 2100 && this.state.useLargeActivity) {
      this.setState({ useLargeActivity: false });
    }
  }

  renderMiddleModules() {
    const modules = [
      <DashboardActivity
        key="activity"
        large={this.state.useMobileLayout || this.state.useLargeActivity}
        notificationItems={this.props.notificationItems}
        loading={this.props.notificationItemsLoading}
        style={
          this.state.useMobileLayout
            ? null
            : {
                minWidth: MIDDLE_WIDTHS[0],
                width: MIDDLE_WIDTHS[0],
              }
        }
        onNewClick={this.props.onNewTransferClick}
      />,
      <DashboardTopEndpoints
        key="top-endpoints"
        transfers={this.props.transfers}
        endpoints={this.props.endpoints}
        loading={
          this.props.transfersLoading ||
          this.props.deploymentsLoading ||
          this.props.endpointsLoading
        }
        style={{
          minWidth: MIDDLE_WIDTHS[1],
          width: MIDDLE_WIDTHS[1],
        }}
        onNewClick={this.props.onNewEndpointClick}
      />,
      <DashboardLicence
        key="licence"
        licence={this.props.licence}
        loading={this.props.licenceLoading}
        licenceServerStatus={this.props.licenceServerStatus}
        licenceError={this.props.licenceError}
        onAddClick={this.props.onAddLicenceClick}
        style={{
          minWidth: MIDDLE_WIDTHS[2],
          width: MIDDLE_WIDTHS[2],
        }}
      />,
    ];

    if (this.state.useMobileLayout) {
      return (
        <MiddleMobileLayout>
          {modules[0]}
          <RowLayout>
            {modules[1]}
            {modules[2]}
          </RowLayout>
        </MiddleMobileLayout>
      );
    }

    return (
      <RowLayout>
        {modules[0]}
        {modules[1]}
        {modules[2]}
      </RowLayout>
    );
  }

  getReplicas() {
    return this.props.transfers.filter(
      (r: TransferItem) => r.scenario === "replica"
    );
  }

  getLiveMigrations() {
    return this.props.transfers.filter(
      (r: TransferItem) => r.scenario === "live_migration"
    );
  }

  render() {
    let infoCountData = [
      {
        label: "Replicas",
        value: this.getReplicas().length,
        color: ThemePalette.alert,
        link: "/transfers",
        loading: this.props.transfersLoading,
      },
      {
        label: "Migrations",
        value: this.getLiveMigrations().length,
        color: ThemePalette.primary,
        link: "/transfers",
        loading: this.props.transfersLoading,
      },
      {
        label: "Endpoints",
        value: this.props.endpoints.length,
        color: ThemePalette.black,
        link: "/endpoints",
        loading: this.props.endpointsLoading,
      },
    ];

    if (this.props.isAdmin) {
      infoCountData = infoCountData.concat([
        {
          label: "Users",
          value: this.props.users.length,
          color: ThemePalette.grayscale[3],
          link: "/users",
          loading: this.props.usersLoading,
        },
        {
          label: "Projects",
          value: this.props.projects.length,
          color: ThemePalette.grayscale[3],
          link: "/projects",
          loading: this.props.projectsLoading,
        },
      ]);
    }

    return (
      <Wrapper>
        <DashboardInfoCount data={infoCountData} />
        {this.renderMiddleModules()}
        <DashboardExecutions
          replicas={this.getReplicas()}
          migrations={this.getLiveMigrations()}
          loading={this.props.transfersLoading || this.props.deploymentsLoading}
        />
      </Wrapper>
    );
  }
}

export default DashboardContent;
