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
    const fields: Field[] = DefaultOptionsSchemaPlugin.parseSchemaToFields(schema, schemaDefinitions, dictionaryKey)
    const useCoriolisExporterField = fields.find(f => f.name === 'use_coriolis_exporter')
    if (useCoriolisExporterField) {
      const usableFields: Field[] = [
        {
          ...useCoriolisExporterField,
          nullableBoolean: false,
          default: false,
          subFields: [
            {
              name: 'generic_exporter_options',
              type: 'object',
              properties: fields.filter(f => f.name !== 'use_coriolis_exporter')
                .map(f => ({ ...f, groupName: 'generic_exporter_options' })),
            },
            {
              name: 'ovm_exporter_options',
              type: 'object',
              properties: [],
            },
          ],
        },
      ]
      return usableFields
    }
    fields.forEach(f => {
      if (
        f.name !== 'migr_template_username_map'
        && f.name !== 'migr_template_password_map'
        && f.name !== 'migr_template_name_map'
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

  static sortFields(fields: Field[]) {
    DefaultOptionsSchemaPlugin.sortFields(fields)
  }

  static fillFieldValues(field: Field, options: OptionValues[]) {
    if (field.name === 'use_coriolis_exporter') {
      field.subFields?.forEach(sf => {
        if (sf.properties) {
          sf.properties.forEach(f => {
            DefaultOptionsSchemaPlugin.fillFieldValues(f, options, f.name.split('/')[1])
          })
        }
      })
    } else {
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
  }

  static getDestinationEnv(options: { [prop: string]: any } | null, oldOptions?: any) {
    let newOptions: any = { ...options }
    if (newOptions.use_coriolis_exporter != null) {
      newOptions = { use_coriolis_exporter: newOptions.use_coriolis_exporter }
    }
    if (options?.generic_exporter_options) {
      newOptions = { ...options.generic_exporter_options, use_coriolis_exporter: false }
    }
    const env = {
      ...defaultGetDestinationEnv(newOptions, oldOptions),
      ...defaultGetMigrationImageMap(
        newOptions,
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
