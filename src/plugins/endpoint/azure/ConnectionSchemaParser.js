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

import {
  connectionSchemaToFields,
  defaultSchemaToFields,
  generateField,
  fieldsToPayload,
} from '../default/ConnectionSchemaParser'

const azureConnectionParse = schema => {
  let commonFields = connectionSchemaToFields(schema).filter(f => f.type !== 'object' && f.name !== 'secret_ref' && Object.keys(f).findIndex(k => k === 'enum') === -1)

  let getOption = name => {
    return {
      name,
      type: 'radio',
      fields: [
        ...connectionSchemaToFields(schema.properties[name]),
        ...commonFields,
      ],
    }
  }

  let radioGroup = {
    name: 'login_type',
    default: 'user_credentials',
    type: 'radio-group',
    items: [getOption('user_credentials'), getOption('service_principal_credentials')],
  }

  let cloudProfileDropdown = {
    name: 'cloud_profile',
    type: 'string',
    ...schema.properties.cloud_profile,
    custom_cloud_fields: [
      ...defaultSchemaToFields(schema.properties.custom_cloud_properties.properties.endpoints),
      ...defaultSchemaToFields(schema.properties.custom_cloud_properties.properties.suffixes),
    ],
  }

  return [radioGroup, cloudProfileDropdown]
}

export default class ConnectionSchemaParser {
  static parseSchemaToFields(schema) {
    let fields = azureConnectionParse(schema)

    fields = [
      generateField('name', 'Endpoint Name', true),
      generateField('description', 'Endpoint Description'),
      ...fields,
    ]

    return fields
  }

  static parseFieldsToPayload(data, schema) {
    let payload = {}

    payload.name = data.name
    payload.description = data.description

    let connectionInfo = fieldsToPayload(data, schema)
    connectionInfo[data.login_type] = fieldsToPayload(data, schema.properties[data.login_type])

    if (data.cloud_profile === 'CustomCloud') {
      connectionInfo.custom_cloud_properties = {
        endpoints: {
          ...fieldsToPayload(data, schema.properties.custom_cloud_properties.properties.endpoints),
        },
        suffixes: {
          ...fieldsToPayload(data, schema.properties.custom_cloud_properties.properties.suffixes),
        },
      }
    }

    if (data.secret_ref) {
      connectionInfo.secret_ref = data.secret_ref
    }

    payload.connection_info = connectionInfo

    return payload
  }
}
