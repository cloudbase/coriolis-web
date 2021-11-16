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

import type { Schema } from '../../@types/Schema'
import type { Field } from '../../@types/Field'
import type { Endpoint } from '../../@types/Endpoint'

import DefaultConnectionSchemaParser from '../default/ConnectionSchemaPlugin'

const customSort = (fields: Field[]) => {
  const sortPriority: any = {
    name: 1,
    mapped_regions: 1.5,
    description: 2,
    username: 3,
    password: 4,
    auth_url: 5,
    project_name: 6,
    glance_api_version: 7,
    identity_api_version: 8,
    project_domain: 9,
    user_domain: 10,
  }
  fields.sort((a, b) => {
    if (sortPriority[a.name] && sortPriority[b.name]) {
      return sortPriority[a.name] - sortPriority[b.name]
    }
    if (sortPriority[a.name]) {
      return -1
    }
    if (sortPriority[b.name]) {
      return 1
    }
    return a.name.localeCompare(b.name)
  })

  return fields
}

export default class ConnectionSchemaParser {
  static parseSchemaToFields(schema: Schema): Field[] {
    const fields = DefaultConnectionSchemaParser.parseSchemaToFields(schema)
    const identityField = fields.find(f => f.name === 'identity_api_version')
    if (identityField && !identityField.default) {
      identityField.default = identityField.minimum
    }

    fields.find(f => f.name === 'ceph_options')?.properties?.forEach(f => { f.name = `ceph_options/${f.name}` })

    const createInputChoice = (name: string, field1Name: string, field2Name: string) => {
      const field1 = fields.find(f => f.name === field1Name)
      const field2 = fields.find(f => f.name === field2Name)
      if (field1 && field2) {
        field1.label = 'Name'
        field2.label = 'ID'
        const field: Field = {
          name,
          type: 'input-choice',
          items: [field1, field2],
        }
        fields.push(field)
      }
    }
    createInputChoice('project_domain', 'project_domain_name', 'project_domain_id')
    createInputChoice('user_domain', 'user_domain_name', 'user_domain_id')

    customSort(fields)
    fields.push({
      name: 'openstack_use_current_user',
      type: 'boolean',
    })
    return fields
  }

  static parseConnectionInfoToPayload(data: { [prop: string]: any }, schema: Schema) {
    if (data.openstack_use_current_user) {
      return {}
    }
    // eslint-disable-next-line no-param-reassign
    delete data.project_domain
    // eslint-disable-next-line no-param-reassign
    delete data.user_domain
    const payload = DefaultConnectionSchemaParser.parseConnectionInfoToPayload(data, schema)
    return payload
  }

  static parseConnectionResponse(endpoint: Endpoint) {
    if (!endpoint.connection_info || Object.keys(endpoint.connection_info).length === 0) {
      return {
        openstack_use_current_user: true,
        ...endpoint,
      }
    }

    return endpoint
  }
}
