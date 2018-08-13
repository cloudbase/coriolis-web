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

import MainTemplate from '../../templates/MainTemplate'
import Navigation from '../../organisms/Navigation'
import FilterList from '../../organisms/FilterList'
import PageHeader from '../../organisms/PageHeader'
import UserListItem from '../../molecules/UserListItem'

import type { User } from '../../../types/User'

import projectStore from '../../../stores/ProjectStore'
import userStore from '../../../stores/UserStore'
import { requestPollTimeout } from '../../../config.js'

const Wrapper = styled.div``

type State = {
  modalIsOpen: boolean,
}
@observer
class UsersPage extends React.Component<{}, State> {
  state = {
    modalIsOpen: false,
  }

  pollTimeout: TimeoutID
  stopPolling: boolean

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

  getProjectName(projectId: ?string): string {
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
    userStore.getAllUsers(true)
  }

  pollData(showLoading?: boolean) {
    if (this.state.modalIsOpen || this.stopPolling) {
      return
    }

    userStore.getAllUsers(showLoading).then(() => {
      this.pollTimeout = setTimeout(() => { this.pollData() }, requestPollTimeout)
    })
  }

  itemFilterFunction(item: User, filterItem?: ?string, filterText?: string): boolean {
    filterText = (filterText && filterText.toLowerCase()) || ''
    return (
      (
        filterItem === 'all' ||
        item.project_id === filterItem
      ) && (
        item.name.toLowerCase().indexOf(filterText) > -1 ||
        (item.description ? item.description.toLowerCase().indexOf(filterText) > -1 : false) ||
        (item.email ? item.email.toLowerCase().indexOf(filterText) > -1 : false)
      ))
  }

  render() {
    let filterItems = projectStore.projects
      .map(p => { return { label: p.name, value: p.id } })
      .sort((a, b) => a.label.localeCompare(b.label))

    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="users" />}
          listNoMargin
          listComponent={
            <FilterList
              filterItems={[{ label: 'All', value: 'all' }].concat(filterItems)}
              selectionLabel="user"
              loading={userStore.allUsersLoading}
              items={userStore.users}
              onItemClick={(user: User) => { window.location.href = `#/user/${user.id}` }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              renderItemComponent={component => (
                <UserListItem
                  {...component}
                  getProjectName={projectId => this.getProjectName(projectId)}
                />
              )}
            />
          }
          headerComponent={
            <PageHeader
              title="Users"
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          }
        />
      </Wrapper>
    )
  }
}

export default UsersPage
