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
import { observer } from 'mobx-react'

import DetailsTemplate from '../../templates/DetailsTemplate'
import DetailsPageHeader from '../../organisms/DetailsPageHeader'
import DetailsContentHeader from '../../organisms/DetailsContentHeader'
import MigrationDetailsContent from '../../organisms/MigrationDetailsContent'
import AlertModal from '../../organisms/AlertModal'

import migrationStore from '../../../stores/MigrationStore'
import userStore from '../../../stores/UserStore'
import endpointStore from '../../../stores/EndpointStore'
import notificationStore from '../../../stores/NotificationStore'
import { requestPollTimeout } from '../../../config'

import migrationImage from './images/migration.svg'

const Wrapper = styled.div``

type Props = {
  match: any,
}
type State = {
  showDeleteMigrationConfirmation: boolean,
  showCancelConfirmation: boolean,
}
@observer
class MigrationDetailsPage extends React.Component<Props, State> {
  state = {
    showDeleteMigrationConfirmation: false,
    showCancelConfirmation: false,
  }

  pollInterval: IntervalID

  componentDidMount() {
    document.title = 'Migration Details'

    endpointStore.getEndpoints()
    this.pollData(true)
    this.pollInterval = setInterval(() => { this.pollData() }, requestPollTimeout)
  }

  componentWillReceiveProps(newProps: any) {
    if (newProps.match.params.id !== this.props.match.params.id) {
      migrationStore.getMigration(newProps.match.params.id, true)
    }
  }

  componentWillUnmount() {
    migrationStore.clearDetails()
    clearInterval(this.pollInterval)
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case 'signout':
        userStore.logout()
        return
      case 'profile':
        window.location.href = '/#/profile'
        break
      default:
    }
  }

  handleBackButtonClick() {
    window.location.href = '/#/migrations'
  }

  handleDeleteMigrationClick() {
    this.setState({ showDeleteMigrationConfirmation: true })
  }

  handleDeleteMigrationConfirmation() {
    this.setState({ showDeleteMigrationConfirmation: false })
    window.location.href = '/#/migrations'
    if (migrationStore.migrationDetails) {
      migrationStore.delete(migrationStore.migrationDetails.id)
    }
  }

  handleCloseDeleteMigrationConfirmation() {
    this.setState({ showDeleteMigrationConfirmation: false })
  }

  handleCancelMigrationClick() {
    this.setState({ showCancelConfirmation: true })
  }

  handleCloseCancelConfirmation() {
    this.setState({ showCancelConfirmation: false })
  }

  handleCancelConfirmation() {
    this.setState({ showCancelConfirmation: false })
    if (!migrationStore.migrationDetails) {
      return
    }
    migrationStore.cancel(migrationStore.migrationDetails.id).then(() => {
      if (migrationStore.canceling === false) {
        notificationStore.alert('Canceled', 'success')
      } else {
        notificationStore.alert('The migration couldn\'t be canceled', 'error')
      }
    })
  }

  pollData(showLoading?: boolean) {
    migrationStore.getMigration(this.props.match.params.id, showLoading || false)
  }

  render() {
    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={userStore.loggedUser}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={migrationStore.migrationDetails}
            onBackButonClick={() => { this.handleBackButtonClick() }}
            typeImage={migrationImage}
            primaryInfoPill
            onCancelClick={() => { this.handleCancelMigrationClick() }}
          />}
          contentComponent={<MigrationDetailsContent
            item={migrationStore.migrationDetails}
            endpoints={endpointStore.endpoints}
            page={this.props.match.params.page || ''}
            detailsLoading={endpointStore.loading || migrationStore.detailsLoading}
            onDeleteMigrationClick={() => { this.handleDeleteMigrationClick() }}
          />}
        />
        <AlertModal
          isOpen={this.state.showDeleteMigrationConfirmation}
          title="Delete Migration?"
          message="Are you sure you want to delete this migration?"
          extraMessage="Deleting a Coriolis Migration is permanent!"
          onConfirmation={() => { this.handleDeleteMigrationConfirmation() }}
          onRequestClose={() => { this.handleCloseDeleteMigrationConfirmation() }}
        />

        <AlertModal
          isOpen={this.state.showCancelConfirmation}
          title="Cancel Migration?"
          message="Are you sure you want to cancel the migration?"
          extraMessage=" "
          onConfirmation={() => { this.handleCancelConfirmation() }}
          onRequestClose={() => { this.handleCloseCancelConfirmation() }}
        />
      </Wrapper>
    )
  }
}

export default MigrationDetailsPage
