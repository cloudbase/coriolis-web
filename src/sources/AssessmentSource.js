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

import type { MigrationInfo } from '../types/Assessment'
import type { MainItem } from '../types/MainItem'
import Api from '../utils/ApiCaller'
import { servicesUrl } from '../config'
import notificationStore from '../stores/NotificationStore'

class AssessmentSourceUtils {
  static getDestinationEnv(data: MigrationInfo) {
    let env = { ...data.destinationEnv }
    env.network_map = {}
    if (data.networks && data.networks.length) {
      data.networks.forEach(mapping => {
        env.network_map[mapping.sourceNic.network_name] = mapping.targetNetwork.name
      })
    }
    env.vm_size = data.vmSizes[Object.keys(data.vmSizes).filter(k => k === data.selectedInstances[0].instance_name)[0]]
    return env
  }
}

class AssessmentSource {
  static migrate(data: MigrationInfo): Promise<MainItem> {
    return new Promise((resolve, reject) => {
      let projectId = cookie.get('projectId')
      let useReplicaField = data.options.find(o => o.name === 'use_replica')
      let type = useReplicaField && useReplicaField.value ? 'replica' : 'migration'
      let payload = {}
      payload[type] = {
        origin_endpoint_id: data.source ? data.source.id : 'null',
        destination_endpoint_id: data.target.id,
        destination_environment: AssessmentSourceUtils.getDestinationEnv(data),
        instances: data.selectedInstances.map(i => i.instance_name),
        notes: '',
        security_groups: ['testgroup'],
      }

      data.options.forEach(option => {
        if (option.name === 'use_replica') {
          return
        }
        if (option.value !== null && option.value !== undefined) {
          payload[type][option.name] = option.value
        }
      })

      Api.send({
        url: `${servicesUrl.coriolis}/${projectId || 'null'}/${type}s`,
        method: 'POST',
        data: payload,
      }).then(response => {
        resolve(response.data[type])
      }, reject).catch(reject)
    })
  }

  static migrateMultiple(data: MigrationInfo): Promise<MainItem[]> {
    return new Promise((resolve, reject) => {
      let items = []
      let count = 0

      data.selectedInstances.forEach(instance => {
        let newData = { ...data }
        newData.selectedInstances = [instance]
        this.migrate(newData).then(item => {
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
          notificationStore.notify(`Error while migrating instance ${instance.name}`, 'error', {
            persist: true,
            persistInfo: { title: 'Migration creation error' },
          })
        })
      })
    })
  }
}

export default AssessmentSource
