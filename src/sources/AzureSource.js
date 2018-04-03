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

  static responseIsValid(resolve, reject, response, resolveData) {
    if (response.data.error) {
      const error = response.data.error
      console.error('%c', 'color: #D0021B', `${error.code}: ${error.message}`)
      reject()
      return false
    }

    if (resolveData) {
      resolve(resolveData)
    }
    return true
  }
}

class AzureSource {
  static authenticate(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      Api.send({
        url: '/azure-login',
        method: 'POST',
        data: { username, password },
      }).then(response => {
        let entries = Object.keys(response.data.tokenCache)[0]
        let accessToken = response.data.tokenCache[entries][0].accessToken
        Api.setDefaultHeader('Authorization', `Bearer ${accessToken}`)
        resolve(response.data)
      }, reject)
    })
  }

  static getResourceGroups(subscriptionId: string): Promise<$PropertyType<Assessment, 'group'>[]> {
    return new Promise((resolve, reject) => {
      Api.get(Util.buildUrl(resourceGroupsUrl({ subscriptionId }), '2017-08-01')).then(response => {
        Util.responseIsValid(resolve, reject, response, response.data.value)
      }, reject)
    })
  }

  static reqId: string

  static getAssessments(subscriptionId: string, resourceGroupName: string): Promise<Assessment[]> {
    this.reqId = subscriptionId + resourceGroupName

    return new Promise((resolve, reject) => {
      let assessments = []
      let projectsQueue
      let groupsQueue = 0

      // Load projects
      Api.get(Util.buildUrl(projectsUrl({ resourceGroupName, subscriptionId }))).then(response => {
        if (!Util.responseIsValid(resolve, reject, response)) {
          return
        }

        let projects = response.data.value
        projectsQueue = projects.length

        if (projectsQueue === 0 && subscriptionId + resourceGroupName === this.reqId) {
          resolve([])
        }

        projects.forEach(project => {
          if (project.type !== 'Microsoft.Migrate/projects') {
            return
          }
          // Load Groups
          Api.get(Util.buildUrl(groupsUrl({ projectName: project.name, subscriptionId, resourceGroupName }))).then(response => {
            if (!Util.responseIsValid(resolve, reject, response)) {
              return
            }
            projectsQueue -= 1

            let groups = response.data.value
            groupsQueue = groups.length

            if (groupsQueue === 0 && subscriptionId + resourceGroupName === this.reqId) {
              resolve([])
            }

            groups.forEach(group => {
              // Load Assessments
              Api.get(Util.buildUrl(assessmentsUrl({ subscriptionId, resourceGroupName, projectName: project.name, groupName: group.name }))).then(response => {
                if (!Util.responseIsValid(resolve, reject, response)) {
                  return
                }
                groupsQueue -= 1

                assessments = assessments.concat(response.data.value.map(a => ({ ...a, project, group })))
                Util.checkQueues([groupsQueue, projectsQueue], [subscriptionId + resourceGroupName, this.reqId], () => { resolve(Util.sortAssessments(assessments)) })
              }, () => { groupsQueue -= 1; Util.checkQueues([groupsQueue, projectsQueue], [subscriptionId + resourceGroupName, this.reqId], () => { resolve(Util.sortAssessments(assessments)) }) })
            })
          }, () => { projectsQueue -= 1; Util.checkQueues([groupsQueue, projectsQueue], [subscriptionId + resourceGroupName, this.reqId], () => { resolve(Util.sortAssessments(assessments)) }) })
        })
      }, reject)
    })
  }

  static getAssessmentDetails(info: Assessment): Promise<Assessment> {
    return new Promise((resolve, reject) => {
      Api.get(Util.buildUrl(assessmentDetailsUrl({ ...info, subscriptionId: info.connectionInfo.subscription_id }))).then(response => {
        Util.responseIsValid(resolve, reject, response, { ...response.data, ...info })
      }, reject)
    })
  }

  static getAssessedVms(info: Assessment): Promise<VmItem[]> {
    return new Promise((resolve, reject) => {
      Api.get(Util.buildUrl(assessedVmsUrl({ ...info, subscriptionId: info.connectionInfo.subscription_id }))).then(response => {
        if (!Util.responseIsValid(resolve, reject, response)) {
          return
        }

        let vms = response.data.value
        vms.sort((a, b) => {
          let getLabel = item => `${item.properties.datacenterContainer}/${item.properties.displayName}`
          return getLabel(a).localeCompare(getLabel(b))
        })
        resolve(vms)
      }, reject)
    })
  }

  static getVmSizes(info: Assessment): Promise<VmSize[]> {
    return new Promise((resolve, reject) => {
      Api.get(Util.buildUrl(`/subscriptions/${info.connectionInfo.subscription_id}/providers/Microsoft.Compute/locations/${info.location}/vmSizes`, '2017-12-01')).then(response => {
        Util.responseIsValid(resolve, reject, response, response.data.value)
      }, reject)
    })
  }
}

export default AzureSource
