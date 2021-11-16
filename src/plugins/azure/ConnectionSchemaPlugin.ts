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
  fieldsToPayload,
  generateBaseFields,
} from '../default/ConnectionSchemaPlugin'
import { Endpoint } from '../../@types/Endpoint'

const fieldsToPayloadUseDefaults = (
  data: any, schema: { properties: any },
) => {
  const info: any = {}

  Object.keys(schema.properties).forEach(fieldName => {
    if (typeof data[fieldName] === 'object') {
      return
    }
    if (data[fieldName]) {
      info[fieldName] = data[fieldName]
    } else if (schema.properties[fieldName].default) {
      info[fieldName] = schema.properties[fieldName].default
    }
  })

  return info
}

const azureConnectionParse = (
  schema: any,
) => {
  const commonFields = connectionSchemaToFields(schema).filter(f => f.type !== 'object' && f.name !== 'secret_ref' && Object.keys(f).findIndex(k => k === 'enum') === -1)

  const subscriptionIdField = commonFields.find(f => f.name === 'subscription_id')
  if (subscriptionIdField) {
    subscriptionIdField.required = true
  }

  const getOption = (name: string) => ({
    name,
    type: 'radio',
    fields: [
      ...connectionSchemaToFields(schema.properties[name]),
      ...commonFields,
    ],
  })

  const radioGroup = {
    name: 'login_type',
    type: 'radio-group',
    items: [getOption('user_credentials'), getOption('service_principal_credentials')],
  }

  const cloudProfileDropdown = {
    name: 'cloud_profile',
    type: 'string',
    required: true,
    ...schema.properties.cloud_profile,
    custom_cloud_fields: [
      ...defaultSchemaToFields(schema.properties.custom_cloud_properties.properties.endpoints),
      ...defaultSchemaToFields(schema.properties.custom_cloud_properties.properties.suffixes),
    ],
  }

  cloudProfileDropdown.custom_cloud_fields.sort(
    (a: { required: any; name: string }, b: { required: any; name: any }) => {
      if (a.required && !b.required) {
        return -1
      }
      if (!a.required && b.required) {
        return 1
      }
      return a.name.localeCompare(b.name)
    },
  )

  return [radioGroup, cloudProfileDropdown]
}

export default class ConnectionSchemaParser {
  static parseSchemaToFields(schema: any) {
    let fields = azureConnectionParse(schema)

    fields = [
      ...generateBaseFields(),
      ...fields,
    ]

    return fields
  }

  static parseConnectionInfoToPayload(data: any, schema: any) {
    const connectionInfo: any = fieldsToPayload(data, schema)
    const loginType = data.login_type || 'user_credentials'
    connectionInfo[loginType] = fieldsToPayload(data, schema.properties[loginType])

    if (!data.cloud_profile) {
      connectionInfo.cloud_profile = 'AzureCloud'
    }

    if (data.cloud_profile === 'CustomCloud') {
      connectionInfo.custom_cloud_properties = {
        endpoints: {
          ...fieldsToPayloadUseDefaults(data,
            schema.properties.custom_cloud_properties.properties.endpoints),
        },
        suffixes: {
          ...fieldsToPayloadUseDefaults(data,
            schema.properties.custom_cloud_properties.properties.suffixes),
        },
      }
    }

    if (data.secret_ref) {
      connectionInfo.secret_ref = data.secret_ref
    }

    return connectionInfo
  }

  static parseConnectionResponse(endpoint: Endpoint) {
    return endpoint
  }
}
