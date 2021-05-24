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

import React from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'

import scheduleStore from '../../../stores/ScheduleStore'
import Button from '../../atoms/Button'
import DetailsNavigation from '../../molecules/DetailsNavigation'
import MainDetails from '../MainDetails'
import Executions from '../Executions'
import Schedule from '../Schedule'
import type { Instance } from '../../../@types/Instance'
import type { Endpoint, StorageBackend } from '../../../@types/Endpoint'
import type { Execution, ExecutionTasks } from '../../../@types/Execution'
import type { Network } from '../../../@types/Network'
import type { Field } from '../../../@types/Field'
import type { Schedule as ScheduleType } from '../../../@types/Schedule'
import StyleProps from '../../styleUtils/StyleProps'
import { ReplicaItemDetails } from '../../../@types/MainItem'
import { MinionPool } from '../../../@types/MinionPool'

const Wrapper = styled.div<any>`
  display: flex;
  justify-content: center;
`

const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`
const ButtonColumn = styled.div<any>`
  display: flex;
  flex-direction: column;
  button {
    margin-top: 16px;
    &:first-child {
      margin-top: 0;
    }
  }
`
const DetailsBody = styled.div<any>`
  ${StyleProps.exactWidth(StyleProps.contentWidth)}
`

const NavigationItems = [
  {
    label: 'Replica',
    value: '',
  }, {
    label: 'Executions',
    value: 'executions',
  }, {
    label: 'Schedule',
    value: 'schedule',
  },
]

type TimezoneValue = 'utc' | 'local'
type Props = {
  item?: ReplicaItemDetails | null,
  itemId: string
  endpoints: Endpoint[],
  sourceSchema: Field[],
  sourceSchemaLoading: boolean,
  destinationSchema: Field[],
  destinationSchemaLoading: boolean,
  networks: Network[],
  instancesDetails: Instance[],
  instancesDetailsLoading: boolean,
  scheduleStore: typeof scheduleStore,
  page: string,
  detailsLoading: boolean,
  executions: Execution[],
  executionsLoading: boolean,
  executionsTasksLoading: boolean,
  executionsTasks: ExecutionTasks[],
  minionPools: MinionPool[]
  storageBackends: StorageBackend[]
  onExecutionChange: (executionId: string) => void,
  onCancelExecutionClick: (execution: Execution | null, force?: boolean) => void,
  onDeleteExecutionClick: (execution: Execution | null) => void,
  onExecuteClick: () => void,
  onCreateMigrationClick: () => void,
  onDeleteReplicaClick: () => void,
  onAddScheduleClick: (schedule: ScheduleType) => void,
  onScheduleChange: (scheduleId: string | null, data: ScheduleType, forceSave?: boolean) => void,
  onScheduleRemove: (scheduleId: string | null) => void,
  onScheduleSave: (schedule: ScheduleType) => void,
}
type State = {
  timezone: TimezoneValue,
}
@observer
class ReplicaDetailsContent extends React.Component<Props, State> {
  state: State = {
    timezone: 'local',
  }

  getLastExecution() {
    return this.props.item && this.props.item.executions && this.props.item.executions.length
      && this.props.item.executions[this.props.item.executions.length - 1]
  }

  getStatus() {
    const lastExecution = this.getLastExecution()
    return lastExecution && lastExecution.status
  }

  isEndpointMissing() {
    const originEndpoint = this.props.endpoints
      .find(e => this.props.item && e.id === this.props.item.origin_endpoint_id)
    const targetEndpoint = this.props.endpoints
      .find(e => this.props.item && e.id === this.props.item.destination_endpoint_id)

    return Boolean(!originEndpoint || !targetEndpoint)
  }

  handleTimezoneChange(timezone: TimezoneValue) {
    this.setState({ timezone })
  }

  renderBottomControls() {
    return (
      <Buttons>
        <ButtonColumn>
          <Button
            secondary
            disabled={this.getStatus() === 'RUNNING'}
            onClick={this.props.onExecuteClick}
          >Execute Replica
          </Button>
          <Button
            primary
            disabled={this.isEndpointMissing()}
            onClick={this.props.onCreateMigrationClick}
            data-test-id="rdContent-createButton"
          >Create Migration
          </Button>
        </ButtonColumn>
        <ButtonColumn>
          <Button
            alert
            hollow
            onClick={this.props.onDeleteReplicaClick}
            data-test-id="rdContent-deleteButton"
          >Delete Replica
          </Button>
        </ButtonColumn>
      </Buttons>
    )
  }

  renderMainDetails() {
    if (this.props.page !== '') {
      return null
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
        data-test-id="rdContent-mainDetails"
      />
    )
  }

  renderExecutions() {
    if (this.props.page !== 'executions') {
      return null
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
      />
    )
  }

  renderSchedule() {
    if (this.props.page !== 'schedule') {
      return null
    }

    return (
      <Schedule
        schedules={this.props.scheduleStore.schedules}
        unsavedSchedules={this.props.scheduleStore.unsavedSchedules}
        adding={this.props.scheduleStore.adding}
        loading={this.props.scheduleStore.loading}
        onAddScheduleClick={this.props.onAddScheduleClick}
        onChange={this.props.onScheduleChange}
        onRemove={this.props.onScheduleRemove}
        onSaveSchedule={this.props.onScheduleSave}
        timezone={this.state.timezone}
        onTimezoneChange={timezone => { this.handleTimezoneChange(timezone) }}
        data-test-id="rdContent-schedule"
      />
    )
  }

  render() {
    return (
      <Wrapper>
        <DetailsNavigation
          items={NavigationItems}
          selectedValue={this.props.page}
          itemId={this.props.itemId}
          itemType="replica"
        />
        <DetailsBody>
          {this.renderMainDetails()}
          {this.renderExecutions()}
          {this.renderSchedule()}
        </DetailsBody>
      </Wrapper>
    )
  }
}

export default ReplicaDetailsContent
