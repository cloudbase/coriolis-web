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

import FilterList from '../../organisms/FilterList'
import MainTemplate from '../../templates/MainTemplate'
import PageHeader from '../../organisms/PageHeader'
import Navigation from '../../organisms/Navigation'
import DropdownFilterGroup from '../../organisms/DropdownFilterGroup'
import AssessmentListItem from '../../molecules/AssessmentListItem'
import type { Assessment } from '../../../types/Assessment'
import type { Endpoint } from '../../../types/Endpoint'

import azureStore from '../../../stores/AzureStore'
import assessmentStore from '../../../stores/AssessmentStore'
import endpointStore from '../../../stores/EndpointStore'
import projectStore from '../../../stores/ProjectStore'
import userStore from '../../../stores/UserStore'

import { requestPollTimeout } from '../../../config'

const Wrapper = styled.div``

type Props = {}
type State = { modalIsOpen: boolean }
@observer
class AssessmentsPage extends React.Component<Props, State> {
  state = {
    modalIsOpen: false,
  }

  disablePolling: boolean
  pollTimeout: TimeoutID

  componentWillMount() {
    document.title = 'Coriolis Planning'

    projectStore.getProjects()

    if (!azureStore.isLoadedForCurrentProject()) {
      assessmentStore.clearSelection()
      azureStore.clearAssessments()
    }

    this.disablePolling = false
    this.pollData()

    endpointStore.getEndpoints({ showLoading: true }).then(() => {
      let endpoints = endpointStore.endpoints.filter(e => e.type === 'azure')
      if (endpoints.length > 0) {
        this.chooseEndpoint(assessmentStore.selectedEndpoint && assessmentStore.selectedEndpoint.id ? assessmentStore.selectedEndpoint : endpoints[0])
      }
    })
  }

  componentWillUnmount() {
    this.disablePolling = true
    clearTimeout(this.pollTimeout)
  }

  getEndpointsDropdownConfig() {
    let endpoints = endpointStore.endpoints.filter(e => e.type === 'azure')
    return {
      key: 'endpoint',
      selectedItem: assessmentStore.selectedEndpoint ? assessmentStore.selectedEndpoint.id : '',
      items: endpoints.map(endpoint => ({ label: endpoint.name, value: endpoint.id, endpoint })),
      onChange: (item: { endpoint: Endpoint }) => { this.chooseEndpoint(item.endpoint, true) },
      selectItemLabel: 'Select Endpoint',
      noItemsLabel: endpointStore.loading ? 'Loading ...' : 'No Endpoints',
      limitListOffset: true,
    }
  }

  getResourceGroupsDropdownConfig() {
    let groups = azureStore.assessmentResourceGroups
    return {
      key: 'resource-group',
      selectedItem: assessmentStore.selectedResourceGroup ? assessmentStore.selectedResourceGroup.id : '',
      items: groups.map(group => ({ label: group.name, value: group.id, group })),
      onChange: (item: Assessment) => { this.chooseResourceGroup(item.group) },
      selectItemLabel: 'Loading ...',
      noItemsLabel: this.areResourceGroupsLoading() ? 'Loading ...' : 'No Resource Groups',
    }
  }

  getFilterItems(): { label: string, value: string }[] {
    let types = [{ label: 'All projects', value: 'all' }]
    let assessments = azureStore.assessments
    let uniqueProjects = []

    assessments.forEach(a => {
      if (uniqueProjects.findIndex(p => p.name === a.project.name) === -1) {
        uniqueProjects.push(a.project)
      }
    })

    let projects = uniqueProjects.map(p => ({ label: p.name, value: p.name }))
    return types.concat(projects)
  }

  handleReloadButtonClick() {
    if (!endpointStore.connectionInfo) {
      return
    }

    azureStore.getAssessments(
      // $FlowIgnore
      endpointStore.connectionInfo.subscription_id,
      assessmentStore.selectedResourceGroup ? assessmentStore.selectedResourceGroup.name : '',
      userStore.loggedUser ? userStore.loggedUser.project.id : ''
    )
  }

  handleItemClick(assessment: Assessment) {
    if (assessment.properties.status.toUpperCase() !== 'COMPLETED') {
      return
    }

    let connectionInfo = endpointStore.connectionInfo
    let endpoint = assessmentStore.selectedEndpoint
    let resourceGroupName = assessmentStore.selectedResourceGroup ? assessmentStore.selectedResourceGroup.name : ''
    let projectName = assessment.project.name
    let groupName = assessment.group.name
    let assessmentName = assessment.name

    let info = { endpoint, connectionInfo, resourceGroupName, projectName, groupName, assessmentName }

    window.location.href = `/#/assessment/${encodeURIComponent(btoa(JSON.stringify({ ...info })))}`
  }

