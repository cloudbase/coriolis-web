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
import { OptionsSchemaPlugin } from '../plugins/endpoint'

import { servicesUrl } from '../config'
import type { WizardData } from '../types/WizardData'
import type { MainItem } from '../types/MainItem'

class WizardSource {
  static create(type: string, data: WizardData): Promise<MainItem> {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      const parser = data.target ? OptionsSchemaPlugin[data.target.type] || OptionsSchemaPlugin.default : OptionsSchemaPlugin.default
      let payload = {}
      payload[type] = {
        origin_endpoint_id: data.source ? data.source.id : 'null',
        destination_endpoint_id: data.target ? data.target.id : 'null',
        destination_environment: parser.getDestinationEnv(data),
        instances: data.selectedInstances ? data.selectedInstances.map(i => i.instance_name) : 'null',
        notes: '',
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
