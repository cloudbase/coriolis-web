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

import type { Schema, SchemaProperties, SchemaDefinitions } from '../../../types/Schema'
import type { Field } from '../../../types/Field'

export const defaultSchemaToFields = (schema: SchemaProperties, schemaDefinitions?: ?SchemaDefinitions, parent?: string): any[] => {
  let fields = Object.keys(schema.properties).map(fieldName => {
    let properties = schema.properties[fieldName]

    if (typeof schema.properties[fieldName].$ref === 'string' && schemaDefinitions) {
      const definitionName = schema.properties[fieldName].$ref.substr(schema.properties[fieldName].$ref.lastIndexOf('/') + 1)
      properties = schemaDefinitions[definitionName]
      return {
        name: fieldName,
        type: properties.type ? properties.type : '',
        properties: properties.properties ? defaultSchemaToFields(properties, null, fieldName) : [],
      }
    }

    return {
      ...properties,
      name: parent ? `${parent}/${fieldName}` : fieldName,
      required: schema.required && schema.required.find(k => k === fieldName) ? true : fieldName === 'username' || fieldName === 'password',
    }
  })

  return fields
}

export const connectionSchemaToFields = (schema: SchemaProperties) => {
  let fields = defaultSchemaToFields(schema)

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

export const generateField = (name: string, label: string, required: boolean = false, type: string = 'string', defaultValue: any = null) => {
  let field = {
    name,
    label,
    type,
    required,
    default: undefined,
  }

  if (defaultValue) {
    field.default = defaultValue
  }

  return field
}

export const fieldsToPayload = (data: { [string]: mixed }, schema: SchemaProperties, skipUsingDefaults: boolean = false) => {
  let info = {}

  Object.keys(schema.properties).forEach(fieldName => {
    if (data[fieldName] && typeof data[fieldName] !== 'object') {
      info[fieldName] = data[fieldName]
    } else if (
      !data[fieldName] &&
      schema.required && schema.required.find(f => f === fieldName) &&
      schema.properties[fieldName].default && !skipUsingDefaults
    ) {
      info[fieldName] = schema.properties[fieldName].default
    }
  })

  return info
}

export default class ConnectionSchemaParser {
  static parseSchemaToFields(schema: Schema): Field[] {
    let fields = connectionSchemaToFields(schema.oneOf[0])

    fields = [
      generateField('name', 'Endpoint Name', true),
      generateField('description', 'Endpoint Description'),
      ...fields,
    ]

    return fields
  }

  static parseFieldsToPayload(data: { [string]: mixed }, schema: Schema, skipUsingDefaults: boolean = false) {
    let payload = {}

    payload.name = data.name
    payload.description = data.description

    payload.connection_info = fieldsToPayload(data, schema.oneOf[0], skipUsingDefaults)

    if (data.secret_ref) {
      payload.connection_info.secret_ref = data.secret_ref
    }

    return payload
  }
}
