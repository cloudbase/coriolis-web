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

import type { User } from "@src/@types/User";
import type { Project } from "@src/@types/Project";
import type { Endpoint as EndpointType } from "@src/@types/Endpoint";

import Dropdown from "@src/components/ui/Dropdowns/Dropdown";
import NewItemDropdown from "@src/components/ui/Dropdowns/NewItemDropdown";
import NotificationDropdown from "@src/components/ui/Dropdowns/NotificationDropdown";
import UserDropdown from "@src/components/ui/Dropdowns/UserDropdown";
import Modal from "@src/components/ui/Modal";
import ChooseProvider from "@src/components/modules/EndpointModule/ChooseProvider";
import EndpointModal from "@src/components/modules/EndpointModule/EndpointModal";
import UserModal from "@src/components/modules/UserModule/UserModal";
import ProjectModal from "@src/components/modules/ProjectModule/ProjectModal";

import projectStore from "@src/stores/ProjectStore";
import userStore from "@src/stores/UserStore";
import endpointStore from "@src/stores/EndpointStore";
import notificationStore from "@src/stores/NotificationStore";
import providerStore from "@src/stores/ProviderStore";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import { ProviderTypes } from "@src/@types/Providers";
import MinionEndpointModal from "@src/components/modules/MinionModule/MinionEndpointModal";
import MinionPoolModal from "@src/components/modules/MinionModule/MinionPoolModal";
import ObjectUtils from "@src/utils/ObjectUtils";
import regionStore from "@src/stores/RegionStore";
import AboutModal from "@src/components/smart/AboutModal";
import Config from "@src/utils/Config";

const Wrapper = styled.div<any>`
  display: flex;
  margin: 32px 0 48px 0;
  align-items: center;
  flex-wrap: wrap;
`;
const Title = styled.div<any>`
  color: ${ThemePalette.black};
  font-size: 32px;
  font-weight: ${ThemeProps.fontWeights.light};
  flex-grow: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-top: 16px;
  margin-right: 16px;
`;
const Controls = styled.div<any>`
  display: flex;
  margin-top: 16px;
  margin-left: -16px;

  & > div {
    margin-left: 16px;
  }
`;

type Props = {
  title: string;
  onProjectChange?: (project: Project) => void;
  onModalOpen?: () => void;
  onModalClose?: () => void;
  componentRef?: (ref: any) => void;
};
type State = {
  showChooseProviderModal: boolean;
  showEndpointModal: boolean;
  showChooseMinionEndpointModal: boolean;
  showMinionPoolModal: boolean;
  selectedMinionPoolEndpoint: EndpointType | null;
  showUserModal: boolean;
  showProjectModal: boolean;
  showAddLicenceModal: boolean;
  showAboutModal: boolean;
  providerType: ProviderTypes | null;
  uploadedEndpoint: EndpointType | null;
  multiValidating: boolean;
  selectedMinionPoolPlatform: "source" | "destination";
  addingProject: boolean;
};
@observer
class PageHeader extends React.Component<Props, State> {
  state: State = {
    showChooseProviderModal: false,
    showEndpointModal: false,
    showChooseMinionEndpointModal: false,
    selectedMinionPoolEndpoint: null,
    showMinionPoolModal: false,
    showUserModal: false,
    showProjectModal: false,
    providerType: null,
    uploadedEndpoint: null,
    showAboutModal: false,
    showAddLicenceModal: false,
    multiValidating: false,
    selectedMinionPoolPlatform: "source",
    addingProject: false,
  };

  pollTimeout!: number;

  stopPolling = false;

  UNSAFE_componentWillMount() {
    this.stopPolling = false;
    this.pollData(true);
    if (this.props.componentRef) {
      this.props.componentRef(this);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout);
    this.stopPolling = true;
  }

