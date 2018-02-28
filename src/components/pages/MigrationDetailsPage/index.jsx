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
import connectToStores from 'alt-utils/lib/connectToStores'

import DetailsTemplate from '../../templates/DetailsTemplate'
import { DetailsPageHeader } from '../../organisms/DetailsPageHeader'
import DetailsContentHeader from '../../organisms/DetailsContentHeader'
import MigrationDetailsContent from '../../organisms/MigrationDetailsContent'
import AlertModal from '../../organisms/AlertModal'

import MigrationStore from '../../../stores/MigrationStore'
import UserStore from '../../../stores/UserStore'
import UserActions from '../../../actions/UserActions'
import MigrationActions from '../../../actions/MigrationActions'
import EndpointStore from '../../../stores/EndpointStore'
import EndpointActions from '../../../actions/EndpointActions'
import NotificationActions from '../../../actions/NotificationActions'
import { requestPollTimeout } from '../../../config'

import migrationImage from './images/migration.svg'

const Wrapper = styled.div``

type Props = {
  match: any,
  migrationStore: any,
  endpointStore: any,
  userStore: any,
}
type State = {
  showDeleteMigrationConfirmation: boolean,
  showCancelConfirmation: boolean,
}
class MigrationDetailsPage extends React.Component<Props, State> {
  static getStores() {
    return [MigrationStore, EndpointStore, UserStore]
  }

  static getPropsFromStores() {
    return {
      migrationStore: MigrationStore.getState(),
      endpointStore: EndpointStore.getState(),
      userStore: UserStore.getState(),
    }
  }

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

    EndpointActions.getEndpoints()
    this.pollData(true)
    this.pollInterval = setInterval(() => { this.pollData() }, requestPollTimeout)
  }

  componentWillUnmount() {
    MigrationActions.clearDetails()
    clearInterval(this.pollInterval)
  }

  handleUserItemClick(item) {
    switch (item.value) {
      case 'signout':
        UserActions.logout()
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
    MigrationActions.delete(this.props.migrationStore.migrationDetails.id)
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
    MigrationActions.cancel(this.props.migrationStore.migrationDetails.id).promise.then(() => {
      if (MigrationStore.getState().canceling === false) {
        NotificationActions.notify('Canceled', 'success')
      } else {
        NotificationActions.notify('The migration couldn\'t be canceled', 'error')
      }
    })
  }

  pollData(showLoading) {
    MigrationActions.getMigration(this.props.match.params.id, showLoading)
  }

  render() {
    return (
      <Wrapper>
        <DetailsTemplate
          pageHeaderComponent={<DetailsPageHeader
            user={this.props.userStore.user}
            onUserItemClick={item => { this.handleUserItemClick(item) }}
          />}
          contentHeaderComponent={<DetailsContentHeader
            item={this.props.migrationStore.migrationDetails}
            onBackButonClick={() => { this.handleBackButtonClick() }}
            typeImage={migrationImage}
            primaryInfoPill
            onCancelClick={() => { this.handleCancelMigrationClick() }}
          />}
          contentComponent={<MigrationDetailsContent
            item={this.props.migrationStore.migrationDetails}
            endpoints={this.props.endpointStore.endpoints}
            page={this.props.match.params.page || ''}
            detailsLoading={this.props.endpointStore.loading || this.props.migrationStore.detailsLoading}
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

export default connectToStores(MigrationDetailsPage)
