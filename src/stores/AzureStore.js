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

import { observable, action } from 'mobx'
import cookie from 'js-cookie'

import AzureSource from '../sources/AzureSource'
import type { Assessment, VmItem, VmSize } from '../types/Assessment'

class AzureStore {
  @observable authenticating: boolean = false
  @observable loadingResourceGroups: boolean = false
  @observable resourceGroups: $PropertyType<Assessment, 'group'>[] = []
  @observable loadingAssessments: boolean = false
  @observable loadingAssessmentDetails: boolean = false
  @observable assessmentDetails: ?Assessment = null
  @observable assessments: Assessment[] = []
  @observable loadingAssessedVms: boolean = false
  @observable assessedVms: VmItem[] = []
  @observable loadingVmSizes: boolean = false
  @observable vmSizes: VmSize[] = []
  @observable assessmentsProjectId: string = ''

  @action authenticate(username: string, password: string): Promise<void> {
    this.authenticating = true
    return AzureSource.authenticate(username, password).then(() => {
      this.authenticating = false
    }).catch(() => {
      this.authenticating = false
      return Promise.reject()
    })
  }

  @action getResourceGroups(subscriptionId: string): Promise<void> {
    this.loadingResourceGroups = true

    return AzureSource.getResourceGroups(subscriptionId).then((groups: $PropertyType<Assessment, 'group'>[]) => {
      this.loadingResourceGroups = false
      this.resourceGroups = groups
    }).catch(() => {
      this.loadingResourceGroups = false
    })
  }

  @action isLoadedForCurrentProject() {
    return this.assessmentsProjectId === (cookie.get('projectId') || 'null')
  }

  @action getAssessments(
    subscriptionId: string,
    resourceGroupName: string,
    projectId: string,
    options?: { backgroundLoading: boolean },
  ): Promise<void> {
    let cookieProjectId = cookie.get('projectId') || 'null'
    if (projectId !== cookieProjectId) {
      return Promise.resolve()
    }

    if (!options || !options.backgroundLoading) {
      this.loadingAssessments = true
    }
    return AzureSource.getAssessments(subscriptionId, resourceGroupName).then((assessments: Assessment[]) => {
      this.loadingAssessments = false

      cookieProjectId = cookie.get('projectId') || 'null'
      if (projectId !== cookieProjectId) {
        return
      }
      this.assessmentsProjectId = cookieProjectId
      this.assessments = assessments
    })
  }

  @action getAssessmentDetails(info: Assessment): Promise<void> {
    this.loadingAssessmentDetails = true
    return AzureSource.getAssessmentDetails(info).then((assessment: Assessment) => {
      this.loadingAssessmentDetails = false
      this.assessmentDetails = assessment
    }).catch(() => {
      this.loadingAssessmentDetails = false
    })
  }

  @action clearAssessmentDetails() {
    this.assessmentDetails = null
    this.assessedVms = []
  }

  @action getAssessedVms(info: Assessment): Promise<void> {
    this.loadingAssessedVms = true

    return AzureSource.getAssessedVms(info).then((vms: VmItem[]) => {
      this.loadingAssessedVms = false
      this.assessedVms = vms
    }).catch(() => {
      this.loadingAssessedVms = false
    })
  }

  @action getVmSizes(info: Assessment): Promise<void> {
    this.loadingVmSizes = true

    return AzureSource.getVmSizes(info).then((sizes: VmSize[]) => {
      this.loadingVmSizes = false
      this.vmSizes = sizes
    }).catch(() => {
      this.loadingVmSizes = false
    })
  }

  @action clearAssessedVms() {
    this.assessedVms = []
  }

  @action clearAssessments() {
    this.resourceGroups = []
    this.assessments = []
  }
}

export default new AzureStore()
