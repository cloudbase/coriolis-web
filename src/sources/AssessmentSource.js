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

import type { MigrationInfo } from '../types/Assessment'
import type { MainItem } from '../types/MainItem'
import Api from '../utils/ApiCaller'
import { servicesUrl } from '../config'
import notificationStore from '../stores/NotificationStore'

class AssessmentSourceUtils {
  static getDestinationEnv(data: MigrationInfo) {
    let env = {}
    if (data.networks && data.networks.length) {
      env.network_map = {}
      data.networks.forEach(mapping => {
        env.network_map[mapping.sourceNic.network_name] = mapping.targetNetwork.name
      })
    }
    let vmSize = data.vmSizes[Object.keys(data.vmSizes).filter(k => k === data.selectedInstances[0].instance_name)[0]]
    if (vmSize) {
      env.vm_size = vmSize
    }
    let skipFields = ['use_replica', 'separate_vm', 'shutdown_instances', 'skip_os_morphing']
    Object.keys(data.fieldValues).filter(f => !skipFields.find(sf => sf === f)).forEach(fieldName => {
      if (data.fieldValues[fieldName] != null) {
        env[fieldName] = data.fieldValues[fieldName]
      }
    })

    return env
  }
}

class AssessmentSource {
  static migrate(data: MigrationInfo): Promise<MainItem> {
    let type = data.fieldValues.use_replica ? 'replica' : 'migration'
    let payload: any = {}
    payload[type] = {
      origin_endpoint_id: data.source ? data.source.id : 'null',
      destination_endpoint_id: data.target.id,
      destination_environment: AssessmentSourceUtils.getDestinationEnv(data),
      instances: data.selectedInstances.map(i => i.instance_name),
      notes: '',
      security_groups: ['testgroup'],
    }

    if (type === 'migration') {
      payload[type].skip_os_morphing = data.fieldValues.skip_os_morphing
    }

    return Api.send({
      url: `${servicesUrl.coriolis}/${Api.projectId}/${type}s`,
      method: 'POST',
      data: payload,
    }).then(response => {
      return response.data[type]
    })
  }

  static migrateMultiple(data: MigrationInfo): Promise<MainItem[]> {
    return Promise.all(data.selectedInstances.map(instance => {
      let newData = { ...data }
      newData.selectedInstances = [instance]
      return this.migrate(newData).catch(() => {
        notificationStore.alert(`Error while migrating instance ${instance.name}`, 'error')
        return null
      })
    })).then(items => items.filter(Boolean).map(i => i))
  }
}

export default AssessmentSource
