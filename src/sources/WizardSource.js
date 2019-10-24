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

import Api from '../utils/ApiCaller'
import notificationStore from '../stores/NotificationStore'
import { OptionsSchemaPlugin } from '../plugins/endpoint'

import { servicesUrl } from '../constants'
import type { WizardData } from '../types/WizardData'
import type { StorageMap } from '../types/Endpoint'
import type { MainItem } from '../types/MainItem'

class WizardSource {
  async create(type: string, data: WizardData, storageMap: StorageMap[]): Promise<MainItem> {
    const sourceParser = data.source ? OptionsSchemaPlugin[data.source.type] || OptionsSchemaPlugin.default : OptionsSchemaPlugin.default
    const destParser = data.target ? OptionsSchemaPlugin[data.target.type] || OptionsSchemaPlugin.default : OptionsSchemaPlugin.default
    let payload = {}
    let defaultStorage: ?string = data.destOptions && data.destOptions.default_storage
    payload[type] = {
      origin_endpoint_id: data.source ? data.source.id : 'null',
      destination_endpoint_id: data.target ? data.target.id : 'null',
      destination_environment: destParser.getDestinationEnv(data.destOptions),
      network_map: destParser.getNetworkMap(data.networks),
      instances: data.selectedInstances ? data.selectedInstances.map(i => i.instance_name || i.name) : 'null',
      storage_mappings: destParser.getStorageMap(defaultStorage, storageMap),
      notes: data.destOptions ? data.destOptions.description || '' : '',
    }

    if (data.destOptions && data.destOptions.skip_os_morphing != null) {
      payload[type].skip_os_morphing = data.destOptions.skip_os_morphing
    }

    if (data.sourceOptions) {
      payload[type].source_environment = sourceParser.getDestinationEnv(data.sourceOptions)
    }

    if (type === 'migration') {
      payload[type].shutdown_instances = Boolean(data.destOptions && data.destOptions.shutdown_instances)
      payload[type].replication_count = (data.destOptions && data.destOptions.replication_count) || 2
    }

    let response = await Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/${type}s`,
      method: 'POST',
      data: payload,
    })
    return response.data[type]
  }

  async createMultiple(type: string, data: WizardData, storageMap: StorageMap[]): Promise<MainItem[]> {
    if (!data.selectedInstances) {
      throw new Error('No selected instances')
    }
    let mainItems = await Promise.all(data.selectedInstances.map(async instance => {
      let newData = { ...data }
      newData.selectedInstances = [instance]
      try {
        let mainItem: MainItem = await this.create(type, newData, storageMap)
        return mainItem
      } catch (err) {
        notificationStore.alert(`Error while creating ${type} for instance ${instance.name}`, 'error')
        return null
      }
    }))
    return mainItems.filter(Boolean).map(i => i)
  }

  setUrlState(data: any) {
    let locationExp = /.*?(?:\?|$)/.exec(window.location.href)
    if (!locationExp) {
      return
    }
    let location = locationExp[0].replace('?', '')
    window.history.replaceState({}, null, `${location}?d=${btoa(JSON.stringify(data))}`)
  }

  getUrlState() {
    let dataExpExec = /\?d=(.*)/.exec(window.location.href)
    let result = null
    try {
      result = dataExpExec && JSON.parse(atob(dataExpExec[1]))
    } catch (err) {
      console.error(err)
    }
    return result
  }
}

export default new WizardSource()
