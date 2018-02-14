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

import { SchemaPlugin } from '../plugins/endpoint'
import { defaultSchemaToFields } from '../plugins/endpoint/default/SchemaPlugin'

class SchemaParser {
  static storedConnectionsSchemas = {}

  static connectionSchemaToFields(provider, schema) {
    if (!this.storedConnectionsSchemas[provider]) {
      this.storedConnectionsSchemas[provider] = schema
    }

    let parsers = SchemaPlugin[provider] || SchemaPlugin.default
    let fields = parsers.parseSchemaToFields(schema)

    return fields
  }

  static optionsSchemaToFields(provider, schema) {
    let fields = defaultSchemaToFields(schema.oneOf[0])
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
    let parsers = SchemaPlugin[data.type] || SchemaPlugin.default
    let payload = parsers.parseFieldsToPayload(data, storedSchema)

    return payload
  }
}

export { SchemaParser }