  getCurrentProject() {
    const project =
      userStore.loggedUser && userStore.loggedUser.project
        ? userStore.loggedUser.project
        : null;
    if (project) {
      return projectStore.projects.find(p => p.id === project.id);
    }

    return null;
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case "about":
        this.setState({ showAboutModal: true });
        if (this.props.onModalOpen) {
          this.props.onModalOpen();
        }
        return;
      case "signout":
        userStore.logout();
        break;
      default:
    }
  }

  handleNewItem(item: string | null | undefined) {
    switch (item) {
      case "endpoint":
        providerStore.loadProviders();
        regionStore.getRegions();
        if (this.props.onModalOpen) {
          this.props.onModalOpen();
        }
        this.setState({ showChooseProviderModal: true });
        break;
      case "minionPool":
        providerStore.loadProviders();
        endpointStore.getEndpoints({ showLoading: true });
        if (this.props.onModalOpen) {
          this.props.onModalOpen();
        }
        this.setState({ showChooseMinionEndpointModal: true });
        break;
      case "user":
        projectStore.getProjects();
        if (this.props.onModalOpen) {
          this.props.onModalOpen();
        }
        this.setState({ showUserModal: true });
        break;
      case "project":
        if (this.props.onModalOpen) {
          this.props.onModalOpen();
        }
        endpointStore.getEndpoints();
        this.setState({ showProjectModal: true });
        break;
      case "licence":
        if (this.props.onModalOpen) {
          this.props.onModalOpen();
        }
        this.setState({ showAddLicenceModal: true });
        break;
      default:
    }
  }

  handleNotificationsClose() {
    notificationStore.saveSeen();
  }

  handleCloseChooseProviderModal() {
    if (this.props.onModalClose) {
      this.props.onModalClose();
    }
    this.setState({ showChooseProviderModal: false }, () => {
      this.pollData();
    });
  }

  handleCloseChooseMinionPoolEndpointModal() {
    if (this.props.onModalClose) {
      this.props.onModalClose();
    }
    this.setState({ showChooseMinionEndpointModal: false }, () => {
      this.pollData();
    });
  }

  handleBackMinionPoolModal() {
    this.setState({
      showChooseMinionEndpointModal: true,
      showMinionPoolModal: false,
    });
  }

  handleCloseMinionPoolModalRequest() {
    if (this.props.onModalClose) {
      this.props.onModalClose();
    }
    this.setState({ showMinionPoolModal: false }, () => {
      this.pollData();
    });
  }

  handleChooseMinionPoolSelectEndpoint(
    selectedMinionPoolEndpoint: EndpointType,
    platform: "source" | "destination"
  ) {
    this.setState({
      showChooseMinionEndpointModal: false,
      showMinionPoolModal: true,
      selectedMinionPoolEndpoint,
      selectedMinionPoolPlatform: platform,
    });
  }

  handleProviderClick(providerType: ProviderTypes) {
    this.setState({
      showChooseProviderModal: false,
      showEndpointModal: true,
      uploadedEndpoint: null,
      providerType,
    });
  }

  handleUploadEndpoint(endpoint: EndpointType) {
    endpointStore.setConnectionInfo(endpoint.connection_info);
    this.setState({
      showChooseProviderModal: false,
      showEndpointModal: true,
      providerType: endpoint.type,
      uploadedEndpoint: endpoint,
    });
  }

  handleRemoveEndpoint(endpoint: EndpointType) {
    endpointStore.delete(endpoint);
  }

  async handleValidateMultipleEndpoints(endpoints: EndpointType[]) {
    this.setState({ multiValidating: true });
    const addedEndpoints = await endpointStore.addMultiple(endpoints);
    await endpointStore.validateMultiple(addedEndpoints);
    this.setState({ multiValidating: false });
  }

  handleResetValidation() {
    endpointStore.resetMultiValidation();
  }

  handleCloseEndpointModal() {
    if (this.props.onModalClose) {
      this.props.onModalClose();
    }
    this.setState({ showEndpointModal: false }, () => {
      this.pollData();
    });
  }

  handleBackEndpointModal(options?: { autoClose?: boolean }) {
    const showChooseProviderModal = !options || !options.autoClose;
    this.setState({ showChooseProviderModal, showEndpointModal: false }, () => {
      if (!showChooseProviderModal) {
        this.pollData();
      }
    });
  }

  async handleProjectChange(project: Project) {
    await userStore.switchProject(project.id);
    await projectStore.getProjects();
    notificationStore.loadData(true);

    if (this.props.onProjectChange) {
      this.props.onProjectChange(project);
    }
  }

  handleUserModalClose() {
    if (this.props.onModalClose) {
      this.props.onModalClose();
    }
    this.setState({ showUserModal: false }, () => {
      this.pollData();
    });
  }

  async handleUserUpdateClick(user: User) {
    await userStore.add(user);
    if (this.props.onModalClose) {
      this.props.onModalClose();
    }
    this.setState({ showUserModal: false }, () => {
      this.pollData();
    });
  }

  handleProjectModalClose() {
    if (this.props.onModalClose) {
      this.props.onModalClose();
    }
    this.setState({ showProjectModal: false }, () => {
      this.pollData();
    });
  }

  async handleProjectModalUpdateClick(project: Project) {
    try {
      this.setState({ addingProject: true });
      const newProject = await projectStore.add(project);

      const bareMetalEndpoint = endpointStore.endpoints.find(
        e => e.name === Config.config.bareMetalEndpointName
      );
      if (bareMetalEndpoint) {
        await endpointStore.duplicate({
          shouldSwitchProject: true,
          onSwitchProject: () => userStore.switchProject(newProject.id),
          endpoints: [bareMetalEndpoint],
        });
      }
    } finally {
      if (this.props.onModalClose) {
        this.props.onModalClose();
      }
      this.setState({ showProjectModal: false, addingProject: false }, () => {
        this.pollData();
      });
    }
  }

  async pollData(showLoading?: boolean) {
    if (
      this.stopPolling ||
      this.state.showChooseProviderModal ||
      this.state.showEndpointModal ||
      this.state.showChooseMinionEndpointModal ||
      this.state.showMinionPoolModal ||
      this.state.showProjectModal ||
      this.state.showUserModal ||
      this.state.showAboutModal ||
      this.state.showAddLicenceModal
    ) {
      return;
    }

    await notificationStore.loadData(showLoading);
    this.pollTimeout = window.setTimeout(() => {
      this.pollData();
    }, 15000);
  }

  render() {
    return (
      <Wrapper>
        <Title>{this.props.title}</Title>
        <Controls>
          <Dropdown
            selectedItem={this.getCurrentProject()}
            items={projectStore.projects}
            onChange={project => {
              this.handleProjectChange(project);
            }}
            noItemsMessage="Loading..."
            labelField="name"
          />
          <NewItemDropdown
            onChange={item => {
              this.handleNewItem(item.value);
            }}
          />
          <NotificationDropdown
            items={notificationStore.notificationItems}
            onClose={() => this.handleNotificationsClose()}
          />
          <UserDropdown
            user={userStore.loggedUser}
            onItemClick={item => {
              this.handleUserItemClick(item);
            }}
          />
        </Controls>
        <Modal
          isOpen={this.state.showChooseProviderModal}
          title="New Cloud Endpoint"
          onRequestClose={() => {
            this.handleCloseChooseProviderModal();
          }}
        >
          <ChooseProvider
            onCancelClick={() => {
              this.handleCloseChooseProviderModal();
            }}
            providers={providerStore.providerNames}
            loading={providerStore.providersLoading || regionStore.loading}
            regions={regionStore.regions}
            onProviderClick={providerName => {
              this.handleProviderClick(providerName);
            }}
            onUploadEndpoint={endpoint => {
              this.handleUploadEndpoint(endpoint);
            }}
            multiValidating={this.state.multiValidating}
            onValidateMultipleEndpoints={endpoints => {
              this.handleValidateMultipleEndpoints(endpoints);
            }}
            multiValidation={endpointStore.multiValidation}
            onRemoveEndpoint={e => {
              this.handleRemoveEndpoint(e);
            }}
            onResetValidation={() => {
              this.handleResetValidation();
            }}
          />
        </Modal>
        {this.state.showChooseMinionEndpointModal ? (
          <MinionEndpointModal
            providers={providerStore.providers}
            endpoints={endpointStore.endpoints}
            loading={providerStore.providersLoading || endpointStore.loading}
            onRequestClose={() => {
              this.handleCloseChooseMinionPoolEndpointModal();
            }}
            onSelectEndpoint={(endpoint, platform) => {
              this.handleChooseMinionPoolSelectEndpoint(endpoint, platform);
            }}
          />
        ) : null}
        {this.state.showMinionPoolModal ? (
          <Modal
            isOpen
            title={`New ${ObjectUtils.capitalizeFirstLetter(
              this.state.selectedMinionPoolPlatform
            )} Minion Pool`}
            onRequestClose={() => {
              this.handleCloseMinionPoolModalRequest();
            }}
          >
            <MinionPoolModal
              cancelButtonText="Back"
              platform={this.state.selectedMinionPoolPlatform}
              endpoint={this.state.selectedMinionPoolEndpoint!}
              onCancelClick={() => {
                this.handleBackMinionPoolModal();
              }}
              onRequestClose={() => {
                this.handleCloseMinionPoolModalRequest();
              }}
            />
          </Modal>
        ) : null}
        {this.state.showEndpointModal && this.state.providerType ? (
          <Modal
            isOpen
            title="New Cloud Endpoint"
            onRequestClose={() => {
              this.handleCloseEndpointModal();
            }}
          >
            <EndpointModal
              type={this.state.providerType}
              cancelButtonText="Back"
              onCancelClick={options => {
                this.handleBackEndpointModal(options);
              }}
              endpoint={this.state.uploadedEndpoint}
              isNewEndpoint={Boolean(this.state.uploadedEndpoint)}
            />
          </Modal>
        ) : null}
        {this.state.showUserModal ? (
          <UserModal
            isNewUser
            loading={userStore.updating}
            projects={projectStore.projects}
            onRequestClose={() => {
              this.handleUserModalClose();
            }}
            onUpdateClick={user => {
              this.handleUserUpdateClick(user);
            }}
          />
        ) : null}
        {this.state.showProjectModal ? (
          <ProjectModal
            isNewProject
            loading={this.state.addingProject}
            onRequestClose={() => {
              this.handleProjectModalClose();
            }}
            onUpdateClick={project => {
              this.handleProjectModalUpdateClick(project);
            }}
          />
        ) : null}
        {this.state.showAboutModal || this.state.showAddLicenceModal ? (
          <AboutModal
            licenceAddMode={this.state.showAddLicenceModal}
            onRequestClose={() => {
              this.setState({
                showAboutModal: false,
                showAddLicenceModal: false,
              });
              if (this.props.onModalClose) {
                this.props.onModalClose();
              }
            }}
          />
        ) : null}
      </Wrapper>
    );
  }
}

export default PageHeader;
