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

import cookie from 'js-cookie'

import Api from '../utils/ApiCaller'
import notificationStore from '../stores/NotificationStore'
import { servicesUrl, executionOptions } from '../config'
import type { WizardData } from '../types/WizardData'
import type { MainItem } from '../types/MainItem'

class WizardSourceUtils {
  static getDestinationEnv(data) {
    let env = {}
    let specialOptions = ['execute_now', 'separate_vm', 'skip_os_morphing', 'windows_image', 'linux_image'].concat(executionOptions.map(o => o.name))

    if (data.options) {
      Object.keys(data.options).forEach(optionName => {
        if (specialOptions.find(o => o === optionName)
          // $FlowIssue
          || data.options[optionName] === null || data.options[optionName] === undefined) {
          return
        }
        if (optionName.indexOf('/') > 0) {
          let parentName = optionName.substr(0, optionName.lastIndexOf('/'))
          if (!env[parentName]) {
            env[parentName] = {}
          }
          env[parentName][optionName.substr(optionName.lastIndexOf('/') + 1)] = data.options ? data.options[optionName] : null
        } else {
          env[optionName] = data.options ? data.options[optionName] : null
        }
      })
    }

    env.network_map = {}
    if (data.networks && data.networks.length) {
      data.networks.forEach(mapping => {
        env.network_map[mapping.sourceNic.network_name] = mapping.targetNetwork.id
      })
    }
    env.migr_image_map = {}
    if (data.options && data.options.windows_image) {
      env.migr_image_map.windows = data.options.windows_image
    }
    if (data.options && data.options.linux_image) {
      env.migr_image_map.linux = data.options.linux_image
    }

    return env
  }
}

class WizardSource {
  static create(type: string, data: WizardData): Promise<MainItem> {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      let payload = {}
      payload[type] = {
        origin_endpoint_id: data.source ? data.source.id : 'null',
        destination_endpoint_id: data.target ? data.target.id : 'null',
        destination_environment: WizardSourceUtils.getDestinationEnv(data),
        instances: data.selectedInstances ? data.selectedInstances.map(i => i.instance_name) : 'null',
        notes: '',
        security_groups: ['testgroup'],
      }

      if (data.options && data.options.skip_os_morphing !== null && data.options.skip_os_morphing !== undefined) {
        payload[type].skip_os_morphing = data.options.skip_os_morphing
      }

      Api.send({
        url: `${servicesUrl.coriolis}/${projectId || 'null'}/${type}s`,
        method: 'POST',
        data: payload,
      }).then(response => {
        resolve(response.data[type])
      }).catch(reject)
    })
  }

  static createMultiple(type: string, data: WizardData): Promise<MainItem[]> {
    return new Promise((resolve, reject) => {
      let items = []
      let count = 0

      if (!data.selectedInstances) {
        reject('No selected instances')
        return
      }

      data.selectedInstances.forEach(instance => {
        let newData = { ...data }
        newData.selectedInstances = [instance]
        WizardSource.create(type, newData).then(item => {
          count += 1
          items.push(item)
          // $FlowIssue
          if (count === data.selectedInstances.length) {
            if (items.length > 0) {
              resolve(items)
            } else {
              reject()
            }
          }
        }, () => {
          count += 1
          notificationStore.notify(`Error while creating ${type} for instance ${instance.name}`, 'error', {
            persist: true,
            persistInfo: { title: `${type} creation error` },
          })
        })
      })
    })
  }

  static setPermalink(data: WizardData) {
    let hashExp = /(#\/wizard\/.*?)(?:\?|$)/

    if (!hashExp.test(window.location.hash)) {
      return
    }

    let hash = hashExp.exec(window.location.hash)[1]
    window.history.replaceState({}, null, `${hash}?d=${btoa(JSON.stringify(data))}`)
  }

  static getDataFromPermalink() {
    let dataExp = /\?d=(.*)/

    if (!dataExp.test(window.location.hash)) {
      return null
    }

    return JSON.parse(atob(dataExp.exec(window.location.hash)[1]))
  }
}

export default WizardSource
