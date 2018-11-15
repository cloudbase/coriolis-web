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

import { servicesUrl } from '../config'
import type { WizardData } from '../types/WizardData'
import type { MainItem } from '../types/MainItem'

class WizardSource {
  static create(type: string, data: WizardData): Promise<MainItem> {
    const parser = data.target ? OptionsSchemaPlugin[data.target.type] || OptionsSchemaPlugin.default : OptionsSchemaPlugin.default
    let payload = {}
    payload[type] = {
      origin_endpoint_id: data.source ? data.source.id : 'null',
      destination_endpoint_id: data.target ? data.target.id : 'null',
      destination_environment: parser.getDestinationEnv(data),
      network_map: parser.getNetworkMap(data),
      instances: data.selectedInstances ? data.selectedInstances.map(i => i.instance_name) : 'null',
      notes: '',
    }

    if (data.options && data.options.skip_os_morphing != null) {
      payload[type].skip_os_morphing = data.options.skip_os_morphing
    }

    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/${type}s`,
      method: 'POST',
      data: payload,
    }).then(response => response.data[type])
  }

  static createMultiple(type: string, data: WizardData): Promise<MainItem[]> {
    if (!data.selectedInstances) {
      return Promise.reject('No selected instances')
    }

    return Promise.all(data.selectedInstances.map(instance => {
      let newData = { ...data }
      newData.selectedInstances = [instance]
      return WizardSource.create(type, newData).catch(() => {
        notificationStore.alert(`Error while creating ${type} for instance ${instance.name}`, 'error')
        return null
      })
    })).then(mainItems => mainItems.filter(Boolean).map(i => i))
  }

  static setPermalink(data: WizardData) {
    let hashExp = /(#\/wizard\/.*?)(?:\?|$)/

    if (!hashExp.test(window.location.hash)) {
      return
    }
    let hashExpExec = hashExp.exec(window.location.hash)
    let hash = hashExpExec ? hashExpExec[1] : 'undefined'
    window.history.replaceState({}, null, `${hash}?d=${btoa(JSON.stringify(data))}`)
  }

  static getDataFromPermalink() {
    let dataExp = /\?d=(.*)/

    if (!dataExp.test(window.location.hash)) {
      return null
    }

    let dataExpExec = dataExp.exec(window.location.hash)
    return JSON.parse(atob(dataExpExec ? dataExpExec[1] : 'undefined'))
  }
}

export default WizardSource
