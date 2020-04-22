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
import type { Assessment, VmItem, Location } from '../types/Assessment'
import type { NetworkMap } from '../types/Network'
import type { Endpoint } from '../types/Endpoint'

export type LocalData = {
  endpoint: Endpoint,
  sourceEndpoint: ?Endpoint,
  connectionInfo: any,
  resourceGroupName: string,
  locationName: string,
  assessmentName: string,
  groupName: string,
  projectName: string,
  selectedVmSizes: { [string]: string },
  selectedVms: string[],
  selectedNetworks: NetworkMap[],
  [string]: mixed,
}

class AzureLocalStorage {
  static loadLocalData(assessmentName: string): ?LocalData {
    let localDataArray: LocalData[] = JSON.parse(localStorage.getItem(`assessments-${cookie.get('projectId') || ''}`) || '[]')
    return localDataArray.find(a => a.assessmentName === assessmentName)
  }

  static setLocalData(data: LocalData) {
    let localDataArray: LocalData[] = JSON.parse(localStorage.getItem(`assessments-${cookie.get('projectId') || ''}`) || '[]')
    let assessmentIndex = localDataArray.findIndex(a => a.assessmentName === data.assessmentName)
    if (assessmentIndex > -1) {
      localDataArray.splice(assessmentIndex, 1)
    }
    localDataArray.push(data)
    localStorage.setItem(`assessments-${cookie.get('projectId') || ''}`, JSON.stringify(localDataArray))
  }
}

class AzureStore {
  @observable authenticating: boolean = false
  @observable loadingResourceGroups: boolean = false
  @observable assessmentResourceGroups: $PropertyType<Assessment, 'group'>[] = []
  @observable coriolisResourceGroups: string[] = []
  @observable loadingAssessments: boolean = false
  @observable loadingAssessmentDetails: boolean = false
  @observable assessmentDetails: ?Assessment = null
  @observable assessments: Assessment[] = []
  @observable loadingAssessedVms: boolean = false
  @observable assessedVms: VmItem[] = []
  @observable loadingVmSizes: boolean = false
  // @observable vmSizes: VmSize[] = []
  @observable assessmentsProjectId: string = ''
  @observable locations: Location[] = []
  @observable localData: ?LocalData = null
  @observable vmSizes: string[] = []

  @action loadLocalData(assessmentName: string): boolean {
    this.localData = AzureLocalStorage.loadLocalData(assessmentName)
    return Boolean(this.localData)
  }

  @action setLocalData(data: LocalData) {
    data.selectedVmSizes = data.selectedVmSizes || {}
    data.selectedVms = data.selectedVms || []
    data.selectedNetworks = data.selectedNetworks || []

    this.localData = data
    AzureLocalStorage.setLocalData(data)
  }

  @action updateResourceGroup(resourceGroupName: string) {
    if (!this.localData) {
      return
    }
    this.localData.resourceGroupName = resourceGroupName
    AzureLocalStorage.setLocalData(this.localData)
  }

  @action updateNetworkMap(selectedNetworks: NetworkMap[]) {
    if (!this.localData) {
      return
    }
    this.localData.selectedNetworks = selectedNetworks
    AzureLocalStorage.setLocalData(this.localData)
  }

  @action updateSourceEndpoint(sourceEndpoint: ?Endpoint) {
    if (!this.localData) {
      return
    }
    this.localData.sourceEndpoint = sourceEndpoint
    AzureLocalStorage.setLocalData(this.localData)
  }

  @action updateSelectedVms(selectedVms: string[]) {
    if (!this.localData) {
      return
    }
    this.localData.selectedVms = selectedVms
    AzureLocalStorage.setLocalData(this.localData)
  }

  @action updateVmSize(vmId: string, vmSize: string) {
    if (!this.localData) {
      return
    }
    this.localData.selectedVmSizes[vmId] = vmSize
    if (this.localData) {
      AzureLocalStorage.setLocalData(this.localData)
    }
  }

  @action updateVmSizes(vmSizes: { [string]: string }) {
    if (!this.localData) {
      return
    }
    this.localData.selectedVmSizes = vmSizes
    AzureLocalStorage.setLocalData(this.localData)
  }

  @action updateLocation(locationName: string) {
    if (!this.localData) {
      return
    }
    this.localData.locationName = locationName
    AzureLocalStorage.setLocalData(this.localData)
  }

  @action updateTargetEndpoint(endpoint: Endpoint) {
    if (!this.localData) {
      return
    }
    this.localData.endpoint = endpoint
    AzureLocalStorage.setLocalData(this.localData)
  }

  @action authenticate(connectionInfo: any): Promise<void> {
    this.authenticating = true
    return AzureSource.authenticate(connectionInfo).then(() => {
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
      this.assessmentResourceGroups = groups
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
    options?: { backgroundLoading: boolean, skipLog?: boolean },
  ): Promise<void> {
    let cookieProjectId = cookie.get('projectId') || 'null'
    if (projectId !== cookieProjectId) {
      return Promise.resolve()
    }

    if (!options || !options.backgroundLoading) {
      this.loadingAssessments = true
    }
    return AzureSource.getAssessments(subscriptionId, resourceGroupName, options && options.skipLog).then((assessments: Assessment[]) => {
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

  @action saveLocations(locations: Location[]) {
    this.locations = locations
  }

  @action saveResourceGroups(resourceGroups: string[]) {
    this.coriolisResourceGroups = resourceGroups
  }

  @action saveTargetVmSizes(targetVmSizes: string[]) {
    this.vmSizes = targetVmSizes
  }

  @action setLocation(location: string) {
    if (!this.localData || this.localData.locationName) {
      return
    }
    this.localData.locationName = location
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

  // @action getVmSizes(info: Assessment): Promise<void> {
  //   this.loadingVmSizes = true

  //   return AzureSource.getVmSizes(info).then((sizes: VmSize[]) => {
  //     this.loadingVmSizes = false
  //     this.vmSizes = sizes
  //   }).catch(() => {
  //     this.loadingVmSizes = false
  //   })
  // }

  @action clearAssessedVms() {
    this.assessedVms = []
  }

  @action clearAssessments() {
    this.assessmentResourceGroups = []
    this.assessments = []
    this.locations = []
    this.coriolisResourceGroups = []
  }
}

export default new AzureStore()
