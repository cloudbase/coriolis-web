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

import FilterList from '../../organisms/FilterList'
import MainTemplate from '../../templates/MainTemplate'
import PageHeader from '../../organisms/PageHeader'
import Navigation from '../../organisms/Navigation'
import DropdownFilterGroup from '../../organisms/DropdownFilterGroup'
import AssessmentListItem from '../../molecules/AssessmentListItem'
import type { Assessment } from '../../../@types/Assessment'
import type { Endpoint } from '../../../@types/Endpoint'

import azureStore from '../../../stores/AzureStore'
import assessmentStore from '../../../stores/AssessmentStore'
import endpointStore from '../../../stores/EndpointStore'
import projectStore from '../../../stores/ProjectStore'
import userStore from '../../../stores/UserStore'
import configLoader from '../../../utils/Config'
import DropdownLink from '../../molecules/DropdownLink/DropdownLink'

const Wrapper = styled.div<any>``

type Props = { history: any }
type State = { modalIsOpen: boolean }
@observer
class AssessmentsPage extends React.Component<Props, State> {
  state = {
    modalIsOpen: false,
  }

  disablePolling: boolean = false

  pollTimeout: number = 0

  UNSAFE_componentWillMount() {
    document.title = 'Coriolis Planning'

    projectStore.getProjects()

    if (!azureStore.isLoadedForCurrentProject()) {
      assessmentStore.clearSelection()
      azureStore.clearAssessments()
    }

    this.disablePolling = false
    this.pollData()

    endpointStore.getEndpoints({ showLoading: true }).then(() => {
      const endpoints = endpointStore.endpoints.filter(e => e.type === 'azure')
      if (endpoints.length > 0) {
        this.chooseEndpoint(assessmentStore.selectedEndpoint && assessmentStore.selectedEndpoint.id
          ? assessmentStore.selectedEndpoint : endpoints[0])
      }
    })
  }

  componentWillUnmount() {
    this.disablePolling = true
    clearTimeout(this.pollTimeout)
  }

  getEndpointsDropdownConfig(): DropdownLink['props'] & { key: string } {
    const endpoints = endpointStore.endpoints.filter(e => e.type === 'azure')
    return {
      key: 'endpoint',
      selectedItem: assessmentStore.selectedEndpoint ? assessmentStore.selectedEndpoint.id : '',
      items: endpoints.map(endpoint => ({ label: endpoint.name, value: endpoint.id, endpoint })),
      onChange: (item: any) => { this.chooseEndpoint(item.endpoint, true) },
      selectItemLabel: 'Select Endpoint',
      noItemsLabel: endpointStore.loading ? 'Loading ...' : 'No Endpoints',
    }
  }

  getResourceGroupsDropdownConfig(): DropdownLink['props'] & { key: string } {
    const groups = azureStore.assessmentResourceGroups
    return {
      key: 'resource-group',
      selectedItem: assessmentStore.selectedResourceGroup ? assessmentStore.selectedResourceGroup.id : '',
      items: groups.map(group => ({ label: group.name, value: group.id, group })),
      onChange: (item: any) => { this.chooseResourceGroup(item.group) },
      selectItemLabel: 'Loading ...',
      noItemsLabel: this.areResourceGroupsLoading() ? 'Loading ...' : 'No Resource Groups',
    }
  }

  getFilterItems(): { label: string, value: string }[] {
    const types = [{ label: 'All projects', value: 'all' }]
    const assessments = azureStore.assessments
    const uniqueProjects: { name: string }[] = []

    assessments.forEach(a => {
      if (uniqueProjects.findIndex(p => p.name === a.project.name) === -1) {
        uniqueProjects.push(a.project)
      }
    })

    const projects = uniqueProjects.map(p => ({ label: p.name, value: p.name }))
    return types.concat(projects)
  }

  handleReloadButtonClick() {
    if (!endpointStore.connectionInfo) {
      return
    }

    azureStore.getAssessments(

      endpointStore.connectionInfo.subscription_id,
      assessmentStore.selectedResourceGroup ? assessmentStore.selectedResourceGroup.name : '',
      userStore.loggedUser ? userStore.loggedUser.project.id : '',
    )
  }

  handleItemClick(assessment: Assessment) {
    if (assessment.properties.status.toUpperCase() !== 'COMPLETED') {
      return
    }

    const connectionInfo = endpointStore.connectionInfo
    const endpoint = assessmentStore.selectedEndpoint
    const resourceGroupName = assessmentStore.selectedResourceGroup ? assessmentStore.selectedResourceGroup.name : ''
    const projectName = assessment.project.name
    const groupName = assessment.group.name
    const assessmentName = assessment.name

    const info = {
      endpoint, connectionInfo, resourceGroupName, projectName, groupName, assessmentName,
    }

    this.props.history.push(`/assessment/${encodeURIComponent(btoa(JSON.stringify({ ...info })))}`)
  }

