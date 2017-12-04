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
import PropTypes from 'prop-types'

import { DetailsNavigation, MainDetails, Button, Tasks } from 'components'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`

const Buttons = styled.div`
  & > button:last-child {
    float: right;
  }
`
const DetailsBody = styled.div`
  min-width: 800px;
  max-width: 800px;
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

class MigrationDetailsContent extends React.Component {
  static propTypes = {
    item: PropTypes.object,
    detailsLoading: PropTypes.bool,
    endpoints: PropTypes.array,
    page: PropTypes.string,
    onDeleteMigrationClick: PropTypes.func,
  }

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
        endpoints={this.props.endpoints}
        bottomControls={this.renderBottomControls()}
        loading={this.props.detailsLoading}
      />
    )
  }

  renderTasks() {
    if (this.props.page !== 'tasks' || !this.props.item.tasks) {
      return null
    }

    return (
      <Tasks
        items={this.props.item.tasks}
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
