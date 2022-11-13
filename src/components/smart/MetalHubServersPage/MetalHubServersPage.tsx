/*
Copyright (C) 2022  Cloudbase Solutions SRL
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

import MainTemplate from "@src/components/modules/TemplateModule/MainTemplate";
import Navigation from "@src/components/modules/NavigationModule/Navigation";
import FilterList from "@src/components/ui/Lists/FilterList";
import PageHeader from "@src/components/smart/PageHeader";
import configLoader from "@src/utils/Config";
import metalHubStore from "@src/stores/MetalHubStore";
import { MetalHubServer } from "@src/@types/MetalHub";
import MetalHubServerListItem from "@src/components/modules/MetalHubModule/MetalHubListItem";

import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import MetalHubListHeader from "@src/components/modules/MetalHubModule/MetalHubListHeader";
import projectStore from "@src/stores/ProjectStore";
import MetalHubModal from "@src/components/modules/MetalHubModule/MetalHubModal";
import emptyListImage from "./images/server.svg";
import type { DropdownAction } from "@src/components/ui/Dropdowns/ActionDropdown";
import AlertModal from "@src/components/ui/AlertModal";
import { ThemePalette } from "@src/components/Theme";
import instanceSource from "@src/sources/InstanceSource";
import instanceStore from "@src/stores/InstanceStore";
import notificationStore from "@src/stores/NotificationStore";
import { WizardData } from "@src/@types/WizardData";
import { wizardPages } from "@src/constants";

const Wrapper = styled.div``;
const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: center;
`;
const ErrorMessage = styled.div`
  margin-top: 24px;
  text-align: center;
  max-width: 600px;
`;

type State = {
  modalIsOpen: boolean;
  showNewServerModal: boolean;
  selectedServers: number[];
  showConfirmRemove: boolean;
};
@observer
class MetalHubServersPage extends React.Component<{ history: any }, State> {
  state: State = {
    modalIsOpen: false,
    showNewServerModal: false,
    selectedServers: [],
    showConfirmRemove: false,
  };

  pollTimeout = 0;

  stopPolling = false;

  componentDidMount() {
    document.title = "Bare Metal Servers";

    metalHubStore.loadFingerprint();
    projectStore.getProjects();

    this.stopPolling = false;
    this.pollData(true);
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout);
    this.stopPolling = true;
  }

  handleModalOpen() {
    this.setState({ modalIsOpen: true });
  }

  handleModalClose() {
    this.setState({ modalIsOpen: false }, () => {
      this.pollData();
    });
  }

  handleReloadButtonClick() {
    metalHubStore.loadFingerprint();
    metalHubStore.getServers({ showLoading: true });
  }

  handleEmptyListButtonClick() {
    this.setState({ showNewServerModal: true, modalIsOpen: true });
  }

  async handleNewServer(endpoint: string) {
    await metalHubStore.addServer(endpoint);
    this.setState({ showNewServerModal: false, modalIsOpen: false });
    await metalHubStore.getServers();
  }

  handleRemoveAction() {
    this.setState({ showConfirmRemove: true });
  }

  handleProjectChange() {
    metalHubStore.getServers({ showLoading: true });
  }

  async removeSelectedServers() {
    this.setState({ showConfirmRemove: false });
    await Promise.all(
      this.state.selectedServers.map(async serverId => {
        await metalHubStore.deleteServer(serverId);
      })
    );
    metalHubStore.getServers({ showLoading: true });
  }

  async refreshServers() {
    await Promise.all(
      this.state.selectedServers.map(async serverId => {
        await metalHubStore.refreshServer(serverId);
      })
    );
    metalHubStore.getServers({ showLoading: true });
  }

  async create(type: "replica" | "migration") {
    notificationStore.alert(`Preparing ${type}...`, "info");
    const { selectedServers } = this.state;
    const endpoint = await metalHubStore.getMetalHubEndpoint();

    // Remove the instances from cache so that the wizard has the latest data before it's shown
    instanceSource.removeInstancesFromCache(endpoint.id);
    await instanceStore.loadInstancesInChunks({
      endpoint,
      vmsPerPage: Infinity,
    });
    // find all the selected servers in the background instances
    const instances = instanceStore.backgroundInstances.filter(
      i => selectedServers.map(s => String(s)).indexOf(i.id) > -1
    );
    if (instances.length !== selectedServers.length) {
      notificationStore.alert(
        `Could not find all instances on endpoint '${endpoint.name}'`,
        "error"
      );
      throw new Error("Instances not found");
    }
    const data: WizardData = {
      source: endpoint,
      selectedInstances: instances,
    };
    this.props.history.push(
      `/wizard/${type}/?d=${window.btoa(
        JSON.stringify({
          data,
          currentPage: wizardPages.find(p => p.id === "target"),
        })
      )}`
    );
  }

  async pollData(showLoading?: boolean) {
    if (this.state.modalIsOpen || this.stopPolling) {
      return;
    }

    await metalHubStore.getServers({ showLoading, skipLog: true });
    this.pollTimeout = window.setTimeout(() => {
      this.pollData();
    }, configLoader.config.requestPollTimeout);
  }

  itemFilterFunction(
    item: MetalHubServer,
    status?: string | null,
    filterText?: string
  ): boolean {
    const usabledFilterText = filterText?.toLowerCase() || "";

    const searchableFields: Array<keyof MetalHubServer> = [
      "hostname",
      "api_endpoint",
    ];
    const filterCount = searchableFields.reduce((acc, key) => {
      if (!(item[key] as string)?.toLowerCase().includes(usabledFilterText)) {
        return acc + 1;
      }
      return acc;
    }, 0);
    let statusFilter = true;
    if (status !== "all") {
      statusFilter = status === "active" ? item.active : !item.active;
    }
    return statusFilter && filterCount < searchableFields.length;
  }

  renderEmptyListComponent() {
    return metalHubStore.loadingServersError ? (
      <ErrorWrapper>
        <StatusImage status="ERROR" />
        <ErrorMessage>
          Request failed with:
          <br />
          {metalHubStore.loadingServersError}
        </ErrorMessage>
      </ErrorWrapper>
    ) : null;
  }

  render() {
    const selectedServers = metalHubStore.servers.filter(s =>
      this.state.selectedServers.includes(s.id)
    );
    const bulkActions: DropdownAction[] = [
      {
        label: "Create Replica",
        color: ThemePalette.primary,
        disabled: !selectedServers.every(s => s.active),
        action: () => {
          this.create("replica");
        },
      },
      {
        label: "Create Migration",
        color: ThemePalette.primary,
        disabled: !selectedServers.every(s => s.active),
        action: () => {
          this.create("migration");
        },
      },
      {
        label: "Refresh Servers",
        action: () => {
          this.refreshServers();
        },
      },
      {
        label: "Remove Servers",
        color: ThemePalette.alert,
        action: () => {
          this.handleRemoveAction();
        },
      },
    ];

    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="bare-metal-servers" />}
          listComponent={
            <FilterList
              filterItems={[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              dropdownActions={bulkActions}
              selectionLabel="server"
              loading={metalHubStore.loadingServers}
              items={metalHubStore.servers}
              onSelectedItemsChange={selectedServers => {
                this.setState({
                  selectedServers: selectedServers.map(s => s.id),
                });
              }}
              listHeaderComponent={
                <MetalHubListHeader
                  visible={this.state.selectedServers.length === 0}
                  fingerprint={metalHubStore.fingerprint}
                  error={metalHubStore.loadingFingerprintError}
                  hideButton={metalHubStore.servers.length === 0}
                  onCreateClick={() => {
                    this.setState({
                      showNewServerModal: true,
                      modalIsOpen: true,
                    });
                  }}
                />
              }
              onItemClick={(server: MetalHubServer) => {
                this.props.history.push(`/bare-metal-servers/${server.id}`);
              }}
              onReloadButtonClick={() => {
                this.handleReloadButtonClick();
              }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              renderItemComponent={props => (
                <MetalHubServerListItem {...props} />
              )}
              emptyListImage={emptyListImage}
              emptyListComponent={this.renderEmptyListComponent()}
              emptyListMessage="It seems like you don't have any Bare Metal servers in this Hub."
              emptyListExtraMessage="A Bare Metal server is a virtual machine that is connected to your Coriolis Bare Metal Hub endpoint."
              emptyListButtonLabel="Add a Bare Metal server"
              onEmptyListButtonClick={() => {
                this.handleEmptyListButtonClick();
              }}
            />
          }
          headerComponent={
            <PageHeader
              title="Coriolis Bare Metal Servers"
              onModalOpen={() => {
                this.handleModalOpen();
              }}
              onModalClose={() => {
                this.handleModalClose();
              }}
              onProjectChange={() => {
                this.handleProjectChange();
              }}
            />
          }
        />
        {this.state.showNewServerModal ? (
          <MetalHubModal
            loading={metalHubStore.loadingNewServer}
            onAddClick={e => {
              this.handleNewServer(e);
            }}
            onRequestClose={() => {
              this.setState({ showNewServerModal: false, modalIsOpen: false });
            }}
          />
        ) : null}
        {this.state.showConfirmRemove ? (
          <AlertModal
            isOpen
            title="Remove Selected Bare Metal Servers?"
            message="Are you sure you want to remove the selected Coriolis Bare Metal Servers?"
            extraMessage="&nbsp;"
            onConfirmation={() => {
              this.removeSelectedServers();
            }}
            onRequestClose={() => {
              this.setState({ showConfirmRemove: false });
            }}
          />
        ) : null}
      </Wrapper>
    );
  }
}

export default MetalHubServersPage;
