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
import React from "react";
import styled from "styled-components";

import DashboardContent from "@src/components/modules/DashboardModule/DashboardContent";
import Navigation from "@src/components/modules/NavigationModule/Navigation";
import MainTemplate from "@src/components/modules/TemplateModule/MainTemplate";
import PageHeader from "@src/components/smart/PageHeader";
import endpointStore from "@src/stores/EndpointStore";
import licenceStore from "@src/stores/LicenceStore";
import deploymentStore from "@src/stores/DeploymentStore";
import notificationStore from "@src/stores/NotificationStore";
import projectStore from "@src/stores/ProjectStore";
import transferStore from "@src/stores/TransferStore";
import userStore from "@src/stores/UserStore";
import configLoader from "@src/utils/Config";
import Utils from "@src/utils/ObjectUtils";

const Wrapper = styled.div<any>``;

type State = {
  modalIsOpen: boolean;
};
@observer
class ProjectsPage extends React.Component<{ history: any }, State> {
  state = {
    modalIsOpen: false,
  };

  pageHeaderRef!: PageHeader;

  pollTimeout = 0;

  stopPolling = false;

  componentDidMount() {
    document.title = "Dashboard";

    this.stopPolling = false;
    this.pollData(true);
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout);
    this.stopPolling = true;
  }

  async handleProjectChange() {
    this.stopPolling = true;
    clearTimeout(this.pollTimeout);
    await this.loadData(true);
    this.pollData(false);
  }

  handleModalOpen() {
    this.setState({ modalIsOpen: true });
  }

  handleModalClose() {
    this.setState({ modalIsOpen: false }, () => {
      this.pollData(false);
    });
  }

  handleNewEndpointClick() {
    this.pageHeaderRef.handleNewItem("endpoint");
  }

  handleAddLicenceClick() {
    this.pageHeaderRef.handleNewItem("licence");
  }

  async pollData(showLoading: boolean) {
    if (this.state.modalIsOpen || this.stopPolling) {
      return;
    }

    await this.loadData(showLoading);
    this.pollTimeout = window.setTimeout(() => {
      this.pollData(false);
    }, configLoader.config.requestPollTimeout);
  }

  async loadData(showLoading: boolean) {
    this.loadAdminData(showLoading);

    await Promise.all([
      transferStore.getTransfers({ skipLog: true, showLoading }),
      deploymentStore.getDeployments({ skipLog: true, showLoading }),
      endpointStore.getEndpoints({ skipLog: true, showLoading }),
      projectStore.getProjects({ skipLog: true, showLoading }),
    ]);
  }

  async loadAdminData(showLoading: boolean) {
    await Utils.waitFor(
      () => Boolean(userStore.loggedUser && userStore.loggedUser.isAdmin),
      {
        timeoutMs: 30000,
        intervalMs: 100,
      }
    );
    if (userStore.loggedUser?.isAdmin) {
      userStore.getAllUsers({ skipLog: true, showLoading });
      licenceStore.loadLicenceInfo({ skipLog: true, showLoading });
    }
  }

  render() {
    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="dashboard" />}
          listNoMargin
          listComponent={
            <DashboardContent
              transfers={transferStore.transfers}
              deployments={deploymentStore.deployments}
              endpoints={endpointStore.endpoints}
              users={userStore.users}
              projects={projectStore.projects}
              licence={licenceStore.licenceInfo}
              licenceServerStatus={licenceStore.licenceServerStatus}
              isAdmin={Boolean(
                userStore.loggedUser && userStore.loggedUser.isAdmin
              )}
              notificationItems={notificationStore.notificationItems}
              notificationItemsLoading={notificationStore.loading}
              endpointsLoading={endpointStore.loading}
              deploymentsLoading={deploymentStore.loading}
              projectsLoading={projectStore.projects.length === 0}
              usersLoading={userStore.users.length === 0}
              licenceLoading={licenceStore.loadingLicenceInfo}
              licenceError={licenceStore.licenceInfoError}
              transfersLoading={transferStore.loading}
              onNewTransferClick={() => {
                this.props.history.push("/wizard/migration");
              }}
              onNewEndpointClick={() => {
                this.handleNewEndpointClick();
              }}
              onAddLicenceClick={() => {
                this.handleAddLicenceClick();
              }}
            />
          }
          headerComponent={
            <PageHeader
              title="Dashboard"
              onModalOpen={() => {
                this.handleModalOpen();
              }}
              onModalClose={() => {
                this.handleModalClose();
              }}
              onProjectChange={() => {
                this.handleProjectChange();
              }}
              componentRef={ref => {
                this.pageHeaderRef = ref;
              }}
            />
          }
        />
      </Wrapper>
    );
  }
}

export default ProjectsPage;