  handleProjectChange() {
    assessmentStore.clearSelection()
    azureStore.clearAssessments()
    endpointStore.getEndpoints({ showLoading: true }).then(() => {
      const endpoints = endpointStore.endpoints.filter(e => e.type === 'azure')
      if (endpoints.length > 0) {
        this.chooseEndpoint(assessmentStore.selectedEndpoint
          && assessmentStore.selectedEndpoint.id ? assessmentStore.selectedEndpoint : endpoints[0])
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

    const connectionInfo = endpointStore.connectionInfo
    const selectedResourceGroup = assessmentStore.selectedResourceGroup

    if (!connectionInfo || !connectionInfo.subscription_id
      || !selectedResourceGroup || !selectedResourceGroup.name) {
      this.pollTimeout = setTimeout(() => {
        this.pollData()
      }, configLoader.config.requestPollTimeout)
      return
    }

    azureStore.getAssessments(

      connectionInfo.subscription_id,
      selectedResourceGroup.name,
      userStore.loggedUser ? userStore.loggedUser.project.id : '',
      { backgroundLoading: true, skipLog: true },
    ).then(() => {
      this.pollTimeout = setTimeout(() => {
        this.pollData()
      }, configLoader.config.requestPollTimeout)
    })
  }

  chooseResourceGroup(selectedResourceGroup: Assessment['group']) {
    if (!endpointStore.connectionInfo) {
      return
    }

    assessmentStore.updateSelectedResourceGroup(selectedResourceGroup)
    azureStore.getAssessments(

      endpointStore.connectionInfo.subscription_id,
      selectedResourceGroup.name,
      userStore.loggedUser ? userStore.loggedUser.project.id : '',
    )
  }

  chooseEndpoint(selectedEndpoint: Endpoint, clearResourceGroup?: boolean) {
    if (assessmentStore.selectedEndpoint
      && assessmentStore.selectedEndpoint.id === selectedEndpoint.id) {
      return
    }

    assessmentStore.updateSelectedEndpoint(selectedEndpoint)

    if (clearResourceGroup) {
      assessmentStore.updateSelectedResourceGroup(null)
    }

    endpointStore.getConnectionInfo(selectedEndpoint).then(() => {
      const connectionInfo = endpointStore.connectionInfo
      if (!connectionInfo) {
        return
      }
      azureStore.authenticate(connectionInfo).then(() => {
        azureStore.getResourceGroups(connectionInfo.subscription_id).then(() => {
          const groups = azureStore.assessmentResourceGroups
          const selectedGroup = assessmentStore.selectedResourceGroup

          if (groups.filter((rg: any) => (rg.id === selectedGroup ? selectedGroup?.id : '')).length > 0) {
            return
          }
          if (groups.length > 0) {
            const defaultResourceGroup = groups
              .find(g => g.name === connectionInfo.default_resource_group) || groups[0]
            this.chooseResourceGroup(defaultResourceGroup)
          }
        })
      })
    })
  }

  itemFilterFunction(item: any, filterItem?: string | null, filterText?: string) {
    const assessment: Assessment = item
    if ((filterItem !== 'all' && (assessment.project.name !== filterItem))
      || (item.name.toLowerCase().indexOf(filterText) === -1 && assessment.id.toLowerCase().indexOf(filterText || '') === -1)) {
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
          listComponent={(
            <FilterList
              filterItems={this.getFilterItems()}
              selectionLabel="assessments"
              loading={this.areResourceGroupsLoading() || azureStore.loadingAssessments}
              items={azureStore.assessments}
              onItemClick={item => {
                const itemAny: any = item
                const assessment: Assessment = itemAny
                this.handleItemClick(assessment)
              }}
              onReloadButtonClick={() => { this.handleReloadButtonClick() }}
              itemFilterFunction={(...args) => this.itemFilterFunction(...args)}
              renderItemComponent={options => {
                const optionsAny: any = options
                // eslint-disable-next-line react/jsx-props-no-spreading
                return <AssessmentListItem {...optionsAny} />
              }}
              customFilterComponent={(
                <DropdownFilterGroup
                  items={[this.getEndpointsDropdownConfig(),
                    this.getResourceGroupsDropdownConfig()]}
                />
              )}
              emptyListImage={null}
              emptyListMessage="You don’t have any Assessments."
              emptyListExtraMessage="Try selecting a new Endpoint or a new Resource Group."
            />
          )}
          headerComponent={(
            <PageHeader
              title="Planning"
              onProjectChange={() => { this.handleProjectChange() }}
              onModalOpen={() => { this.handleModalOpen() }}
              onModalClose={() => { this.handleModalClose() }}
            />
          )}
        />
      </Wrapper>
    )
  }
}

export default AssessmentsPage
