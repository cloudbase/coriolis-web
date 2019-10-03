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
}

const migrationImageOsTypes = ['windows', 'linux']

class FieldHelper {
  getValueAlias(name: string, value: any, fields: Field[]): string {
    if (value === true) {
      return 'Yes'
    }
    if (value === false) {
      return 'No'
    }
    let field = fields.find(f => f.name === name)
    let findInEnum = (v: any) => {
      let valueName = v
      if (field && field.enum) {
        let enumObject = field.enum.find(e => e.id ? e.id === v : false)
        if (enumObject && enumObject.name) {
          valueName = enumObject.name
        }
      }
      return valueName
    }
    if (value.join) {
      return value.map(v => findInEnum(v)).join(', ')
    }

    let isImageMapField = migrationImageOsTypes.find(os => `${os}_os_image` === name)
    if (isImageMapField) {
      let migrImageField = fields.find(f => f.name === 'migr_image_map')
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
