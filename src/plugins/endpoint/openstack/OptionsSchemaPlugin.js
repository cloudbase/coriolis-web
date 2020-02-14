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

// @flow

import DefaultOptionsSchemaPlugin from '../default/OptionsSchemaPlugin'
import LabelDictionary from '../../../utils/LabelDictionary'

import type { InstanceScript } from '../../../types/Instance'
import type { Field } from '../../../types/Field'
import type { OptionValues, StorageMap } from '../../../types/Endpoint'
import type { SchemaProperties, SchemaDefinitions } from '../../../types/Schema'
import type { NetworkMap } from '../../../types/Network'

export default class OptionsSchemaParser {
  static migrationImageMapFieldName = DefaultOptionsSchemaPlugin.migrationImageMapFieldName

  static parseSchemaToFields(schema: SchemaProperties, schemaDefinitions?: ?SchemaDefinitions, dictionaryKey: string) {
    let fields = DefaultOptionsSchemaPlugin.parseSchemaToFields(schema, schemaDefinitions, dictionaryKey)
    let exportMechField = fields.find(f => f.name === 'replica_export_mechanism')
    if (exportMechField) {
      exportMechField.subFields = []
      exportMechField.enum.forEach(exportType => {
        let exportTypeFieldIdx = fields.findIndex(f => f.name === `${exportType}_options`)
        if (exportTypeFieldIdx > -1) {
          let subField = fields[exportTypeFieldIdx]
          if (subField.properties && subField.properties.length > 2) {
            subField.properties = subField.properties.map(p => ({ ...p, groupName: LabelDictionary.get(subField.name) }))
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
      DefaultOptionsSchemaPlugin.fillFieldValues(field, options)
    }
  }

  static getDestinationEnv(options: ?{ [string]: mixed }, oldOptions?: any) {
    return DefaultOptionsSchemaPlugin.getDestinationEnv(options, oldOptions)
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

