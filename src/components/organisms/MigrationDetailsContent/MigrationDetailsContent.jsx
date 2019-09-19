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
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Button from '../../atoms/Button'
import DetailsNavigation from '../../molecules/DetailsNavigation'
import MainDetails from '../../organisms/MainDetails'
import Tasks from '../../organisms/Tasks'
import StyleProps from '../../styleUtils/StyleProps'

import type { Instance } from '../../../types/Instance'
import type { MainItem } from '../../../types/MainItem'
import type { Endpoint } from '../../../types/Endpoint'
import type { Field } from '../../../types/Field'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`

const Buttons = styled.div`
  margin-top: 24px;
  & > button:last-child {
    float: right;
  }
`
const DetailsBody = styled.div`
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
  item: ?MainItem,
  detailsLoading: boolean,
  instancesDetails: Instance[],
  instancesDetailsLoading: boolean,
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
        >Delete Migration</Button>
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
        instancesDetails={this.props.instancesDetails}
        instancesDetailsLoading={this.props.instancesDetailsLoading}
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
        data-test-id="mdContent-tasks"
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
