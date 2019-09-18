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

import { ConnectionSchemaPlugin, OptionsSchemaPlugin } from '../plugins/endpoint'
import type { Schema } from '../types/Schema'
import type { Endpoint } from '../types/Endpoint'

class SchemaParser {
  static storedConnectionsSchemas = {}

  static connectionSchemaToFields(provider: string, schema: Schema) {
    if (!this.storedConnectionsSchemas[provider]) {
      this.storedConnectionsSchemas[provider] = schema
    }

    let parsers = ConnectionSchemaPlugin[provider] || ConnectionSchemaPlugin.default
    let fields = parsers.parseSchemaToFields(schema)

    return fields
  }

  static optionsSchemaToFields(provider: string, schema: any) {
    let parser = OptionsSchemaPlugin[provider] || OptionsSchemaPlugin.default
    let schemaRoot = schema.oneOf ? schema.oneOf[0] : schema
    let fields = parser.parseSchemaToFields(schemaRoot, schemaRoot.definitions)
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

  static fieldsToPayload(data: { [string]: any }) {
    let storedSchema = this.storedConnectionsSchemas[data.type] || this.storedConnectionsSchemas.general
    let parsers = ConnectionSchemaPlugin[data.type] || ConnectionSchemaPlugin.default
    let payload = parsers.parseFieldsToPayload(data, storedSchema)

    return payload
  }

  static parseConnectionResponse(endpoint: Endpoint) {
    let parseConnectionResponse = ConnectionSchemaPlugin[endpoint.type] && ConnectionSchemaPlugin[endpoint.type].parseConnectionResponse
    if (!parseConnectionResponse) {
      return endpoint
    }
    return parseConnectionResponse(endpoint)
  }
}

export { SchemaParser }
