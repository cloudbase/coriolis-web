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

import { TransferItemDetails } from "@src/@types/MainItem";
import { MinionPool } from "@src/@types/MinionPool";
import DetailsNavigation from "@src/components/modules/NavigationModule/DetailsNavigation";
import Executions from "@src/components/modules/TransferModule/Executions";
import MainDetails from "@src/components/modules/TransferModule/MainDetails";
import Schedule from "@src/components/modules/TransferModule/Schedule";
import { ThemeProps } from "@src/components/Theme";
import Button from "@src/components/ui/Button";
import scheduleStore from "@src/stores/ScheduleStore";
import configLoader from "@src/utils/Config";

import type { Instance } from "@src/@types/Instance";
import type { Endpoint, StorageBackend } from "@src/@types/Endpoint";
import type { Execution, ExecutionTasks } from "@src/@types/Execution";
import type { Network } from "@src/@types/Network";
import type { Field } from "@src/@types/Field";
import type { Schedule as ScheduleType } from "@src/@types/Schedule";
const Wrapper = styled.div<any>`
  display: flex;
  justify-content: center;
`;

const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;
const ButtonColumn = styled.div<any>`
  display: flex;
  flex-direction: column;
  button {
    margin-top: 16px;
    &:first-child {
      margin-top: 0;
    }
  }
`;
const DetailsBody = styled.div<any>`
  ${ThemeProps.exactWidth(ThemeProps.contentWidth)}
`;

const NavigationItems = [
  {
    label: "Transfer",
    value: "",
  },
  {
    label: "Executions",
    value: "executions",
  },
  {
    label: "Schedule",
    value: "schedule",
  },
];

type TimezoneValue = "utc" | "local";
type Props = {
  item?: TransferItemDetails | null;
  itemId: string;
  endpoints: Endpoint[];
  sourceSchema: Field[];
  sourceSchemaLoading: boolean;
  destinationSchema: Field[];
  destinationSchemaLoading: boolean;
  networks: Network[];
  instancesDetails: Instance[];
  instancesDetailsLoading: boolean;
  scheduleStore: typeof scheduleStore;
  page: string;
  detailsLoading: boolean;
  executions: Execution[];
  executionsLoading: boolean;
  executionsTasksLoading: boolean;
  executionsTasks: ExecutionTasks[];
  minionPools: MinionPool[];
  storageBackends: StorageBackend[];
  onExecutionChange: (executionId: string) => void;
  onCancelExecutionClick: (
    execution: Execution | null,
    force?: boolean,
  ) => void;
  onDeleteExecutionClick: (execution: Execution | null) => void;
  onExecuteClick: () => void;
  onCreateDeploymentClick: () => void;
  onDeleteTransferClick: () => void;
  onAddScheduleClick: (schedule: ScheduleType) => void;
  onScheduleChange: (
    scheduleId: string | null,
    data: ScheduleType,
    forceSave?: boolean,
  ) => void;
  onScheduleRemove: (scheduleId: string | null) => void;
  onScheduleSave: (schedule: ScheduleType) => void;
};
type State = {
  timezone: TimezoneValue;
};
@observer
class TransferDetailsContent extends React.Component<Props, State> {
  state: State = {
    timezone: "local",
  };

  getLastExecution() {
    return this.props.item?.executions?.length
      ? this.props.item.executions[this.props.item.executions.length - 1]
      : null;
  }

  getStatus() {
    return this.getLastExecution()?.status;
  }

  isEndpointMissing() {
    return (
      this.props.endpoints.filter(
        e =>
          e.id === this.props.item?.origin_endpoint_id ||
          e.id === this.props.item?.destination_endpoint_id,
      ).length < 2
    );
  }

  handleTimezoneChange(timezone: TimezoneValue) {
    this.setState({ timezone });
  }

  renderBottomControls() {
    return (
      <Buttons>
        <ButtonColumn>
          <Button
            secondary
            disabled={this.getStatus() === "RUNNING"}
            onClick={this.props.onExecuteClick}
          >
            Execute
          </Button>
          <Button
            primary
            disabled={this.isEndpointMissing()}
            onClick={this.props.onCreateDeploymentClick}
          >
            Deploy
          </Button>
        </ButtonColumn>
        <ButtonColumn>
          <Button alert hollow onClick={this.props.onDeleteTransferClick}>
            Delete
          </Button>
        </ButtonColumn>
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
        sourceSchema={this.props.sourceSchema}
        sourceSchemaLoading={this.props.sourceSchemaLoading}
        destinationSchema={this.props.destinationSchema}
        destinationSchemaLoading={this.props.destinationSchemaLoading}
        instancesDetails={this.props.instancesDetails}
        instancesDetailsLoading={this.props.instancesDetailsLoading}
        loading={this.props.detailsLoading}
        endpoints={this.props.endpoints}
        networks={this.props.networks}
        bottomControls={this.renderBottomControls()}
      />
    );
  }

  renderExecutions() {
    if (this.props.page !== "executions") {
      return null;
    }

    return (
      <Executions
        executions={this.props.executions}
        executionsTasks={this.props.executionsTasks}
        onCancelExecutionClick={this.props.onCancelExecutionClick}
        onDeleteExecutionClick={this.props.onDeleteExecutionClick}
        onExecuteClick={this.props.onExecuteClick}
        loading={this.props.executionsLoading || this.props.detailsLoading}
        onChange={this.props.onExecutionChange}
        tasksLoading={this.props.executionsTasksLoading}
        instancesDetails={this.props.instancesDetails}
      />
    );
  }

  renderSchedule() {
    if (this.props.page !== "schedule") {
      return null;
    }

    return (
      <Schedule
        disableExecutionOptions={configLoader.config.providersDisabledExecuteOptions.some(
          p =>
            p ===
            this.props.endpoints.find(
              e => e.id === this.props.item?.origin_endpoint_id,
            )?.type,
        )}
        schedules={this.props.scheduleStore.schedules}
        unsavedSchedules={this.props.scheduleStore.unsavedSchedules}
        adding={this.props.scheduleStore.adding}
        loading={this.props.scheduleStore.loading}
        onAddScheduleClick={this.props.onAddScheduleClick}
        onChange={this.props.onScheduleChange}
        onRemove={this.props.onScheduleRemove}
        onSaveSchedule={this.props.onScheduleSave}
        timezone={this.state.timezone}
        onTimezoneChange={timezone => {
          this.handleTimezoneChange(timezone);
        }}
        savingIds={this.props.scheduleStore.savingIds}
        enablingIds={this.props.scheduleStore.enablingIds}
        deletingIds={this.props.scheduleStore.deletingIds}
      />
    );
  }

  render() {
    return (
      <Wrapper>
        <DetailsNavigation
          items={NavigationItems}
          selectedValue={this.props.page}
          itemId={this.props.itemId}
          itemType="transfer"
        />
        <DetailsBody>
          {this.renderMainDetails()}
          {this.renderExecutions()}
          {this.renderSchedule()}
        </DetailsBody>
      </Wrapper>
    );
  }
}

export default TransferDetailsContent;
