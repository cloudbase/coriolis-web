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

// @flow

import React from 'react'
import styled from 'styled-components'

import Button from '../../atoms/Button'
import DetailsNavigation from '../../molecules/DetailsNavigation'
import MainDetails from '../../organisms/MainDetails'
import Executions from '../../organisms/Executions'
import Schedule from '../../organisms/Schedule'
import type { MainItem } from '../../../types/MainItem'
import type { Endpoint } from '../../../types/Endpoint'
import type { Execution } from '../../../types/Execution'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`

const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
`
const LeftButtons = styled.div``
const RightButtons = styled.div`
  display: flex;
  button {
    margin-right: 16px;

    &:last-child {
      margin-right: 0;
    }
  }
`
const DetailsBody = styled.div`
  min-width: 800px;
  max-width: 800px;
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
  item: MainItem,
  endpoints: Endpoint[],
  scheduleStore: any,
  page: string,
  detailsLoading: boolean,
  onCancelExecutionClick: (execution: ?Execution) => void,
  onDeleteExecutionClick: (execution: ?Execution) => void,
  onExecuteClick: () => void,
  onCreateMigrationClick: () => void,
  onDeleteReplicaClick: () => void,
  onDeleteReplicaDisksClick: () => void,
  onAddScheduleClick: () => void,
  onScheduleChange: () => void,
  onScheduleRemove: () => void,
}
type State = {
  timezone: TimezoneValue,
}
class ReplicaDetailsContent extends React.Component<Props, State> {
  constructor() {
    super()

    this.state = {
      timezone: 'local',
    }
  }

  getLastExecution() {
    return this.props.item.executions && this.props.item.executions.length
      && this.props.item.executions[this.props.item.executions.length - 1]
  }

  getStatus() {
    let lastExecution = this.getLastExecution()
    return lastExecution && lastExecution.status
  }

  isEndpointMissing() {
    let originEndpoint = this.props.endpoints.find(e => e.id === this.props.item.origin_endpoint_id)
    let targetEndpoint = this.props.endpoints.find(e => e.id === this.props.item.destination_endpoint_id)

    return Boolean(!originEndpoint || !targetEndpoint)
  }

  handleTimezoneChange(timezone: TimezoneValue) {
    this.setState({ timezone })
  }

  renderBottomControls() {
    return (
      <Buttons>
        <LeftButtons>
          <Button
            primary
            disabled={this.getStatus() !== 'COMPLETED' || this.isEndpointMissing()}
            onClick={this.props.onCreateMigrationClick}
          >Create Migration</Button>
        </LeftButtons>
        <RightButtons>
          <Button
            alert
            hollow
            secondary
            onClick={this.props.onDeleteReplicaDisksClick}
            disabled={!this.props.item.executions || this.props.item.executions.length === 0}
          >Delete Replica Disks</Button>
          <Button
            alert
            hollow
            onClick={this.props.onDeleteReplicaClick}
          >Delete Replica</Button>
        </RightButtons>
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
        loading={this.props.detailsLoading}
        endpoints={this.props.endpoints}
        bottomControls={this.renderBottomControls()}
      />
    )
  }

  renderExecutions() {
    if (this.props.page !== 'executions') {
      return null
    }

    return (
      <Executions
        item={this.props.item}
        onCancelExecutionClick={this.props.onCancelExecutionClick}
        onDeleteExecutionClick={this.props.onDeleteExecutionClick}
        onExecuteClick={this.props.onExecuteClick}
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
        adding={this.props.scheduleStore.adding}
        loading={this.props.scheduleStore.loading}
        onAddScheduleClick={this.props.onAddScheduleClick}
        onChange={this.props.onScheduleChange}
        onRemove={this.props.onScheduleRemove}
        timezone={this.state.timezone}
        onTimezoneChange={timezone => { this.handleTimezoneChange(timezone) }}
      />
    )
  }

  render() {
    return (
      <Wrapper>
        <DetailsNavigation
          items={NavigationItems}
          selectedValue={this.props.page}
          itemId={this.props.item.id}
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
