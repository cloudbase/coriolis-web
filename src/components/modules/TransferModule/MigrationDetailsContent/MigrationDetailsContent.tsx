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
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Button from '../../../ui/Button/Button'
import DetailsNavigation from '../../NavigationModule/DetailsNavigation/DetailsNavigation'
import MainDetails from '../MainDetails/MainDetails'
import Tasks from '../Tasks/Tasks'
import StyleProps from '../../../styleUtils/StyleProps'

import type { Instance } from '../../../../@types/Instance'
import type { Endpoint, StorageBackend } from '../../../../@types/Endpoint'
import type { Field } from '../../../../@types/Field'
import { MigrationItemDetails } from '../../../../@types/MainItem'
import { MinionPool } from '../../../../@types/MinionPool'
import { Network } from '../../../../@types/Network'

const Wrapper = styled.div<any>`
  display: flex;
  justify-content: center;
`

const Buttons = styled.div<any>`
  margin-top: 24px;
  & > button:last-child {
    float: right;
  }
`
const DetailsBody = styled.div<any>`
  ${StyleProps.exactWidth(StyleProps.contentWidth)}
`

const NavigationItems = [
  {
    label: 'Migration',
    value: '',
  }, {
    label: 'Tasks',
    value: 'tasks',
  },
]

type Props = {
  item: MigrationItemDetails | null,
  itemId: string
  minionPools: MinionPool[]
  detailsLoading: boolean,
  storageBackends: StorageBackend[]
  instancesDetails: Instance[],
  instancesDetailsLoading: boolean,
  networks: Network[],
  sourceSchema: Field[],
  sourceSchemaLoading: boolean,
  destinationSchema: Field[],
  destinationSchemaLoading: boolean,
  endpoints: Endpoint[],
  page: string,
  onDeleteMigrationClick: () => void,
}
@observer
class MigrationDetailsContent extends React.Component<Props> {
  renderBottomControls() {
    return (
      <Buttons>
        <Button
          alert
          hollow
          onClick={this.props.onDeleteMigrationClick}
        >Delete Migration
        </Button>
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
        data-test-id="mdContent-mainDetails"
      />
    )
  }

  renderTasks() {
    if (this.props.page !== 'tasks' || !this.props.item || !this.props.item.tasks) {
      return null
    }

    return (
      <Tasks
        items={this.props.item.tasks}
        loading={this.props.detailsLoading}
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
          itemType="migration"
        />
        <DetailsBody>
          {this.renderMainDetails()}
          {this.renderTasks()}
        </DetailsBody>
      </Wrapper>
    )
  }
}

export default MigrationDetailsContent
