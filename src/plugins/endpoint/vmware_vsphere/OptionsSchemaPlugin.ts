/*
Copyright (C) 2021  Cloudbase Solutions SRL
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

import DefaultOptionsSchemaPlugin, {
  defaultFillMigrationImageMapValues,
  defaultFillFieldValues,
  defaultGetDestinationEnv,
  defaultGetMigrationImageMap,
} from '../default/OptionsSchemaPlugin'

import type { InstanceScript } from '../../../@types/Instance'
import type { Field } from '../../../@types/Field'
import type { OptionValues, StorageMap } from '../../../@types/Endpoint'
import type { SchemaProperties, SchemaDefinitions } from '../../../@types/Schema'
import type { NetworkMap } from '../../../@types/Network'
import { UserScriptData } from '../../../@types/MainItem'

export default class OptionsSchemaParser {
  static migrationImageMapFieldName = 'migr_template_map'

  static parseSchemaToFields(
    schema: SchemaProperties,
    schemaDefinitions: SchemaDefinitions | null | undefined,
    dictionaryKey: string,
  ) {
    const fields = DefaultOptionsSchemaPlugin
      .parseSchemaToFields(schema, schemaDefinitions, dictionaryKey)
    fields.forEach(f => {
      if (
        f.name !== 'migr_template_username_map'
        && f.name !== 'migr_template_password_map'
        && f.name !== 'migr_template_map'
      ) {
        return
      }

      const password = f.name === 'migr_template_password_map'
      f.properties = [
        {
          type: 'string',
          name: 'windows',
          password,
        },
        {
          type: 'string',
          name: 'linux',
          password,
        },
      ]
    })

    return fields
  }

  static fillFieldValues(field: Field, options: OptionValues[]) {
    const option = options.find(f => f.name === field.name)
    if (!option) {
      return
    }
    if (!defaultFillMigrationImageMapValues(
      field,
      option,
      this.migrationImageMapFieldName,
    )) {
      defaultFillFieldValues(field, option)
    }
  }

  static getDestinationEnv(options: { [prop: string]: any } | null, oldOptions?: any) {
    const env = {
      ...defaultGetDestinationEnv(options, oldOptions),
      ...defaultGetMigrationImageMap(
        options,
        oldOptions,
        this.migrationImageMapFieldName,
      ),
    }
    return env
  }

  static getNetworkMap(networkMappings: NetworkMap[] | null | undefined) {
    return DefaultOptionsSchemaPlugin.getNetworkMap(networkMappings)
  }

  static getStorageMap(
    defaultStorage: { value: string | null, busType?: string | null },
    storageMap: StorageMap[] | null,
    configDefault?: string | null,
  ) {
    return DefaultOptionsSchemaPlugin.getStorageMap(defaultStorage, storageMap, configDefault)
  }

  static getUserScripts(
    uploadedUserScripts: InstanceScript[],
    removedUserScripts: InstanceScript[],
    userScriptData: UserScriptData | null | undefined,
  ) {
    return DefaultOptionsSchemaPlugin
      .getUserScripts(uploadedUserScripts, removedUserScripts, userScriptData)
  }
}
