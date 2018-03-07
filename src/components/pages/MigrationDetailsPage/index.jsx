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
import { DetailsPageHeader } from '../../organisms/DetailsPageHeader'
import DetailsContentHeader from '../../organisms/DetailsContentHeader'
import MigrationDetailsContent from '../../organisms/MigrationDetailsContent'
import AlertModal from '../../organisms/AlertModal'

import MigrationStore from '../../../stores/MigrationStore'
import UserStore from '../../../stores/UserStore'
import EndpointStore from '../../../stores/EndpointStore'
import NotificationStore from '../../../stores/NotificationStore'
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
  pollInterval: IntervalID

  constructor() {
    super()

    this.state = {
      showDeleteMigrationConfirmation: false,
      showCancelConfirmation: false,
    }
  }

  componentDidMount() {
    document.title = 'Migration Details'

    EndpointStore.getEndpoints()
    this.pollData(true)
    this.pollInterval = setInterval(() => { this.pollData() }, requestPollTimeout)
  }

  componentWillUnmount() {
    MigrationStore.clearDetails()
    clearInterval(this.pollInterval)
  }

  handleUserItemClick(item: { value: string }) {
    switch (item.value) {
      case 'signout':
        UserStore.logout()
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
    if (MigrationStore.migrationDetails) {
      MigrationStore.delete(MigrationStore.migrationDetails.id)
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
    if (!MigrationStore.migrationDetails) {
      return
    }
    MigrationStore.cancel(MigrationStore.migrationDetails.id).then(() => {
      if (MigrationStore.canceling === false) {
        NotificationStore.notify('Canceled', 'success')
      } else {
        NotificationStore.notify('The migration couldn\'t be canceled', 'error')
      }
    })
  }

  pollData(showLoading?: boolean) {
    MigrationStore.getMigration(this.props.match.params.id, showLoading || false)
  }

  render() {
    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={UserStore.user}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={MigrationStore.migrationDetails}
            onBackButonClick={() => { this.handleBackButtonClick() }}
            typeImage={migrationImage}
            primaryInfoPill
            onCancelClick={() => { this.handleCancelMigrationClick() }}
          />}
          contentComponent={<MigrationDetailsContent
            item={MigrationStore.migrationDetails}
            endpoints={EndpointStore.endpoints}
            page={this.props.match.params.page || ''}
            detailsLoading={EndpointStore.loading || MigrationStore.detailsLoading}
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
