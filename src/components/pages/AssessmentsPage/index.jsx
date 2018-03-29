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

import AzureStore from '../../../stores/AzureStore'
import AssessmentStore from '../../../stores/AssessmentStore'
import EndpointStore from '../../../stores/EndpointStore'
import ProjectStore from '../../../stores/ProjectStore'
import UserStore from '../../../stores/UserStore'

import { requestPollTimeout } from '../../../config'

const Wrapper = styled.div``

type Props = {}
type State = {modalIsOpen: boolean}
@observer
class AssessmentsPage extends React.Component<Props, State> {
  disablePolling: boolean
  pollTimeout: TimeoutID

  state = {
    modalIsOpen: false,
  }

  componentWillMount() {
    ProjectStore.getProjects()

    if (!AzureStore.isLoadedForCurrentProject()) {
      AssessmentStore.clearSelection()
      AzureStore.clearAssessments()
    }

    this.disablePolling = false
    this.pollData()

    EndpointStore.getEndpoints({ showLoading: true }).then(() => {
      let endpoints = EndpointStore.endpoints.filter(e => e.type === 'azure')
      if (endpoints.length > 0) {
        this.chooseEndpoint(AssessmentStore.selectedEndpoint && AssessmentStore.selectedEndpoint.id ? AssessmentStore.selectedEndpoint : endpoints[0])
      }
    })
  }

  componentWillUnmount() {
    this.disablePolling = true
    clearTimeout(this.pollTimeout)
  }

  getEndpointsDropdownConfig() {
    let endpoints = EndpointStore.endpoints.filter(e => e.type === 'azure')
    return {
      key: 'endpoint',
      selectedItem: AssessmentStore.selectedEndpoint ? AssessmentStore.selectedEndpoint.id : '',
      items: endpoints.map(endpoint => ({ label: endpoint.name, value: endpoint.id, endpoint })),
      onChange: (item: { endpoint: Endpoint }) => { this.chooseEndpoint(item.endpoint, true) },
      selectItemLabel: 'Select Endpoint',
      noItemsLabel: EndpointStore.loading ? 'Loading ...' : 'No Endpoints',
      limitListOffset: true,
    }
  }

  getResourceGroupsDropdownConfig() {
    let groups = AzureStore.resourceGroups
    return {
      key: 'resource-group',
      selectedItem: AssessmentStore.selectedResourceGroup ? AssessmentStore.selectedResourceGroup.id : '',
      items: groups.map(group => ({ label: group.name, value: group.id, group })),
      onChange: (item: Assessment) => { this.chooseResourceGroup(item.group) },
      selectItemLabel: 'Loading ...',
      noItemsLabel: this.areResourceGroupsLoading() ? 'Loading ...' : 'No Resource Groups',
    }
  }

  getFilterItems() {
    let types = [{ label: 'All projects', value: 'all' }]
    let assessments = AzureStore.assessments
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
    if (!EndpointStore.connectionInfo) {
      return
    }

    AzureStore.getAssessments(
      // $FlowIgnore
      EndpointStore.connectionInfo.subscription_id,
      AssessmentStore.selectedResourceGroup ? AssessmentStore.selectedResourceGroup.name : '',
      UserStore.user ? UserStore.user.project.id : ''
    )
  }

  handleItemClick(assessment: Assessment) {
    if (assessment.properties.status.toUpperCase() !== 'COMPLETED') {
      return
    }

    let connectionInfo = EndpointStore.connectionInfo
    let endpoint = AssessmentStore.selectedEndpoint
    let resourceGroupName = AssessmentStore.selectedResourceGroup ? AssessmentStore.selectedResourceGroup.name : ''
    let projectName = assessment.project.name
    let groupName = assessment.group.name
    let assessmentName = assessment.name

    let info = { endpoint, connectionInfo, resourceGroupName, projectName, groupName, assessmentName }

    window.location.href = `/#/assessment/${encodeURIComponent(btoa(JSON.stringify({ ...info })))}`
  }

  handleProjectChange() {
    AssessmentStore.clearSelection()
    AzureStore.clearAssessments()
    EndpointStore.getEndpoints({ showLoading: true }).then(() => {
      let endpoints = EndpointStore.endpoints.filter(e => e.type === 'azure')
      if (endpoints.length > 0) {
        this.chooseEndpoint(AssessmentStore.selectedEndpoint && AssessmentStore.selectedEndpoint.id ? AssessmentStore.selectedEndpoint : endpoints[0])
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
    return AzureStore.authenticating || AzureStore.loadingResourceGroups
  }

  pollData() {
    if (this.disablePolling || this.state.modalIsOpen) {
      return
    }

    let connectionInfo = EndpointStore.connectionInfo
    let selectedResourceGroup = AssessmentStore.selectedResourceGroup

    if (!connectionInfo || !connectionInfo.subscription_id || !selectedResourceGroup || !selectedResourceGroup.name) {
      this.pollTimeout = setTimeout(() => { this.pollData() }, requestPollTimeout)
      return
    }

    AzureStore.getAssessments(
      // $FlowIgnore
      connectionInfo.subscription_id,
      selectedResourceGroup.name,
      UserStore.user ? UserStore.user.project.id : '',
      { backgroundLoading: true }
    ).then(() => {
      this.pollTimeout = setTimeout(() => { this.pollData() }, requestPollTimeout)
    })
  }

  chooseResourceGroup(selectedResourceGroup: $PropertyType<Assessment, 'group'>) {
    if (!EndpointStore.connectionInfo) {
      return
    }

    AssessmentStore.updateSelectedResourceGroup(selectedResourceGroup)
    AzureStore.getAssessments(
      // $FlowIssue
      EndpointStore.connectionInfo.subscription_id,
      selectedResourceGroup.name,
      UserStore.user ? UserStore.user.project.id : '',
    )
  }

  chooseEndpoint(selectedEndpoint: Endpoint, clearResourceGroup?: boolean) {
    if (AssessmentStore.selectedEndpoint && AssessmentStore.selectedEndpoint.id === selectedEndpoint.id) {
      return
    }

    AssessmentStore.updateSelectedEndpoint(selectedEndpoint)

    if (clearResourceGroup) {
      AssessmentStore.updateSelectedResourceGroup(null)
    }

    EndpointStore.getConnectionInfo(selectedEndpoint).then(() => {
      let connectionInfo = EndpointStore.connectionInfo
      if (!connectionInfo) {
        return
      }
      // $FlowIgnore
      AzureStore.authenticate(connectionInfo.user_credentials.username, connectionInfo.user_credentials.password).then(() => {
        // $FlowIgnore
        AzureStore.getResourceGroups(connectionInfo.subscription_id).then(() => {
          let groups = AzureStore.resourceGroups
          let selectedGroup = AssessmentStore.selectedResourceGroup
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
              loading={this.areResourceGroupsLoading() || AzureStore.loadingAssessments}
              items={
                // $FlowIgnore
                AzureStore.assessments
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
