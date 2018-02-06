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

export const defaultSchemaToFields = schema => {
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

export const connectionSchemaToFields = schema => {
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

export const generateField = (name, label, required = false, type = 'string', defaultValue = null) => {
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

export const fieldsToPayload = (data, schema) => {
  let info = {}

  Object.keys(schema.properties).forEach(fieldName => {
    if (data[fieldName] && typeof data[fieldName] !== 'object') {
      info[fieldName] = data[fieldName]
    }
  })

  return info
}

export default class ConnectionSchemaParser {
  static parseSchemaToFields(schema) {
    let fields = connectionSchemaToFields(schema.oneOf[0])

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

    payload.connection_info = fieldsToPayload(data, schema.oneOf[0])

    if (data.secret_ref) {
      payload.connection_info.secret_ref = data.secret_ref
    }

    return payload
  }
}
