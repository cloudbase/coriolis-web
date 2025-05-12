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
import { useNavigate, useParams } from "react-router";

import DetailsTemplate from "@src/components/modules/TemplateModule/DetailsTemplate";
import DetailsPageHeader from "@src/components/modules/DetailsModule/DetailsPageHeader";
import DetailsContentHeader from "@src/components/modules/DetailsModule/DetailsContentHeader";
import EndpointDetailsContent from "@src/components/modules/EndpointModule/EndpointDetailsContent";
import AlertModal from "@src/components/ui/AlertModal";
import Modal from "@src/components/ui/Modal";
import EndpointValidation from "@src/components/modules/EndpointModule/EndpointValidation";
import EndpointModal from "@src/components/modules/EndpointModule/EndpointModal";
import EndpointDuplicateOptions from "@src/components/modules/EndpointModule/EndpointDuplicateOptions";

import endpointStore from "@src/stores/EndpointStore";
import deploymentStore from "@src/stores/DeploymentStore";
import transferStore from "@src/stores/TransferStore";
import userStore from "@src/stores/UserStore";
import projectStore from "@src/stores/ProjectStore";

import type { Endpoint as EndpointType } from "@src/@types/Endpoint";

import { ThemePalette } from "@src/components/Theme";

import regionStore from "@src/stores/RegionStore";
import { DeploymentItem, TransferItem } from "@src/@types/MainItem";
import providerStore from "@src/stores/ProviderStore";
import endpointImage from "./images/endpoint.svg";

const Wrapper = styled.div<any>``;

type Props = {
  id: any;
  onNavigate: (path: string) => void;
};
type State = {
  showDeleteEndpointConfirmation: boolean;
  showValidationModal: boolean;
  showEndpointModal: boolean;
  showEndpointInUseModal: boolean;
  showEndpointInUseLoadingModal: boolean;
  endpointUsage: { transfers: TransferItem[]; deployments: DeploymentItem[] };
  showDuplicateModal: boolean;
  duplicating: boolean;
};
@observer
class EndpointDetailsPage extends React.Component<Props, State> {
  state = {
    showDeleteEndpointConfirmation: false,
    showValidationModal: false,
    showEndpointModal: false,
    showEndpointInUseModal: false,
    showEndpointInUseLoadingModal: false,
    showDuplicateModal: false,
    duplicating: false,
    endpointUsage: { transfers: [], deployments: [] },
  };

  componentDidMount() {
    document.title = "Endpoint Details";

    this.loadData();
  }

  componentWillUnmount() {
    endpointStore.clearConnectionInfo();
  }

  get endpoint(): EndpointType | null {
    return endpointStore.endpoints.find(e => e.id === this.props.id) || null;
  }

