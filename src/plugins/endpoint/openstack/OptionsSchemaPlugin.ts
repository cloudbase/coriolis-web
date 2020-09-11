/*
Copyright (C) 2019  Cloudbase Solutions SRL
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
  defaultGetDestinationEnv,
  defaultGetMigrationImageMap,
  defaultFillFieldValues,
  defaultFillMigrationImageMapValues,
} from '../default/OptionsSchemaPlugin'

import type { InstanceScript } from '../../../@types/Instance'
import type { Field } from '../../../@types/Field'
import type { OptionValues, StorageMap } from '../../../@types/Endpoint'
import type { SchemaProperties, SchemaDefinitions } from '../../../@types/Schema'
import type { NetworkMap } from '../../../@types/Network'

export default class OptionsSchemaParser {
  static migrationImageMapFieldName = DefaultOptionsSchemaPlugin.migrationImageMapFieldName

  static imageSuffix = ''

  static parseSchemaToFields(
    schema: SchemaProperties,
    schemaDefinitions: SchemaDefinitions | null | undefined,
    dictionaryKey: string,
  ) {
    const fields = DefaultOptionsSchemaPlugin
      .parseSchemaToFields(schema, schemaDefinitions, dictionaryKey)
    const exportMechField = fields.find(f => f.name === 'replica_export_mechanism')
    if (exportMechField) {
      exportMechField.subFields = []
      exportMechField.enum.forEach((exportType: any) => {
        const exportTypeFieldIdx = fields.findIndex(f => f.name === `${exportType}_options`)
        if (exportTypeFieldIdx > -1) {
          const subField = fields[exportTypeFieldIdx]
          if (subField.properties && subField.properties.length) {
            subField.properties = subField.properties
              .map((p: any) => ({ ...p, groupName: subField.name }))
          }
          exportMechField.subFields.push(subField)
          fields.splice(exportTypeFieldIdx, 1)
        }
      })
    }
    return fields
  }

  static fillFieldValues(field: Field, options: OptionValues[]) {
    if (field.name === 'replica_export_mechanism' && field.subFields) {
      field.subFields.forEach(sf => {
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
        this.imageSuffix,
      )) {
        defaultFillFieldValues(field, option)
      }
    }
  }

  static getDestinationEnv(
    options: { [prop: string]: any } | null,
    oldOptions?: any,
    useNullValues?: boolean,
  ) {
    const env = {
      ...defaultGetDestinationEnv(
        options,
        oldOptions,
        this.imageSuffix,
        useNullValues,
      ),
      ...defaultGetMigrationImageMap(
        options,
        oldOptions,
        this.migrationImageMapFieldName,
        this.imageSuffix,
      ),
    }
    return env
  }

  static getNetworkMap(networkMappings: NetworkMap[] | null) {
    return DefaultOptionsSchemaPlugin.getNetworkMap(networkMappings)
  }

  static getStorageMap(
    defaultStorage: string | null,
    storageMap: StorageMap[] | null,
    configDefault?: string | null,
  ) {
    return DefaultOptionsSchemaPlugin.getStorageMap(defaultStorage, storageMap, configDefault)
  }

  static getUserScripts(uploadedUserScripts: InstanceScript[]) {
    return DefaultOptionsSchemaPlugin.getUserScripts(uploadedUserScripts)
  }
}
