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

import MainTemplate from '../../modules/TemplateModule/MainTemplate/MainTemplate'
import Navigation from '../../modules/NavigationModule/Navigation/Navigation'
import FilterList from '../../ui/Lists/FilterList/FilterList'
import PageHeader from '../../ui/PageHeader/PageHeader'
import UserListItem from '../../modules/UserModule/UserListItem/UserListItem'

import type { User } from '../../../@types/User'

import projectStore from '../../../stores/ProjectStore'
import userStore from '../../../stores/UserStore'
import configLoader from '../../../utils/Config'

const Wrapper = styled.div<any>``

type State = {
  modalIsOpen: boolean,
}
@observer
class UsersPage extends React.Component<{ history: any }, State> {
  state = {
    modalIsOpen: false,
  }

  pollTimeout: number = 0

  stopPolling: boolean = false

  componentDidMount() {
    document.title = 'Users'

    projectStore.getProjects()
    userStore.getAllUsers()

    this.stopPolling = false
    this.pollData(true)
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout)
    this.stopPolling = true
  }

  getProjectName(projectId?: string | null): string {
    if (!projectId) {
      return '-'
    }
    const project = projectStore.projects.find(p => p.id === projectId)
    return project ? project.name : '-'
  }

  handleModalOpen() {
    this.setState({ modalIsOpen: true })
  }

  handleModalClose() {
    this.setState({ modalIsOpen: false }, () => {
      this.pollData()
    })
  }

  handleReloadButtonClick() {
    projectStore.getProjects()
    userStore.getAllUsers({ showLoading: true })
  }

  async pollData(showLoading?: boolean) {
    if (this.state.modalIsOpen || this.stopPolling) {
      return
    }

    await userStore.getAllUsers({ showLoading, skipLog: true })
    this.pollTimeout = window.setTimeout(() => { this.pollData() }, configLoader.config.requestPollTimeout)
  }

  itemFilterFunction(item: User, filterItem?: string | null, filterText?: string): boolean {
    const usableFilterText = (filterText && filterText.toLowerCase()) || ''
    return (
      (
        filterItem === 'all'
        || item.project_id === filterItem
      ) && (
        item.name.toLowerCase().indexOf(usableFilterText) > -1
        || (
          item.description ? item.description.toLowerCase().indexOf(usableFilterText) > -1 : false
        )
        || (item.email ? item.email.toLowerCase().indexOf(usableFilterText) > -1 : false)
      ))
  }

  render() {
    const filterItems = projectStore.projects
      .map(p => ({ label: p.name, value: p.id }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="users" />}
          listNoMargin
          listComponent={(
            <FilterList
              filterItems={[{ label: 'All', value: 'all' }].concat(filterItems)}
              selectionLabel="user"
              loading={userStore.allUsersLoading}
              items={userStore.users}
              onItemClick={(user: User) => { this.props.history.push(`/users/${user.id}`) }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              renderItemComponent={component => (
                <UserListItem
                  {...component}
                  getProjectName={projectId => this.getProjectName(projectId)}
                />
              )}
            />
          )}
          headerComponent={(
            <PageHeader
              title="Users"
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          )}
        />
      </Wrapper>
    )
  }
}

export default UsersPage
