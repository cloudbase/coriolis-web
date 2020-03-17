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

import DefaultOptionsSchemaPlugin, {
  defaultFillMigrationImageMapValues,
  defaultFillFieldValues,
  defaultGetDestinationEnv,
  defaultGetMigrationImageMap,
} from '../default/OptionsSchemaPlugin'

import type { InstanceScript } from '../../../types/Instance'
import type { Field } from '../../../types/Field'
import type { OptionValues, StorageMap } from '../../../types/Endpoint'
import type { SchemaProperties, SchemaDefinitions } from '../../../types/Schema'
import type { NetworkMap } from '../../../types/Network'

export default class OptionsSchemaParser {
  static migrationImageMapFieldName = 'migr_template_map'

  static parseSchemaToFields(schema: SchemaProperties, schemaDefinitions?: ?SchemaDefinitions, dictionaryKey: string) {
    let fields = DefaultOptionsSchemaPlugin.parseSchemaToFields(schema, schemaDefinitions, dictionaryKey)
    fields.forEach(f => {
      if (
        f.name !== 'migr_template_username_map'
        && f.name !== 'migr_template_password_map'
        && f.name !== 'migr_template_name_map'
      ) {
        return
      }
      f.properties = [
        {
          type: 'string',
          name: `${f.name}/windows`,
          password: f.name === 'migr_template_password_map',
        },
        {
          type: 'string',
          name: `${f.name}/linux`,
          password: f.name === 'migr_template_password_map',
        },
      ]
    })

    return fields
  }

  static fillFieldValues(field: Field, options: OptionValues[]) {
    let option = options.find(f => f.name === field.name)
    if (!option) {
      return
    }
    if (!defaultFillMigrationImageMapValues(field, option, this.migrationImageMapFieldName)) {
      defaultFillFieldValues(field, option)
    }
  }

  static getDestinationEnv(options: ?{ [string]: mixed }, oldOptions?: any) {
    let env = {
      ...defaultGetDestinationEnv(options, oldOptions),
      ...defaultGetMigrationImageMap(options, this.migrationImageMapFieldName),
    }
    return env
  }

  static getNetworkMap(networkMappings: ?NetworkMap[]) {
    return DefaultOptionsSchemaPlugin.getNetworkMap(networkMappings)
  }

  static getStorageMap(defaultStorage: ?string, storageMap: ?StorageMap[], configDefault?: ?string) {
    return DefaultOptionsSchemaPlugin.getStorageMap(defaultStorage, storageMap, configDefault)
  }

  static getUserScripts(uploadedUserScripts: InstanceScript[]) {
    return DefaultOptionsSchemaPlugin.getUserScripts(uploadedUserScripts)
  }
}

