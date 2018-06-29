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

import moment from 'moment'

import Api from '../utils/ApiCaller'
import type { Assessment, VmItem, VmSize } from '../types/Assessment'

const azureUrl = 'https://management.azure.com/'
const defaultApiVersion = '2017-11-11-preview'

const resourceGroupsUrl = (opts: { subscriptionId: string }) => `/subscriptions/${opts.subscriptionId}/resourceGroups`
const projectsUrl = ({ resourceGroupName, ...other }) => `${resourceGroupsUrl({ ...other })}/${resourceGroupName}/providers/Microsoft.Migrate/projects`
const groupsUrl = ({ projectName, ...other }) => `${projectsUrl({ ...other })}/${projectName}/groups`
const assessmentsUrl = ({ groupName, ...other }) => `${groupsUrl({ ...other })}/${groupName}/assessments`
const assessmentDetailsUrl = ({ assessmentName, ...other }) => `${assessmentsUrl({ ...other })}/${assessmentName}`
const assessedVmsUrl = ({ ...other }) => `${assessmentDetailsUrl({ ...other })}/assessedMachines`

class Util {
  static buildUrl(baseUrl: string, apiVersion?: string): string {
    const url = `/proxy/${azureUrl + baseUrl}?api-version=${apiVersion || defaultApiVersion}`
    return url
  }

  static sortAssessments(assessments) {
    assessments.sort((a, b) => {
      return moment(b.properties.updatedTimestamp).toDate().getTime() - moment(a.properties.updatedTimestamp)
    })
    return assessments
  }

  static checkQueues(queues, requestIds, callback) {
    if (requestIds[0] !== requestIds[1]) {
      return
    }

    let doneQeues = queues.filter(q => q === 0).length
    if (doneQeues === queues.length) {
      callback()
    }
  }

  static isResponseValid(response): boolean {
    if (response && response.data && response.data.error) {
      const error = response.data.error
      console.error('%c', 'color: #D0021B', `${error.code}: ${error.message}`)
      return false
    }
    return true
  }

  static validateResponse(response, resolveData): Promise<any> {
    if (!this.isResponseValid(response)) {
      return Promise.reject()
    }

    if (resolveData) {
      return Promise.resolve(resolveData)
    }
    return Promise.resolve(response)
  }
}

class AzureSource {
  static authenticate(username: string, password: string): Promise<any> {
    return Api.send({
      url: '/azure-login',
      method: 'POST',
      data: { username, password },
    }).then(response => {
      let entries = Object.keys(response.data.tokenCache)[0]
      let accessToken = response.data.tokenCache[entries][0].accessToken
      Api.setDefaultHeader('Authorization', `Bearer ${accessToken}`)
      return response.data
    })
  }

  static getResourceGroups(subscriptionId: string): Promise<$PropertyType<Assessment, 'group'>[]> {
    return Api.get(Util.buildUrl(resourceGroupsUrl({ subscriptionId }), '2017-08-01')).then(response => {
      return Util.validateResponse(response, response.data.value)
    })
  }

  static previousReqId: string

  static getAssessments(subscriptionId: string, resourceGroupName: string): Promise<Assessment[]> {
    let cancelId = subscriptionId + resourceGroupName
    if (this.previousReqId) {
      Api.cancelRequests(this.previousReqId)
    }
    this.previousReqId = cancelId

    // Load Projects
    return Api.send({
      url: Util.buildUrl(projectsUrl({ resourceGroupName, subscriptionId })),
      cancelId,
    }).then(projectsResponse => {
      if (!Util.isResponseValid(projectsResponse)) {
        return []
      }
      let projects = projectsResponse.data.value.filter(p => p.type === 'Microsoft.Migrate/projects')

      // Load groups for each project
      return Promise.all(projects.map(project => {
        return Api.send({
          url: Util.buildUrl(groupsUrl({ projectName: project.name, subscriptionId, resourceGroupName })),
          cancelId,
        }).then(groupsResponse => {
          if (!Util.isResponseValid(groupsResponse)) {
            return null
          }
          return groupsResponse.data.value.map(group => { return { ...group, project } })
        })
      }))
    }).then(groupsResponses => {
      let groups = []
      groupsResponses.filter(r => r !== null).forEach(validGroupsReponse => {
        groups = groups.concat(validGroupsReponse)
      })

      // Load assessments for each group
      return Promise.all(groups.map(group => {
        // $FlowIgnore
        return Api.send({
          url: Util.buildUrl(assessmentsUrl({ subscriptionId, resourceGroupName, projectName: group.project.name, groupName: group.name })),
          cancelId,
        }).then(assessmentResponse => {
          if (!Util.isResponseValid(assessmentResponse)) {
            return null
          }
          return assessmentResponse.data.value.map(assessment => { return { ...assessment, group, project: group.project } })
        })
      }))
    }).then(assessementsResponses => {
      let assessments = []
      assessementsResponses.filter(r => r !== null).forEach(validAssessmentsResponse => {
        assessments = assessments.concat(validAssessmentsResponse)
      })
      return Util.sortAssessments(assessments)
    })
  }

  static getAssessmentDetails(info: Assessment): Promise<Assessment> {
    return Api.get(Util.buildUrl(assessmentDetailsUrl({ ...info, subscriptionId: info.connectionInfo.subscription_id }))).then(response => {
      return Util.validateResponse(response, { ...response.data, ...info })
    })
  }

  static getAssessedVms(info: Assessment): Promise<VmItem[]> {
    return Api.get(Util.buildUrl(assessedVmsUrl({ ...info, subscriptionId: info.connectionInfo.subscription_id }))).then(response => {
      if (!Util.isResponseValid(response)) {
        return []
      }

      let vms = response.data.value
      vms.sort((a, b) => {
        let getLabel = item => `${item.properties.datacenterContainer}/${item.properties.displayName}`
        return getLabel(a).localeCompare(getLabel(b))
      })
      return vms
    })
  }

  static getVmSizes(info: Assessment): Promise<VmSize[]> {
    return Api.get(Util.buildUrl(`/subscriptions/${info.connectionInfo.subscription_id}/providers/Microsoft.Compute/locations/${info.location}/vmSizes`, '2017-12-01')).then(response => {
      return Util.validateResponse(response, response.data.value)
    })
  }
}

export default AzureSource
