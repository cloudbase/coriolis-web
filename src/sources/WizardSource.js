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

import cookie from 'js-cookie'

import Api from '../utils/ApiCaller'
import NotificationActions from '../actions/NotificationActions'
import { servicesUrl, executionOptions } from '../config'

class WizardSourceUtils {
  static getDestinationEnv(data) {
    let env = {}
    let specialOptions = ['execute_now', 'separate_vm', 'skip_os_morphing'].concat(executionOptions.map(o => o.name))

    if (data.options) {
      Object.keys(data.options).forEach(optionName => {
        if (specialOptions.find(o => o === optionName)
          || data.options[optionName] === null || data.options[optionName] === undefined) {
          return
        }
        env[optionName] = data.options[optionName]
      })
    }

    env.network_map = {}
    if (data.networks && data.networks.length) {
      data.networks.forEach(mapping => {
        env.network_map[mapping.sourceNic.network_name] = mapping.targetNetwork.name
      })
    }

    return env
  }
}

class WizardSource {
  static create(type, data) {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')

      let payload = {}
      payload[type] = {
        origin_endpoint_id: data.source.id,
        destination_endpoint_id: data.target.id,
        destination_environment: WizardSourceUtils.getDestinationEnv(data),
        instances: data.selectedInstances.map(i => i.instance_name),
        notes: '',
        security_groups: ['testgroup'],
      }

      if (data.options && data.options.skip_os_morphing !== null && data.options.skip_os_morphing !== undefined) {
        payload[type].skip_os_morphing = data.options.skip_os_morphing
      }

      Api.sendAjaxRequest({
        url: `${servicesUrl.coriolis}/${projectId}/${type}s`,
        method: 'POST',
        data: payload,
      }).then(response => {
        resolve(response.data[type])
      }, reject).catch(reject)
    })
  }

  static createMultiple(type, data) {
    return new Promise((resolve, reject) => {
      let items = []
      let count = 0

      data.selectedInstances.forEach(instance => {
        let newData = { ...data }
        newData.selectedInstances = [instance]
        WizardSource.create(type, newData).then(item => {
          count += 1
          items.push(item)
          if (count === data.selectedInstances.length) {
            if (items.length > 0) {
              resolve(items)
            } else {
              reject()
            }
          }
        }, () => {
          count += 1
          NotificationActions.notify(`Error while creating ${type} for instance ${instance.name}`, 'error')
        })
      })
    })
  }
}

export default WizardSource
