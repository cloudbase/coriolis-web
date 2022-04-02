/*
Copyright (C) 2022  Cloudbase Solutions SRL
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
import { Field, isEnumSeparator } from '@src/@types/Field'
import type { OptionValues, StorageMap } from '@src/@types/Endpoint'
import type { SchemaProperties, SchemaDefinitions } from '@src/@types/Schema'
import type { NetworkMap } from '@src/@types/Network'
import { UserScriptData } from '@src/@types/MainItem'
import DefaultOptionsSchemaPlugin, {
  defaultGetDestinationEnv,
  defaultGetMigrationImageMap,
  defaultFillFieldValues,
  defaultFillMigrationImageMapValues,
} from '../default/OptionsSchemaPlugin'

export default class OptionsSchemaParser {
  static migrationImageMapFieldName = DefaultOptionsSchemaPlugin.migrationImageMapFieldName

  static parseSchemaToFields(opts: {
    schema: SchemaProperties,
    schemaDefinitions?: SchemaDefinitions | null | undefined,
    dictionaryKey?: string,
    requiresWindowsImage?: boolean,
  }) {
    const fields: Field[] = DefaultOptionsSchemaPlugin.parseSchemaToFields(opts)
    const exportImage = fields.find(f => f.name === 'export_image')
    if (exportImage) {
      exportImage.required = true
    }
    return fields
  }

  static sortFields(fields: Field[]) {
    DefaultOptionsSchemaPlugin.sortFields(fields)
    fields.sort((f1, f2) => {
      // sort region first
      if (f1.name === 'region') {
        return -1
      }
      if (f2.name === 'region') {
        return 1
      }
      return 0
    })
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
      migrationImageMapFieldName: this.migrationImageMapFieldName,
      requiresWindowsImage,
    })) {
      defaultFillFieldValues(field, option)

      if (field.name === 'export_image') {
        field.enum?.forEach(exportImageValue => {
          if (typeof exportImageValue === 'string' || isEnumSeparator(exportImageValue)) {
            return
          }
          // @ts-ignore
          const osType = exportImageValue.os_type
          if (osType !== 'unknown' && osType !== 'linux') {
            exportImageValue.disabled = true
            exportImageValue.subtitleLabel = `Source plugins rely on a Linux-based temporary virtual machine to perform data exports, but the platform reports this image to be of OS type '${osType}'.`
          }
        })
      }
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

  static getNetworkMap(networkMappings: NetworkMap[] | null) {
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
