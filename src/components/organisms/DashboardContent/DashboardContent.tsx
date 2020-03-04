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
import autobind from 'autobind-decorator'

import InfoCountModule from './modules/InfoCountModule'
import LicenceModule from './modules/LicenceModule'
import ActivityModule from './modules/ActivityModule'
import TopEndpointsModule from './modules/TopEndpointsModule'
import ExecutionsModule from './modules/ExecutionsModule'

import Palette from '../../styleUtils/Palette'

import type { Endpoint } from '../../../@types/Endpoint'
import type { Project } from '../../../@types/Project'
import type { User } from '../../../@types/User'
import type { Licence } from '../../../@types/Licence'
import type { NotificationItemData } from '../../../@types/NotificationItem'
import { ReplicaItem, MigrationItem } from '../../../@types/MainItem'

const MIDDLE_WIDTHS = ['264px', '264px', '450px']

const Wrapper = styled.div<any>`
  margin-bottom: 64px;
`
const RowLayout = styled.div<any>`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 40px;
  margin-left: -32px;
  & > div {
    margin-top: 40px;
    margin-left: 32px;
  }
`
const MiddleMobileLayout = styled.div<any>`
  margin: 40px 0;
`

type Props = {
  replicas: ReplicaItem[],
  migrations: MigrationItem[],
  endpoints: Endpoint[],
  projects: Project[],
  replicasLoading: boolean,
  migrationsLoading: boolean,
  endpointsLoading: boolean,
  usersLoading: boolean,
  projectsLoading: boolean,
  licenceLoading: boolean,
  notificationItemsLoading: boolean,
  users: User[],
  licence: Licence | null,
  licenceError: string | null,
  notificationItems: NotificationItemData[],
  isAdmin: boolean,
  onNewReplicaClick: () => void,
  onNewEndpointClick: () => void,
}
type State = {
  useMobileLayout: boolean,
  useLargeActivity: boolean,
}
@observer
class DashboardContent extends React.Component<Props, State> {
  state = {
    useMobileLayout: false,
    useLargeActivity: false,
  }

  UNSAFE_componentWillMount() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false)
  }

  @autobind
  handleResize() {
    if (window.innerWidth < 1120 && !this.state.useMobileLayout) {
      this.setState({ useMobileLayout: true })
    } else if (window.innerWidth >= 1120 && this.state.useMobileLayout) {
      this.setState({ useMobileLayout: false })
    }
    if (window.innerWidth >= 2100 && !this.state.useLargeActivity) {
      this.setState({ useLargeActivity: true })
    } else if (window.innerWidth < 2100 && this.state.useLargeActivity) {
      this.setState({ useLargeActivity: false })
    }
  }

  renderMiddleModules() {
    const modules = [
      <ActivityModule
        large={this.state.useMobileLayout || this.state.useLargeActivity}
        notificationItems={this.props.notificationItems}
        loading={this.props.notificationItemsLoading}
        style={this.state.useMobileLayout ? null : {
          minWidth: MIDDLE_WIDTHS[0],
          width: MIDDLE_WIDTHS[0],
        }}
        onNewClick={this.props.onNewReplicaClick}
      />,
      <TopEndpointsModule
        replicas={this.props.replicas}
        migrations={this.props.migrations}
        endpoints={this.props.endpoints}
        loading={this.props.replicasLoading
          || this.props.migrationsLoading || this.props.endpointsLoading}
        style={{
          minWidth: MIDDLE_WIDTHS[1],
          width: MIDDLE_WIDTHS[1],
        }}
        onNewClick={this.props.onNewEndpointClick}
      />,
      <LicenceModule
        licence={this.props.licence}
        loading={this.props.licenceLoading}
        licenceError={this.props.licenceError}
        style={{
          minWidth: MIDDLE_WIDTHS[2],
          width: MIDDLE_WIDTHS[2],
        }}
      />,
    ]

    if (this.state.useMobileLayout) {
      return (
        <MiddleMobileLayout>
          {modules[0]}
          <RowLayout>
            {modules[1]}
            {modules[2]}
          </RowLayout>
        </MiddleMobileLayout>
      )
    }

    return (
      <RowLayout>
        {modules[0]}
        {modules[1]}
        {modules[2]}
      </RowLayout>
    )
  }

  render() {
    let infoCountData = [
      {
        label: 'Replicas',
        value: this.props.replicas.length,
        color: Palette.alert,
        link: '/replicas',
        loading: this.props.replicasLoading,
      },
      {
        label: 'Migrations',
        value: this.props.migrations.length,
        color: Palette.primary,
        link: '/migrations',
        loading: this.props.migrationsLoading,
      },
      {
        label: 'Endpoints',
        value: this.props.endpoints.length,
        color: Palette.black,
        link: '/endpoints',
        loading: this.props.endpointsLoading,
      },
    ]

    if (this.props.isAdmin) {
      infoCountData = infoCountData.concat([
        {
          label: 'Users',
          value: this.props.users.length,
          color: Palette.grayscale[3],
          link: '/users',
          loading: this.props.usersLoading,
        },
        {
          label: 'Projects',
          value: this.props.projects.length,
          color: Palette.grayscale[3],
          link: '/projects',
          loading: this.props.projectsLoading,
        },
      ])
    }

    return (
      <Wrapper>
        <InfoCountModule
          data={infoCountData}
        />
        {this.renderMiddleModules()}
        <ExecutionsModule
          replicas={this.props.replicas}
          migrations={this.props.migrations}
          loading={this.props.replicasLoading || this.props.migrationsLoading}
        />
      </Wrapper>
    )
  }
}

export default DashboardContent
