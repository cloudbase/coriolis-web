/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

import Button from '../../atoms/Button/Button'
import DetailsNavigation from '../../molecules/DetailsNavigation/DetailsNavigation'
import Executions from '../Executions/Executions'
import type { Endpoint } from '../../../@types/Endpoint'
import type { Execution, ExecutionTasks } from '../../../@types/Execution'
import type { Field } from '../../../@types/Field'
import StyleProps from '../../styleUtils/StyleProps'
import { MinionPoolDetails } from '../../../@types/MinionPool'
import { MinionPoolAction } from '../../../stores/MinionPoolStore'
import MinionPoolMainDetails from './MinionPoolMainDetails'
import { ReplicaItem, MigrationItem } from '../../../@types/MainItem'

const Wrapper = styled.div<any>`
  display: flex;
  justify-content: center;
`

const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  margin-top: 64px;
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
    label: 'Minion Pool',
    value: '',
  },
  {
    label: 'Executions',
    value: 'executions',
  },
]

type Props = {
  item?: MinionPoolDetails | null,
  replicas: ReplicaItem[],
  migrations: MigrationItem[]
  endpoints: Endpoint[],
  schema: Field[],
  schemaLoading: boolean,
  page: string,
  detailsLoading: boolean,
  executions: Execution[],
  executionsLoading: boolean,
  executionsTasksLoading: boolean,
  executionsTasks: ExecutionTasks[],
  onRunAction: (action: MinionPoolAction) => void,
  onExecutionChange: (executionId: string) => void,
  onCancelExecutionClick: (execution: Execution | null, force?: boolean) => void,
  onDeleteMinionPoolClick: () => void,
}
@observer
class MinionPoolDetailsContent extends React.Component<Props> {
  getStatus() {
    return this.props.item?.pool_status
  }

  isEndpointMissing() {
    const endpoint = this.props.endpoints
      .find(e => e.id === this.props.item?.endpoint_id)

    return Boolean(!endpoint)
  }

  renderBottomControls() {
    const uninitialized = this.props.item?.pool_status === 'UNINITIALIZED'
    const deallocated = this.props.item?.pool_status === 'DEALLOCATED'

    return (
      <Buttons>
        <ButtonColumn>
          <Button
            primary
            hollow
            disabled={this.isEndpointMissing() || !uninitialized}
            onClick={() => { this.props.onRunAction('set-up-shared-resources') }}
          >Setup Shared Resources
          </Button>
          <Button
            primary
            hollow
            disabled={this.isEndpointMissing() || !deallocated}
            onClick={() => { this.props.onRunAction('allocate-machines') }}
          >Allocate Machines
          </Button>
        </ButtonColumn>
        <ButtonColumn>
          <Button
            alert
            hollow
            disabled={!uninitialized}
            onClick={this.props.onDeleteMinionPoolClick}
            data-test-id="rdContent-deleteButton"
          >Delete Minion Pool
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
      <MinionPoolMainDetails
        item={this.props.item}
        replicas={this.props.replicas}
        migrations={this.props.migrations}
        schema={this.props.schema}
        schemaLoading={this.props.schemaLoading}
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
        executions={this.props.executions}
        executionsTasks={this.props.executionsTasks}
        onCancelExecutionClick={this.props.onCancelExecutionClick}
        loading={this.props.executionsLoading}
        onChange={this.props.onExecutionChange}
        tasksLoading={this.props.executionsTasksLoading}
      />
    )
  }

  render() {
    return (
      <Wrapper>
        <DetailsNavigation
          items={NavigationItems}
          selectedValue={this.props.page}
          itemId={this.props.item ? this.props.item.id : ''}
          itemType="minion-pool"
        />
        <DetailsBody>
          {this.renderMainDetails()}
          {this.renderExecutions()}
        </DetailsBody>
      </Wrapper>
    )
  }
}

export default MinionPoolDetailsContent
