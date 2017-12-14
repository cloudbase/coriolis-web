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

import AzureApiCaller from '../utils/AzureApiCaller'
import type { Assessment, VmItem, VmSize } from '../types/Assessment'

// $FlowIgnore
const resourceGroupsUrl = ({ subscriptionId }) => `/subscriptions/${subscriptionId}/resourceGroups`
const projectsUrl = ({ resourceGroupName, ...other }) => `${resourceGroupsUrl({ ...other })}/${resourceGroupName}/providers/Microsoft.Migrate/projects`
const groupsUrl = ({ projectName, ...other }) => `${projectsUrl({ ...other })}/${projectName}/groups`
const assessmentsUrl = ({ groupName, ...other }) => `${groupsUrl({ ...other })}/${groupName}/assessments`
const assessmentDetailsUrl = ({ assessmentName, ...other }) => `${assessmentsUrl({ ...other })}/${assessmentName}`
const assessedVmsUrl = ({ ...other }) => `${assessmentDetailsUrl({ ...other })}/assessedMachines`

class AzureSourceUtil {
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
}

class AzureSource {
  static authenticate(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      AzureApiCaller.send({
        url: '/azure-login',
        method: 'POST',
        data: { username, password },
      }).then(response => {
        let entries = Object.keys(response.tokenCache)[0]
        let accessToken = response.tokenCache[entries][0].accessToken
        AzureApiCaller.setHeader('Authorization', `Bearer ${accessToken}`)
        resolve(response)
      }, reject)
    })
  }

  static getResourceGroups(subscriptionId: string): Promise<$PropertyType<Assessment, 'group'>[]> {
    return new Promise((resolve, reject) => {
      AzureApiCaller.send({
        url: resourceGroupsUrl({ subscriptionId }),
      }, '2017-08-01').then(response => {
        resolve(response.value)
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
      AzureApiCaller.send({
        url: projectsUrl({ resourceGroupName, subscriptionId }),
      }).then(response => {
        let projects = response.value
        projectsQueue = projects.length

        if (projectsQueue === 0 && subscriptionId + resourceGroupName === this.reqId) {
          resolve([])
        }

        projects.forEach(project => {
          if (project.type !== 'Microsoft.Migrate/projects') {
            return
          }
          // Load Groups
          AzureApiCaller.send({
            url: groupsUrl({ projectName: project.name, subscriptionId, resourceGroupName }),
          }).then(response => {
            projectsQueue -= 1

            let groups = response.value
            groupsQueue = groups.length

            if (groupsQueue === 0 && subscriptionId + resourceGroupName === this.reqId) {
              resolve([])
            }

            groups.forEach(group => {
              // Load Assessments
              AzureApiCaller.send({
                url: assessmentsUrl({ subscriptionId, resourceGroupName, projectName: project.name, groupName: group.name }),
              }).then(response => {
                groupsQueue -= 1

                assessments = assessments.concat(response.value.map(a => ({ ...a, project, group })))
                AzureSourceUtil.checkQueues([groupsQueue, projectsQueue], [subscriptionId + resourceGroupName, this.reqId], () => { resolve(AzureSourceUtil.sortAssessments(assessments)) })
              }, () => { groupsQueue -= 1; AzureSourceUtil.checkQueues([groupsQueue, projectsQueue], [subscriptionId + resourceGroupName, this.reqId], () => { resolve(AzureSourceUtil.sortAssessments(assessments)) }) })
            })
          }, () => { projectsQueue -= 1; AzureSourceUtil.checkQueues([groupsQueue, projectsQueue], [subscriptionId + resourceGroupName, this.reqId], () => { resolve(AzureSourceUtil.sortAssessments(assessments)) }) })
        })
      }, reject)
    })
  }

  static getAssessmentDetails(info: Assessment): Promise<Assessment> {
    return new Promise((resolve, reject) => {
      AzureApiCaller.send({
        url: assessmentDetailsUrl({ ...info, subscriptionId: info.connectionInfo.subscription_id }),
      }).then(response => {
        let assessment = { ...response, ...info }
        resolve(assessment)
      }, reject)
    })
  }

  static getAssessedVms(info: Assessment): Promise<VmItem[]> {
    return new Promise((resolve, reject) => {
      AzureApiCaller.send({
        url: assessedVmsUrl({ ...info, subscriptionId: info.connectionInfo.subscription_id }),
      }).then(response => {
        let vms = response.value
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
      AzureApiCaller.send({
        // $FlowIgnore
        url: `/subscriptions/${info.connectionInfo.subscription_id}/providers/Microsoft.Compute/locations/${info.location}/vmSizes`,
      }, '2017-12-01').then(response => {
        resolve(response.value)
      }, reject)
    })
  }
}

export default AzureSource