  getEndpointUsage(): {
    deployments: DeploymentItem[];
    transfers: TransferItem[];
  } {
    const endpointId = this.props.id;
    const transfers = transferStore.transfers.filter(
      r =>
        r.origin_endpoint_id === endpointId ||
        r.destination_endpoint_id === endpointId,
    );
    const deployments = deploymentStore.deployments.filter(
      r =>
        r.origin_endpoint_id === endpointId ||
        r.destination_endpoint_id === endpointId,
    );

    return { deployments, transfers: transfers };
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case "signout":
        userStore.logout();
        break;
      default:
    }
  }

  async handleDeleteEndpointClick() {
    this.setState({ showEndpointInUseLoadingModal: true });

    await Promise.all([
      transferStore.getTransfers(),
      deploymentStore.getDeployments(),
    ]);
    const endpointUsage = this.getEndpointUsage();

    if (
      endpointUsage.deployments.length === 0 &&
      endpointUsage.transfers.length === 0
    ) {
      this.setState({
        showDeleteEndpointConfirmation: true,
        showEndpointInUseLoadingModal: false,
      });
    } else {
      this.setState({
        showEndpointInUseModal: true,
        showEndpointInUseLoadingModal: false,
      });
    }
  }

  handleDeleteEndpointConfirmation() {
    this.setState({ showDeleteEndpointConfirmation: false });
    if (this.endpoint) {
      endpointStore.delete(this.endpoint);
    }
    this.props.onNavigate("/endpoints");
  }

  handleCloseDeleteEndpointConfirmation() {
    this.setState({ showDeleteEndpointConfirmation: false });
  }

  handleValidateClick() {
    if (this.endpoint) {
      endpointStore.validate(this.endpoint);
    }
    this.setState({ showValidationModal: true });
  }

  handleRetryValidation() {
    if (this.endpoint) {
      endpointStore.validate(this.endpoint);
    }
  }

  handleCloseValidationModal() {
    endpointStore.clearValidation();
    this.setState({ showValidationModal: false });
  }

  handleEditClick() {
    this.setState({ showEndpointModal: true });
  }

  handleCloseEndpointModal() {
    this.setState({ showEndpointModal: false });
    if (this.endpoint) {
      providerStore.getConnectionInfoSchema(this.endpoint.type);
    }
  }

  handleCloseEndpointInUseModal() {
    this.setState({ showEndpointInUseModal: false });
  }

  handleDuplicateClick() {
    this.setState({ showDuplicateModal: true });
  }

  async handleDuplicate(projectId: string) {
    const endpoint = this.endpoint;
    if (!endpoint) {
      return;
    }

    this.setState({ duplicating: true });

    const shouldSwitchProject =
      projectId !==
      (userStore.loggedUser ? userStore.loggedUser.project.id : "");

    await endpointStore.duplicate({
      shouldSwitchProject,
      endpoints: [endpoint],
      onSwitchProject: () => userStore.switchProject(projectId),
    });
    this.props.onNavigate("/endpoints");
  }

  handleExportToJsonClick() {
    if (!this.endpoint) {
      return;
    }
    endpointStore.exportToJson(this.endpoint);
  }

  async loadData() {
    projectStore.getProjects();

    this.loadEndpoints();

    await Promise.all([
      transferStore.getTransfers(),
      deploymentStore.getDeployments(),
      regionStore.getRegions(),
    ]);
    this.setState({ endpointUsage: this.getEndpointUsage() });
  }

  async loadEndpoints() {
    await endpointStore.getEndpoints();
    const endpoint = this.endpoint;

    if (endpoint?.type) {
      providerStore.getConnectionInfoSchema(endpoint.type);
    }

    if (endpoint?.connection_info?.secret_ref) {
      endpointStore.getConnectionInfo(endpoint);
    } else if (endpoint?.connection_info) {
      endpointStore.setConnectionInfo(endpoint.connection_info);
    }
  }

  render() {
    const selectedProjectId = userStore.loggedUser
      ? userStore.loggedUser.project.id
      : "";

    const endpoint = this.endpoint;
    const dropdownActions = [
      {
        label: "Validate",
        color: ThemePalette.primary,
        action: () => {
          this.handleValidateClick();
        },
      },
      {
        label: "Edit",
        action: () => {
          this.handleEditClick();
        },
      },
      {
        label: "Duplicate",
        action: () => {
          this.handleDuplicateClick();
        },
      },
      {
        label: "Download .endpoint file",
        action: () => {
          this.handleExportToJsonClick();
        },
      },
      {
        label: "Delete Endpoint",
        color: ThemePalette.alert,
        action: () => {
          this.handleDeleteEndpointClick();
        },
      },
    ];
    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={
            <DetailsPageHeader
              user={userStore.loggedUser}
              onUserItemClick={item => {
                this.handleUserItemClick(item);
              }}
            />
          }
          contentHeaderComponent={
            <DetailsContentHeader
              itemTitle={endpoint?.name}
              itemType="endpoint"
              itemDescription={endpoint?.description}
              backLink="/endpoints"
              dropdownActions={dropdownActions}
              typeImage={endpointImage}
            />
          }
          contentComponent={
            <EndpointDetailsContent
              item={endpoint}
              regions={regionStore.regions}
              transfers={this.state.endpointUsage.transfers}
              loading={
                endpointStore.connectionInfoLoading ||
                endpointStore.loading ||
                providerStore.connectionSchemaLoading
              }
              connectionInfo={endpointStore.connectionInfo}
              connectionInfoSchema={providerStore.connectionInfoSchema}
              onDeleteClick={() => {
                this.handleDeleteEndpointClick();
              }}
              onValidateClick={() => {
                this.handleValidateClick();
              }}
            />
          }
        />
        <AlertModal
          isOpen={this.state.showDeleteEndpointConfirmation}
          title="Delete Endpoint?"
          message="Are you sure you want to delete this endpoint?"
          extraMessage="Deleting a Coriolis Endpoint is permanent!"
          onConfirmation={() => {
            this.handleDeleteEndpointConfirmation();
          }}
          onRequestClose={() => {
            this.handleCloseDeleteEndpointConfirmation();
          }}
        />
        <AlertModal
          type="error"
          isOpen={this.state.showEndpointInUseModal}
          title="Endpoint is in use"
          message="The endpoint can't be deleted because it is in use by transfers or deployments."
          extraMessage="You must first delete the transfer or deployment which uses this endpoint."
          onRequestClose={() => {
            this.handleCloseEndpointInUseModal();
          }}
        />
        <AlertModal
          type="loading"
          isOpen={this.state.showEndpointInUseLoadingModal}
          title="Checking enpoint usage"
        />
        <Modal
          isOpen={this.state.showValidationModal}
          title="Validate Endpoint"
          onRequestClose={() => {
            this.handleCloseValidationModal();
          }}
        >
          <EndpointValidation
            validation={endpointStore.validation}
            loading={endpointStore.validating}
            onCancelClick={() => {
              this.handleCloseValidationModal();
            }}
            onRetryClick={() => {
              this.handleRetryValidation();
            }}
          />
        </Modal>
        <Modal
          isOpen={this.state.showEndpointModal}
          title="Edit Endpoint"
          onRequestClose={() => {
            this.handleCloseEndpointModal();
          }}
        >
          <EndpointModal
            endpoint={this.endpoint}
            onCancelClick={() => {
              this.handleCloseEndpointModal();
            }}
          />
        </Modal>
        {this.state.showDuplicateModal ? (
          <Modal
            isOpen
            title="Duplicate Endpoint"
            onRequestClose={() => {
              this.setState({ showDuplicateModal: false });
            }}
          >
            <EndpointDuplicateOptions
              duplicating={this.state.duplicating}
              projects={projectStore.projects}
              selectedProjectId={selectedProjectId}
              onCancelClick={() => {
                this.setState({ showDuplicateModal: false });
              }}
              onDuplicateClick={projectId => {
                this.handleDuplicate(projectId);
              }}
            />
          </Modal>
        ) : null}
      </Wrapper>
    );
  }
}

function EndpointDetailsPageWithNavigate() {
  const navigate = useNavigate();
  const { id } = useParams();

  return <EndpointDetailsPage onNavigate={navigate} id={id!} />;
}

export default EndpointDetailsPageWithNavigate;
