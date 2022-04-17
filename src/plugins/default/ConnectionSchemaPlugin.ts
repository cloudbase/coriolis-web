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

import LabelDictionary from '@src/utils/LabelDictionary'
import Utils from '@src/utils/ObjectUtils'
import type { Schema, SchemaProperties, SchemaDefinitions } from '@src/@types/Schema'
import type { Field } from '@src/@types/Field'
import { Endpoint } from '@src/@types/Endpoint'

export const defaultSchemaToFields = (
  schema: SchemaProperties,
  schemaDefinitions?: SchemaDefinitions | null,
  dictionaryKey?: string,
): any[] => {
  if (!schema.properties) {
    return []
  }

  const fields = Object.keys(schema.properties).map(fieldName => {
    let properties: any = schema.properties[fieldName]

    if (typeof properties.$ref === 'string' && schemaDefinitions) {
      const definitionName = properties.$ref.substr(properties.$ref.lastIndexOf('/') + 1)
      properties = schemaDefinitions[definitionName]
      return {
        name: fieldName,
        type: properties.type ? properties.type : '',
        properties: properties.properties
          ? defaultSchemaToFields(properties, null, dictionaryKey) : [],
      }
    } if (properties.type === 'object' && properties.properties && Object.keys(properties.properties).length) {
      return {
        name: fieldName,
        type: 'object',
        properties: defaultSchemaToFields(properties, null, dictionaryKey),
      }
    }

    const name = fieldName
    LabelDictionary.pushToCache({ name, title: properties.title, description: properties.description }, dictionaryKey || '')

    return {
      ...properties,
      name,
      required: schema.required && schema.required.find(k => k === fieldName) ? true : fieldName === 'username' || fieldName === 'password',
    }
  })

  return fields
}

export const connectionSchemaToFields = (schema: SchemaProperties) => {
  const fields = defaultSchemaToFields(schema)

  const sortPriority: any = { username: 1, password: 2 }
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

export const generateField = (fieldBuilderProps: any) => {
  const field = { ...fieldBuilderProps }

  if (!field.type) {
    field.type = 'string'
  }

  if (!field.required) {
    field.required = false
  }
  field.default = undefined

  return field
}

export const generateBaseFields = () => [
  generateField({ name: 'name', title: 'Name', required: true }),
  generateField({
    name: 'mapped_regions',
    title: 'Coriolis Regions',
    type: 'array',
    noItemsMessage: 'No regions available',
    noSelectionMessage: 'Choose regions',
    description: `Optional list of one or more Coriolis Regions the Endpoint should be mapped to.
    Mapping this Endpoint to a set of Regions will mean that any operations related to the Endpoint will be executed on Coriolis services which are marked as being in the same Region.
    (e.g. running DRaaS operations with some Coriolis services running on a private source platform and some on a public target).
    Can be left unselected for all-in-one Coriolis installations or when the source/target platform is accessible by the whole Coriolis deployment.`,
  }),
  generateField({ name: 'description', title: 'Description' }),
]

export const fieldsToPayload = (data: { [prop: string]: any }, schema: SchemaProperties) => {
  const info: any = {}
  const usableSchema: any = schema
  Object.keys(usableSchema.properties).forEach(fieldName => {
    if (data[fieldName] && typeof data[fieldName] !== 'object') {
      info[fieldName] = Utils.trim(fieldName, data[fieldName])
    } else if (typeof usableSchema.properties[fieldName] === 'object') {
      const properties = usableSchema.properties[fieldName]
        && usableSchema.properties[fieldName].properties
      if (properties) {
        Object.keys(properties).forEach(fn => {
          const fullFn = `${fieldName}/${fn}`
          if (data[fullFn] != null) {
            if (!info[fieldName]) {
              info[fieldName] = {}
            }
            info[fieldName][fn] = Utils.trim(fn, data[fullFn])
          }
        })
      }
    } else if (
      !data[fieldName]
      && usableSchema.required && usableSchema.required.find((f: string) => f === fieldName)
      && usableSchema.properties[fieldName].default
    ) {
      info[fieldName] = usableSchema.properties[fieldName].default
    }
  })

  return info
}

class ConnectionSchemaParserBase {
  parseSchemaToFields(schema: Schema): Field[] {
    let fields = connectionSchemaToFields(schema.oneOf[0])

    fields = [
      ...generateBaseFields(),
      ...fields,
    ]

    return fields
  }

  parseConnectionInfoToPayload(data: { [prop: string]: any }, schema: any) {
    const schemaRoot = schema.oneOf ? schema.oneOf[0] : schema
    const connectionInfo = fieldsToPayload(data, schemaRoot)

    const dataSecretRef = data.secret_ref || data['connection_info/secret_ref']
    if (dataSecretRef) {
      connectionInfo.secret_ref = dataSecretRef
    }

    return connectionInfo
  }

  parseConnectionResponse(endpoint: Endpoint) {
    return endpoint
  }
}

export default ConnectionSchemaParserBase
