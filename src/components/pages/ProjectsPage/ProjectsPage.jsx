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
import ProjectListItem from '../../molecules/ProjectListItem'

import type { Project } from '../../../types/Project'

import projectStore from '../../../stores/ProjectStore'
import userStore from '../../../stores/UserStore'
import { requestPollTimeout } from '../../../config.js'

const Wrapper = styled.div``

type State = {
  modalIsOpen: boolean,
}
@observer
class ProjectsPage extends React.Component<{ history: any }, State> {
  state = {
    modalIsOpen: false,
  }

  pollTimeout: TimeoutID
  stopPolling: boolean

  componentDidMount() {
    document.title = 'Projects'

    this.stopPolling = false
    this.pollData(true)
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout)
    this.stopPolling = true
  }

  getMembers(projectId: string): number {
    return projectStore.roleAssignments.filter(a => a.scope.project.id === projectId).length
  }

  isCurrentProject(projectId: string): boolean {
    let project = userStore.loggedUser && userStore.loggedUser.project ? userStore.loggedUser.project : null
    return project ? project.id === projectId : false
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
    projectStore.getProjects(true)
    projectStore.getRoleAssignments()
  }

  handleSwitchProjectClick(projectId: string) {
    userStore.switchProject(projectId).then(() => {
      projectStore.getProjects()
    })
  }

  pollData(showLoading?: boolean) {
    if (this.state.modalIsOpen || this.stopPolling) {
      return
    }

    Promise.all([projectStore.getProjects(showLoading), projectStore.getRoleAssignments()]).then(() => {
      this.pollTimeout = setTimeout(() => { this.pollData() }, requestPollTimeout)
    })
  }

  itemFilterFunction(item: Project, filterItem?: ?string, filterText?: string): boolean {
    filterText = (filterText && filterText.toLowerCase()) || ''
    return (
      item.name.toLowerCase().indexOf(filterText) > -1 ||
      (item.description ? item.description.toLowerCase().indexOf(filterText) > -1 : false)
    )
  }

  render() {
    return (
      <Wrapper>
        <MainTemplate
          navigationComponent={<Navigation currentPage="projects" />}
          listNoMargin
          listComponent={
            <FilterList
              filterItems={[{ label: 'All', value: 'all' }]}
              selectionLabel="user"
              loading={projectStore.loading}
              items={projectStore.projects}
              onItemClick={(user: Project) => { this.props.history.push(`project/${user.id}`) }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              renderItemComponent={component => (
                <ProjectListItem
                  {...component}
                  getMembers={projectId => this.getMembers(projectId)}
                  isCurrentProject={projectId => this.isCurrentProject(projectId)}
                  onSwitchProjectClick={projectId => this.handleSwitchProjectClick(projectId)}
                />
              )}
            />
          }
          headerComponent={
            <PageHeader
              title="Projects"
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          }
        />
      </Wrapper>
    )
  }
}

export default ProjectsPage
