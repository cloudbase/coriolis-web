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

import { DeploymentItemDetails } from "@src/@types/MainItem";
import { MinionPool } from "@src/@types/MinionPool";
import { Network } from "@src/@types/Network";
import DetailsNavigation from "@src/components/modules/NavigationModule/DetailsNavigation";
import MainDetails from "@src/components/modules/TransferModule/MainDetails";
import Tasks from "@src/components/modules/TransferModule/Tasks";
import { ThemePalette } from "@src/components/Theme";
import { ThemeProps } from "@src/components/Theme";
import Button from "@src/components/ui/Button";

import type { Instance } from "@src/@types/Instance";
import type { Endpoint, StorageBackend } from "@src/@types/Endpoint";
import type { Field } from "@src/@types/Field";

import show_execution from "./images/show_execution.svg";

const Wrapper = styled.div<any>`
  display: flex;
  justify-content: center;
`;

const Buttons = styled.div<any>`
  margin-top: 24px;
  & > button:last-child {
    float: right;
  }
`;
const DetailsBody = styled.div<any>`
  ${ThemeProps.exactWidth(ThemeProps.contentWidth)}
`;

const ShowExecution = styled.div<any>`
  width: 96px;
  height: 96px;
  background: url("${show_execution}");
  margin: 106px 0 43px 0;
`;

const PendingMessage = styled.div`
  background: ${ThemePalette.grayscale[7]};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 74px;
`;

const NoPendingDeploymentTitle = styled.div<any>`
  font-size: 18px;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.div<any>`
  font-size: 18px;
  margin-bottom: 10px;
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

const NavigationItems = [
  {
    label: "Deployment",
    value: "",
  },
  {
    label: "Tasks",
    value: "tasks",
  },
];

type Props = {
  item: DeploymentItemDetails | null;
  itemId: string;
  minionPools: MinionPool[];
  detailsLoading: boolean;
  storageBackends: StorageBackend[];
  instancesDetails: Instance[];
  instancesDetailsLoading: boolean;
  networks: Network[];
  sourceSchema: Field[];
  sourceSchemaLoading: boolean;
  destinationSchema: Field[];
  destinationSchemaLoading: boolean;
  endpoints: Endpoint[];
  page: string;
  onDeleteDeploymentClick: () => void;
  onShowExecutionClick: () => void;
};
@observer
class DeploymentDetailsContent extends React.Component<Props> {
  renderBottomControls() {
    return (
      <Buttons>
        <Button alert hollow onClick={this.props.onDeleteDeploymentClick}>
          Delete Deployment
        </Button>
      </Buttons>
    );
  }

  renderMainDetails() {
    if (this.props.page !== "") {
      return null;
    }

    return (
      <MainDetails
        item={this.props.item}
        storageBackends={this.props.storageBackends}
        minionPools={this.props.minionPools}
        instancesDetails={this.props.instancesDetails}
        instancesDetailsLoading={this.props.instancesDetailsLoading}
        networks={this.props.networks}
        sourceSchema={this.props.sourceSchema}
        sourceSchemaLoading={this.props.sourceSchemaLoading}
        destinationSchema={this.props.destinationSchema}
        destinationSchemaLoading={this.props.destinationSchemaLoading}
        endpoints={this.props.endpoints}
        bottomControls={this.renderBottomControls()}
        loading={this.props.detailsLoading}
      />
    );
  }

  renderTasks() {
    if (this.props.page !== "tasks" || !this.props.item?.tasks) {
      return null;
    }

    return (
      <Tasks
        items={this.props.item.tasks}
        loading={this.props.detailsLoading}
        instancesDetails={this.props.instancesDetails}
      />
    );
  }

  renderPendingMessage() {
    const { item } = this.props;
    if (!item) {
      return null;
    }

    if (item.last_execution_status === "PENDING") {
      return (
        <PendingMessage>
          <ShowExecution />
          <NoPendingDeploymentTitle>
            Current deployment is waiting for its deployer execution to finish.
          </NoPendingDeploymentTitle>
          <StyledButton onClick={this.props.onShowExecutionClick}>
            Show Execution
          </StyledButton>
        </PendingMessage>
      );
    }

    if (item.last_execution_status === "ERROR") {
      return (
        <PendingMessage>
          <ShowExecution />
          <ErrorMessage>
            The deployer execution was not able to complete.
          </ErrorMessage>
          <StyledButton onClick={this.props.onShowExecutionClick}>
            Show Execution
          </StyledButton>
        </PendingMessage>
      );
    }

    return null;
  }

  render() {
    return (
      <Wrapper>
        <DetailsNavigation
          items={NavigationItems}
          selectedValue={this.props.page}
          itemId={this.props.itemId}
          itemType="deployment"
        />
        <DetailsBody>
          {this.renderMainDetails()}
          {this.renderTasks()}
          {this.props.page === "tasks" && !this.props.item?.tasks
            ? this.renderPendingMessage()
            : null}
        </DetailsBody>
      </Wrapper>
    );
  }
}

export default DeploymentDetailsContent;
