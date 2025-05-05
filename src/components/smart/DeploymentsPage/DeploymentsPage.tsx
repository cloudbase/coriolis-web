/*
Copyright (C) 2024 Cloudbase Solutions SRL
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

import MainTemplate from "@src/components/modules/TemplateModule/MainTemplate";
import Navigation from "@src/components/modules/NavigationModule/Navigation";
import FilterList from "@src/components/ui/Lists/FilterList";
import PageHeader from "@src/components/smart/PageHeader";
import AlertModal from "@src/components/ui/AlertModal";

import projectStore from "@src/stores/ProjectStore";
import deploymentStore from "@src/stores/DeploymentStore";
import endpointStore from "@src/stores/EndpointStore";
import notificationStore from "@src/stores/NotificationStore";
import configLoader from "@src/utils/Config";

import { ThemePalette } from "@src/components/Theme";
import deploymentFields from "@src/components/modules/TransferModule/DeploymentOptions/DeploymentFields";
import { DeploymentItem } from "@src/@types/MainItem";
import userStore from "@src/stores/UserStore";
import TransferListItem from "@src/components/modules/TransferModule/TransferListItem";
import deploymentLargeImage from "./images/deployment-large.svg";

const Wrapper = styled.div<any>``;

type State = {
  selectedDeployments: DeploymentItem[];
  modalIsOpen: boolean;
  showDeleteDeploymentModal: boolean;
  showCancelDeploymentModal: boolean;
  showRecreateDeploymentsModal: boolean;
};

type Props = {
  onNavigate: (path: string) => void;
};

@observer
class DeploymentsPage extends React.Component<Props, State> {
  state: State = {
    showDeleteDeploymentModal: false,
    showCancelDeploymentModal: false,
    showRecreateDeploymentsModal: false,
    selectedDeployments: [],
    modalIsOpen: false,
  };

  pollTimeout = 0;

  stopPolling = false;

  componentDidMount() {
    document.title = "Coriolis Deployments";

    projectStore.getProjects();
    endpointStore.getEndpoints({ showLoading: true });
    userStore.getAllUsers({
      showLoading: userStore.users.length === 0,
      quietError: true,
    });

    this.stopPolling = false;
    this.pollData();
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout);
    this.stopPolling = true;
  }

  getEndpoint(endpointId: string) {
    return endpointStore.endpoints.find(endpoint => endpoint.id === endpointId);
  }

  getFilterItems() {
    return [
      { label: "All", value: "all" },
      { label: "Running", value: "RUNNING" },
      { label: "Error", value: "ERROR" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Canceled", value: "CANCELED" },
    ];
  }

  getStatus(deploymentId: string): string {
    const deployment = deploymentStore.deployments.find(
      m => m.id === deploymentId,
    );
    return deployment ? deployment.last_execution_status : "";
  }

  getDeploymentType(deploymentId: string): string {
    const deployment = deploymentStore.deployments.find(
      m => m.id === deploymentId,
    );
    return deployment ? deployment.transfer_scenario_type : "";
  }

  handleProjectChange() {
    endpointStore.getEndpoints({ showLoading: true });
    deploymentStore.getDeployments({ showLoading: true });
  }

  handleReloadButtonClick() {
    projectStore.getProjects();
    endpointStore.getEndpoints({ showLoading: true });
    deploymentStore.getDeployments({ showLoading: true });
    userStore.getAllUsers({ showLoading: true, quietError: true });
  }

  handleItemClick(item: DeploymentItem) {
    if (item.last_execution_status === "RUNNING") {
      this.props.onNavigate(`/deployments/${item.id}/tasks`);
    } else {
      this.props.onNavigate(`/deployments/${item.id}`);
    }
  }

  deleteSelectedDeployments() {
    this.state.selectedDeployments.forEach(deployment => {
      deploymentStore.delete(deployment.id);
    });
    this.setState({ showDeleteDeploymentModal: false });
  }

  cancelSelectedDeployments() {
    this.state.selectedDeployments.forEach(deployment => {
      const status = this.getStatus(deployment.id);
      if (status === "RUNNING" || status === "AWAITING_MINION_ALLOCATIONS") {
        deploymentStore.cancel(deployment.id);
      }
    });
    notificationStore.alert("Canceling deployments");
    this.setState({ showCancelDeploymentModal: false });
  }

  async recreateDeployments() {
    notificationStore.alert("Recreating deployments");
    this.setState({ showRecreateDeploymentsModal: false });

    await Promise.all(
      this.state.selectedDeployments.map(async deployment => {
        if (deployment.transfer_id) {
          await deploymentStore.deployTransfer({
            transferId: deployment.transfer_id,
            fields: deploymentFields,
            uploadedUserScripts: [],
            removedUserScripts: [],
            userScriptData: deployment.user_scripts,
            minionPoolMappings:
              deployment.instance_osmorphing_minion_pool_mappings || {},
          });
        } else {
          await deploymentStore.recreateFullCopy(deployment as any);
        }
      }),
    );

    deploymentStore.getDeployments();
  }

  handleEmptyListButtonClick() {
    this.props.onNavigate("/wizard/deployment");
  }

  handleModalOpen() {
    this.setState({ modalIsOpen: true });
  }

  handleModalClose() {
    this.setState({ modalIsOpen: false }, () => {
      this.pollData();
    });
  }

  searchText(item: DeploymentItem, text: string) {
    let result = false;
    if (item.instances[0].toLowerCase().indexOf(text) > -1) {
      return true;
    }
    if (item.notes && item.notes.toLowerCase().indexOf(text) > -1) {
      return true;
    }
    if (item.destination_environment) {
      Object.keys(item.destination_environment).forEach(prop => {
        if (
          item.destination_environment[prop]?.toLowerCase &&
          item.destination_environment[prop].toLowerCase().indexOf(text) > -1
        ) {
          result = true;
        }
      });
    }
    return result;
  }

  itemFilterFunction(
    item: DeploymentItem,
    filterStatus?: string | null,
    filterText?: string,
  ) {
    if (
      (filterStatus !== "all" && item.last_execution_status !== filterStatus) ||
      !this.searchText(
        item,
        (filterText?.toLowerCase && filterText.toLowerCase()) || "",
      )
    ) {
      return false;
    }

    return true;
  }

  async pollData() {
    if (this.state.modalIsOpen || this.stopPolling) {
      return;
    }

    await Promise.all([
      deploymentStore.getDeployments({ skipLog: true }),
      endpointStore.getEndpoints({ skipLog: true }),
      userStore.getAllUsers({ skipLog: true, quietError: true }),
    ]);
    this.pollTimeout = window.setTimeout(() => {
      this.pollData();
    }, configLoader.config.requestPollTimeout);
  }

  render() {
    let atLeaseOneIsRunning = false;
    this.state.selectedDeployments.forEach(deployment => {
      const status = this.getStatus(deployment.id);
      atLeaseOneIsRunning =
        atLeaseOneIsRunning ||
        status === "RUNNING" ||
        status === "AWAITING_MINION_ALLOCATIONS";
    });
    const BulkActions = [
      {
        label: "Cancel",
        disabled: !atLeaseOneIsRunning,
        action: () => {
          this.setState({ showCancelDeploymentModal: true });
        },
      },
      {
        label: "Recreate Deployments",
        disabled: atLeaseOneIsRunning,
        color: ThemePalette.primary,
        action: () => {
          this.setState({ showRecreateDeploymentsModal: true });
        },
      },
      {
        label: "Delete Deployments",
        color: ThemePalette.alert,
        action: () => {
          this.setState({ showDeleteDeploymentModal: true });
        },
      },
    ];

    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="deployments" />}
          listComponent={
            <FilterList
              filterItems={this.getFilterItems()}
              selectionLabel="deployment"
              loading={deploymentStore.loading}
              items={deploymentStore.deployments}
              onItemClick={item => {
                this.handleItemClick(item);
              }}
              onReloadButtonClick={() => {
                this.handleReloadButtonClick();
              }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              onSelectedItemsChange={selectedDeployments => {
                this.setState({ selectedDeployments });
              }}
              dropdownActions={BulkActions}
              renderItemComponent={options => (
                <TransferListItem
                  {...options}
                  endpointType={id => {
                    const endpoint = this.getEndpoint(id);
                    if (endpoint) {
                      return endpoint.type;
                    }
                    if (endpointStore.loading) {
                      return "Loading...";
                    }
                    return "Not Found";
                  }}
                  getUserName={id =>
                    userStore.users.find(u => u.id === id)?.name
                  }
                  userNameLoading={userStore.allUsersLoading}
                />
              )}
              emptyListImage={deploymentLargeImage}
              emptyListMessage="It seems like you don't have any Deployments in this project."
              emptyListExtraMessage="A Coriolis Deployment is a deployment of a Transfer between two cloud endpoints."
            />
          }
          headerComponent={
            <PageHeader
              title="Coriolis Deployments"
              onProjectChange={() => {
                this.handleProjectChange();
              }}
              onModalOpen={() => {
                this.handleModalOpen();
              }}
              onModalClose={() => {
                this.handleModalClose();
              }}
            />
          }
        />
        {this.state.showDeleteDeploymentModal ? (
          <AlertModal
            isOpen
            title="Delete Selected Deployments?"
            message="Are you sure you want to delete the selected deployments?"
            extraMessage="Deleting a Coriolis Deployment is permanent!"
            onConfirmation={() => {
              this.deleteSelectedDeployments();
            }}
            onRequestClose={() => {
              this.setState({ showDeleteDeploymentModal: false });
            }}
          />
        ) : null}
        {this.state.showCancelDeploymentModal ? (
          <AlertModal
            isOpen
            title="Cancel Selected Deployments?"
            message="Are you sure you want to cancel the selected deployments?"
            extraMessage="Canceling a Coriolis Deployment is permanent!"
            onConfirmation={() => {
              this.cancelSelectedDeployments();
            }}
            onRequestClose={() => {
              this.setState({ showCancelDeploymentModal: false });
            }}
          />
        ) : null}
        {this.state.showRecreateDeploymentsModal ? (
          <AlertModal
            isOpen
            title="Recreate Selected Deployments?"
            message="Are you sure you want to recreate the selected deployments?"
            extraMessage="Deployments will be recreated using current transfer source and destination options."
            onConfirmation={() => {
              this.recreateDeployments();
            }}
            onRequestClose={() => {
              this.setState({ showRecreateDeploymentsModal: false });
            }}
          />
        ) : null}
      </Wrapper>
    );
  }
}

function DeploymentsPageWithNavigate() {
  const navigate = useNavigate();

  return <DeploymentsPage onNavigate={navigate} />;
}

export default DeploymentsPageWithNavigate;
