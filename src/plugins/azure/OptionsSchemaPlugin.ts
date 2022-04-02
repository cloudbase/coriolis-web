/*
Copyright (C) 2022 Cloudbase Solutions SRL
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

import type { InstanceScript } from '@src/@types/Instance'
import type { Field } from '@src/@types/Field'
import type { OptionValues, StorageMap } from '@src/@types/Endpoint'
import type { SchemaProperties, SchemaDefinitions } from '@src/@types/Schema'
import type { NetworkMap } from '@src/@types/Network'
import { UserScriptData } from '@src/@types/MainItem'
import DefaultOptionsSchemaPlugin, {
  defaultFillMigrationImageMapValues,
  defaultFillFieldValues,
  defaultGetDestinationEnv,
  defaultGetMigrationImageMap,
} from '../default/OptionsSchemaPlugin'

export default class OptionsSchemaParser {
  static migrationImageMapFieldName = DefaultOptionsSchemaPlugin.migrationImageMapFieldName

  static parseSchemaToFields(opts: {
    schema: SchemaProperties,
    schemaDefinitions?: SchemaDefinitions | null | undefined,
    dictionaryKey?: string,
    requiresWindowsImage?: boolean,
  }) {
    const { schemaDefinitions } = opts
    if (schemaDefinitions?.azure_image?.required) {
      schemaDefinitions.azure_image.required = []
    }
    return DefaultOptionsSchemaPlugin.parseSchemaToFields(opts)
  }

  static sortFields(fields: Field[]) {
    DefaultOptionsSchemaPlugin.sortFields(fields)
  }

  static fillFieldValues(opts: { field: Field, options: OptionValues[], requiresWindowsImage: boolean }) {
    const { field, options, requiresWindowsImage } = opts
    const option = options.find(f => f.name === field.name)
    if (!option) {
      return
    }
    if (!defaultFillMigrationImageMapValues({
      field,
      option,
      migrationImageMapFieldName: DefaultOptionsSchemaPlugin.migrationImageMapFieldName,
      requiresWindowsImage,
    })) {
      defaultFillFieldValues(field, option)
    }
  }

  static getDestinationEnv(options: { [prop: string]: any } | null, oldOptions?: any) {
    const env = {
      ...defaultGetDestinationEnv(options, oldOptions),
      ...defaultGetMigrationImageMap(
        options,
        oldOptions,
        DefaultOptionsSchemaPlugin.migrationImageMapFieldName,
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
    return DefaultOptionsSchemaPlugin.getUserScripts(uploadedUserScripts, removedUserScripts, userScriptData)
  }
}
