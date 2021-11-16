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

import { ConnectionSchemaPlugin, MinionPoolSchemaPlugin, OptionsSchemaPlugin } from '@src/plugins'
import type { Schema } from '@src/@types/Schema'
import type { Endpoint } from '@src/@types/Endpoint'
import { ProviderTypes } from '@src/@types/Providers'
import { Field } from '@src/@types/Field'

class SchemaParser {
  static storedConnectionsSchemas: any = {}

  static connectionSchemaToFields(provider: ProviderTypes, schema: Schema) {
    if (!this.storedConnectionsSchemas[provider]) {
      this.storedConnectionsSchemas[provider] = schema
    }

    const parsers = ConnectionSchemaPlugin.for(provider)
    const fields = parsers.parseSchemaToFields(schema)

    return fields
  }

  static optionsSchemaToFields(provider: ProviderTypes, schema: any, dictionaryKey: string) {
    const parser = OptionsSchemaPlugin.for(provider)
    const schemaRoot = schema.oneOf ? schema.oneOf[0] : schema
    const fields = parser.parseSchemaToFields(schemaRoot, schema.definitions, dictionaryKey)
    parser.sortFields(fields)
    return fields
  }

  static connectionInfoToPayload(data: { [prop: string]: any }) {
    const storedSchema = this.storedConnectionsSchemas[data.type]
      || this.storedConnectionsSchemas.general
    const parsers = ConnectionSchemaPlugin.for(data.type)
    const payload = parsers.parseConnectionInfoToPayload(data, storedSchema)

    return payload
  }

  static parseConnectionResponse(endpoint: Endpoint) {
    return ConnectionSchemaPlugin.for(endpoint.type).parseConnectionResponse(endpoint)
  }

  static getMinionPoolToOptionsQuery(env: any, provider: ProviderTypes) {
    const parsers = MinionPoolSchemaPlugin.for(provider)
    return parsers.getMinionPoolToOptionsQuery(env)
  }

  static minionPoolOptionsSchemaToFields(provider: ProviderTypes, schema: any, dictionaryKey: string) {
    let fields = this.optionsSchemaToFields(provider, schema, dictionaryKey)
    const parsers = MinionPoolSchemaPlugin.for(provider)
    fields = parsers.minionPoolTransformOptionsFields(fields)
    return fields
  }

  static getMinionPoolEnv(provider: ProviderTypes, schema: Field[], data: any) {
    const parsers = MinionPoolSchemaPlugin.for(provider)
    return parsers.getMinionPoolEnv(schema, data)
  }
}

export { SchemaParser }
