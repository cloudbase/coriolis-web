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

import Api from '@src/utils/ApiCaller'
import { OptionsSchemaPlugin } from '@src/plugins'

import DomUtils from '@src/utils/DomUtils'
import configLoader from '@src/utils/Config'

import type { WizardData } from '@src/@types/WizardData'
import type { StorageMap } from '@src/@types/Endpoint'
import type { InstanceScript } from '@src/@types/Instance'
import DefaultOptionsSchemaParser from '@src/plugins/default/OptionsSchemaPlugin'
import { TransferItem } from '@src/@types/MainItem'
import { INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS } from '@src/components/modules/WizardModule/WizardOptions/WizardOptions'

class WizardSource {
  async create(
    type: string,
    data: WizardData,
    defaultStorage: { value: string | null, busType?: string | null } | undefined,
    storageMap: StorageMap[],
    uploadedUserScripts: InstanceScript[],
  ): Promise<TransferItem> {
    const sourceParser = data.source
      ? OptionsSchemaPlugin.for(data.source.type) : DefaultOptionsSchemaParser
    const destParser = data.target
      ? OptionsSchemaPlugin.for(data.target.type) : DefaultOptionsSchemaParser
    const payload: any = {}
    payload[type] = {
      origin_endpoint_id: data.source ? data.source.id : 'null',
      destination_endpoint_id: data.target ? data.target.id : 'null',
      network_map: destParser.getNetworkMap(data.networks),
      instances: data.selectedInstances ? data.selectedInstances.map(i => i.instance_name || i.id) : 'null',
      storage_mappings: destParser.getStorageMap(defaultStorage, storageMap),
      notes: data.destOptions?.title || '',
    }

    if (data.destOptions && data.destOptions.skip_os_morphing != null) {
      payload[type].skip_os_morphing = data.destOptions.skip_os_morphing
    }

    if (data.sourceOptions) {
      const sourceEnv = sourceParser.getDestinationEnv(data.sourceOptions)
      if (data.sourceOptions.minion_pool_id) {
        payload[type].origin_minion_pool_id = data.sourceOptions.minion_pool_id
      }
      payload[type].source_environment = sourceEnv
    }

    const destEnv = destParser.getDestinationEnv(data.destOptions)
    if (data.destOptions?.minion_pool_id) {
      payload[type].destination_minion_pool_id = data.destOptions.minion_pool_id
    }

    const poolMappings = destEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS]
    if (poolMappings) {
      Object.keys(poolMappings).forEach(instanceId => {
        if (poolMappings[instanceId]
          && payload[type].instances.find((i: string) => i === instanceId)) {
          if (!payload[type][
            INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS
          ]) {
            payload[type][
              INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS
            ] = {}
          }
          payload[type][
            INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS
          ][instanceId] = poolMappings[instanceId]
        }
      })
    }

    delete destEnv[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS]

    payload[type].destination_environment = destEnv

    payload[type].shutdown_instances = Boolean(
      data.destOptions && data.destOptions.shutdown_instances,
    )

    if (uploadedUserScripts.length) {
      payload[type].user_scripts = destParser.getUserScripts(uploadedUserScripts, [], {})
    }

    if (type === 'migration') {
      payload[type].replication_count = data.destOptions?.replication_count || 2
    }

    const response = await Api.send({
      url: `${configLoader.config.servicesUrls.coriolis}/${Api.projectId}/${type}s`,
      method: 'POST',
      data: payload,
    })
    return response.data[type]
  }

  async createMultiple(
    type: string,
    data: WizardData,
    defaultStorage: { value: string | null, busType?: string | null } | undefined,
    storageMap: StorageMap[],
    uploadedUserScripts: InstanceScript[],
  ) {
    if (!data.selectedInstances) {
      throw new Error('No selected instances')
    }
    const mainItems = await Promise.all(data.selectedInstances.map(async instance => {
      const newData = { ...data }
      newData.selectedInstances = [instance]
      const newDestOptions: any = { ...newData.destOptions }
      newDestOptions.title = instance.name || instance.instance_name || instance.id
      newData.destOptions = newDestOptions

      let mainItem: TransferItem | null = null
      try {
        mainItem = await this.create(type, newData, defaultStorage, storageMap, uploadedUserScripts)
      } finally {
        // If an there's an error with the request, return null, don't break the loop.
        // eslint-disable-next-line no-unsafe-finally
        return mainItem
      }
    }))
    return mainItems
  }

  setUrlState(data: any) {
    const locationExp = /.*?(?:\?|$)/.exec(window.location.href)
    if (!locationExp || DomUtils.isSafari()) {
      return
    }
    const location = locationExp[0].replace('?', '')
    window.history.replaceState({}, '', `${location}?d=${DomUtils.encodeToBase64Url(data)}`)
  }

  getUrlState() {
    const dataExpExec = /\?d=(.*)/.exec(window.location.href)
    let result = null
    try {
      result = dataExpExec && DomUtils.decodeFromBase64Url(dataExpExec[1])
    } catch (err) {
      console.error(err)
    }
    return result
  }
}

export default new WizardSource()
