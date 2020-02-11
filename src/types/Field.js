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

import { OptionsSchemaPlugin } from '../plugins/endpoint'
import LabelDictionary from '../utils/LabelDictionary'

export type Field = {
  name: string,
  type?: string,
  value?: any,
  label?: string,
  // $FlowIssue
  enum?: string[] | { id: string, name: string, [string]: mixed }[],
  default?: any,
  password?: boolean,
  nullableBoolean?: boolean,
  items?: Field[],
  fields?: Field[],
  minimum?: number,
  maximum?: number,
  parent?: string,
  properties?: Field[],
  required?: boolean,
  useTextArea?: boolean,
  readOnly?: boolean,
  title?: string,
  description?: string,
  subFields?: Field[],
  groupName?: string,
  useFile?: boolean,
}

const migrationImageOsTypes = ['windows', 'linux']

class FieldHelper {
  getValueAlias(name: string, value: any, fields: Field[], targetProvider: ?string): string {
    let plugin = targetProvider && (OptionsSchemaPlugin[targetProvider] || OptionsSchemaPlugin.default)

    if (value === true) {
      return 'Yes'
    }
    if (value === false) {
      return 'No'
    }
    let findField = (f: Field[]) => f.find(f1 => f1.name === name)
    let field = findField(fields)
    if (!field) {
      fields.forEach(f => {
        if (f.properties && !field) {
          field = findField(f.properties)
        }

        if (f.subFields && !field) {
          field = findField(f.subFields)
          if (f.subFields && !field) {
            f.subFields.forEach(sf => {
              if (!field && sf.properties) {
                field = findField(sf.properties)
              }
            })
          }
        }
      })
    }
    let findInEnum = (v: any) => {
      let valueName = v
      if (field && field.enum) {
        let enumObject = field.enum.find(e => e.id ? e.id === v : false)
        if (enumObject && enumObject.name) {
          valueName = enumObject.name
        } else if (field && LabelDictionary.enumFields.find(f => field && f === field.name)) {
          valueName = LabelDictionary.get(v)
        }
      }
      return valueName
    }
    if (value.join) {
      return value.map(v => findInEnum(v)).join(', ')
    }

    let isImageMapField = migrationImageOsTypes.find(os => `${os}_os_image` === name)
    if (isImageMapField) {
      let migrImageField = plugin && fields.find(f => f.name === plugin.migrationImageMapFieldName)
      if (migrImageField && migrImageField.properties) {
        let imageField = migrImageField.properties.find(p => p.name === name)
        if (imageField && imageField.enum) {
          let imageFieldValueObject = imageField.enum.find(e => e.id ? e.id === value : false)
          if (imageFieldValueObject) {
            return imageFieldValueObject.name
          }
        }
      }
    }
    // $FlowIssue
    return findInEnum(value)
  }
}

export default new FieldHelper()
