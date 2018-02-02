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

let parseToFields = schema => {
  let fields = Object.keys(schema.properties).map(fieldName => {
    let field = {
      ...schema.properties[fieldName],
      name: fieldName,
      required: schema.required && schema.required.find(k => k === fieldName) ? true : fieldName === 'username' || fieldName === 'password',
    }
    return field
  })

  return fields
}

let connectionParseToFields = schema => {
  let fields = parseToFields(schema)

  let sortPriority = { username: 1, password: 2 }
  fields.sort((a, b) => {
    if (sortPriority[a.name] && sortPriority[b.name]) {
      return sortPriority[a.name] - sortPriority[b.name]
    }
    if (sortPriority[a.name] || (a.required && !b.required)) {
      return -1
    }
    if (sortPriority[b.name] || (!a.required && b.required)) {
      return 1
    }
    return a.name.localeCompare(b.name)
  })

  return fields
}

let connectionParsersToFields = {
  general: schema => {
    return connectionParseToFields(schema.oneOf[0])
  },
  azure: schema => {
    let commonFields = connectionParseToFields(schema).filter(f => f.type !== 'object' && f.name !== 'secret_ref' && Object.keys(f).findIndex(k => k === 'enum') === -1)

    let getOption = (option) => {
      return {
        name: option,
        type: 'radio',
        fields: [
          ...connectionParseToFields(schema.properties[option]),
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
        ...parseToFields(schema.properties.custom_cloud_properties.properties.endpoints),
        ...parseToFields(schema.properties.custom_cloud_properties.properties.suffixes),
      ],
    }

    return [radioGroup, cloudProfileDropdown]
  },
}

let parseToPayload = (data, schema) => {
  let info = {}

  Object.keys(schema.properties).forEach(fieldName => {
    if (data[fieldName] && typeof data[fieldName] !== 'object') {
      info[fieldName] = data[fieldName]
    }
  })

  return info
}

let parsersToPayload = {
  general: (data, schema) => {
    return parseToPayload(data, schema.oneOf[0])
  },
  azure: (data, schema) => {
    let payload = parseToPayload(data, schema)
    payload[data.login_type] = parseToPayload(data, schema.properties[data.login_type])

    if (data.cloud_profile === 'CustomCloud') {
      payload.custom_cloud_properties = {
        endpoints: {
          ...parseToPayload(data, schema.properties.custom_cloud_properties.properties.endpoints),
        },
        suffixes: {
          ...parseToPayload(data, schema.properties.custom_cloud_properties.properties.suffixes),
        },
      }
    }

    return payload
  },
}

class SchemaParser {
  static storedConnectionsSchemas = {}

  static generateField(name, label, required = false, type = 'string', defaultValue = null) {
    let field = {
      name,
      label,
      type,
      required,
    }

    if (defaultValue) {
      field.default = defaultValue
    }

    return field
  }

  static connectionSchemaToFields(provider, schema) {
    if (!this.storedConnectionsSchemas[provider]) {
      this.storedConnectionsSchemas[provider] = schema
    }

    if (!connectionParsersToFields[provider]) {
      provider = 'general'
    }

    let fields = connectionParsersToFields[provider](schema)

    fields = [
      this.generateField('name', 'Endpoint Name', true),
      this.generateField('description', 'Endpoint Description'),
      ...fields,
    ]

    return fields
  }

  static optionsSchemaToFields(provider, schema) {
    let fields = parseToFields(schema.oneOf[0])
    fields.sort((a, b) => {
      if (a.required && !b.required) {
        return -1
      }

      if (!a.required && b.required) {
        return 1
      }

      return a.name.localeCompare(b.name)
    })
    return fields
  }

  static fieldsToPayload(data) {
    let storedSchema = this.storedConnectionsSchemas[data.type] || this.storedConnectionsSchemas.general
    let payload = {}

    payload.name = data.name
    payload.description = data.description

    if (parsersToPayload[data.type]) {
      payload.connection_info = parsersToPayload[data.type](data, storedSchema)
    } else {
      payload.connection_info = parsersToPayload.general(data, storedSchema)
    }

    if (data.secret_ref) {
      payload.connection_info.secret_ref = data.secret_ref
    }

    return payload
  }
}

export { SchemaParser }
