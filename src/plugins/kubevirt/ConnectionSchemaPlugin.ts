/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

import DefaultConnectionSchemaParser from '../default/ConnectionSchemaPlugin'
import { Endpoint } from '../../@types/Endpoint'

export default class ConnectionSchemaParser {
  static parseSchemaToFields(schema: Schema): Field[] {
    const fields = DefaultConnectionSchemaParser.parseSchemaToFields(schema)
    const kubeConfigField = fields.find(f => f.name === 'kube_config')
    if (kubeConfigField) {
      kubeConfigField.useFile = true
    }

    return fields
  }

  static parseConnectionInfoToPayload(data: { [prop: string]: any }, schema: Schema) {
    const payload = DefaultConnectionSchemaParser.parseConnectionInfoToPayload(data, schema)
    return payload
  }

  static parseConnectionResponse(endpoint: Endpoint) {
    return endpoint
  }
}
