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

import type { Schema } from '../../../types/Schema'
import type { Field } from '../../../types/Field'

import DefaultConnectionSchemaParser from '../default/SchemaPlugin'

export default class ConnectionSchemaParser {
  static parseSchemaToFields(schema: Schema): Field[] {
    let fields = DefaultConnectionSchemaParser.parseSchemaToFields(schema)
    let privateKeyField = fields.find(f => f.name === 'private_key_data')
    if (privateKeyField) {
      privateKeyField.useTextArea = true
    }

    return fields
  }

  static parseFieldsToPayload(data: { [string]: mixed }, schema: Schema) {
    let payload = DefaultConnectionSchemaParser.parseFieldsToPayload(data, schema)
    return payload
  }
}