  handleProjectChange() {
    assessmentStore.clearSelection()
    azureStore.clearAssessments()
    endpointStore.getEndpoints({ showLoading: true }).then(() => {
      let endpoints = endpointStore.endpoints.filter(e => e.type === 'azure')
      if (endpoints.length > 0) {
        this.chooseEndpoint(assessmentStore.selectedEndpoint && assessmentStore.selectedEndpoint.id ? assessmentStore.selectedEndpoint : endpoints[0])
      }
    })
  }

  handleModalOpen() {
    this.setState({ modalIsOpen: true })
  }

  handleModalClose() {
    this.setState({ modalIsOpen: false }, () => {
      this.pollData()
    })
  }

  areResourceGroupsLoading() {
    return azureStore.authenticating || azureStore.loadingResourceGroups
  }

  pollData() {
    if (this.disablePolling || this.state.modalIsOpen) {
      return
    }

    let connectionInfo = endpointStore.connectionInfo
    let selectedResourceGroup = assessmentStore.selectedResourceGroup

    if (!connectionInfo || !connectionInfo.subscription_id || !selectedResourceGroup || !selectedResourceGroup.name) {
      this.pollTimeout = setTimeout(() => { this.pollData() }, requestPollTimeout)
      return
    }

    azureStore.getAssessments(
      // $FlowIgnore
      connectionInfo.subscription_id,
      selectedResourceGroup.name,
      userStore.loggedUser ? userStore.loggedUser.project.id : '',
      { backgroundLoading: true }
    ).then(() => {
      this.pollTimeout = setTimeout(() => { this.pollData() }, requestPollTimeout)
    })
  }

  chooseResourceGroup(selectedResourceGroup: $PropertyType<Assessment, 'group'>) {
    if (!endpointStore.connectionInfo) {
      return
    }

    assessmentStore.updateSelectedResourceGroup(selectedResourceGroup)
    azureStore.getAssessments(
      // $FlowIssue
      endpointStore.connectionInfo.subscription_id,
      selectedResourceGroup.name,
      userStore.loggedUser ? userStore.loggedUser.project.id : '',
    )
  }

  chooseEndpoint(selectedEndpoint: Endpoint, clearResourceGroup?: boolean) {
    if (assessmentStore.selectedEndpoint && assessmentStore.selectedEndpoint.id === selectedEndpoint.id) {
      return
    }

    assessmentStore.updateSelectedEndpoint(selectedEndpoint)

    if (clearResourceGroup) {
      assessmentStore.updateSelectedResourceGroup(null)
    }

    endpointStore.getConnectionInfo(selectedEndpoint).then(() => {
      let connectionInfo = endpointStore.connectionInfo
      if (!connectionInfo) {
        return
      }
      // $FlowIgnore
      azureStore.authenticate(connectionInfo.user_credentials.username, connectionInfo.user_credentials.password).then(() => {
        // $FlowIgnore
        azureStore.getResourceGroups(connectionInfo.subscription_id).then(() => {
          let groups = azureStore.assessmentResourceGroups
          let selectedGroup = assessmentStore.selectedResourceGroup
          // $FlowIssue
          if (groups.filter(rg => rg.id === selectedGroup ? selectedGroup.id : '').length > 0) {
            return
          }
          if (groups.length > 0) {
            let defaultResourceGroup = groups.find(g => g.name === connectionInfo.default_resource_group) || groups[0]
            this.chooseResourceGroup(defaultResourceGroup)
          }
        })
      })
    })
  }

  itemFilterFunction(item: any, filterItem: ?string, filterText?: string) {
    let assessment: Assessment = item
    if ((filterItem !== 'all' && (assessment.project.name !== filterItem)) ||
      (item.name.toLowerCase().indexOf(filterText) === -1 && assessment.id.toLowerCase().indexOf(filterText || '') === -1)) {
      return false
    }

    return true
  }

  render() {
    return (
      <Wrapper>
        <MainTemplate
          listNoMargin
          navigationComponent={<Navigation currentPage="planning" />}
          listComponent={
            <FilterList
              filterItems={this.getFilterItems()}
              selectionLabel="assessments"
              loading={this.areResourceGroupsLoading() || azureStore.loadingAssessments}
              items={
                // $FlowIgnore
                azureStore.assessments
              }
              onItemClick={item => {
                let itemAny: any = item
                let assessment: Assessment = itemAny
                this.handleItemClick(assessment)
              }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              renderItemComponent={options => {
                let optionsAny: any = options
                return <AssessmentListItem {...optionsAny} />
              }}
              customFilterComponent={(
                <DropdownFilterGroup
                  items={[this.getEndpointsDropdownConfig(), this.getResourceGroupsDropdownConfig()]}
                />
              )}
              emptyListImage={null}
              emptyListMessage="You don’t have any Assessments."
              emptyListExtraMessage="Try selecting a new Endpoint or a new Resource Group."
            />
          }
          headerComponent={
            <PageHeader
              title="Planning"
              onProjectChange={() => { this.handleProjectChange() }}
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          }
        />
      </Wrapper>
    )
  }
}

export default AssessmentsPage
