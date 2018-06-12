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

import type { Field } from '../../../types/Field'
import type { DestinationOption } from '../../../types/Endpoint'
import type { WizardData } from '../../../types/WizardData'
import { executionOptions } from '../../../config'

const migrationImageOsTypes = ['windows', 'linux']

export const defaultFillFieldValues = (field: Field, option: DestinationOption) => {
  if (field.type === 'string') {
    // $FlowIgnore
    field.enum = [...option.values]
    if (option.config_default) {
      field.default = typeof option.config_default === 'string' ? option.config_default : option.config_default.id
    }
  }
  if (field.type === 'array') {
    field.enum = [...option.values]
  }
}

export const defaultFillMigrationImageMapValues = (field: Field, option: DestinationOption): boolean => {
  if (field.name === 'migr_image_map') {
    field.properties = migrationImageOsTypes.map(os => {
      let values = option.values
        .filter(v => v.os_type === os || v.os_type === 'unknown')
        .sort((v1, v2) => {
          if (v1.os_type === 'unknown' && v2.os_type !== 'unknown') {
            return 1
          } else if (v1.os_type !== 'unknown' && v2.os_type === 'unknown') {
            return -1
          }
          return 0
        })
      let unknownIndex = values.findIndex(v => v.os_type === 'unknown')
      if (unknownIndex > -1 && values.filter(v => v.os_type === 'unknown').length < values.length) {
        values.splice(unknownIndex, 0, { separator: true })
      }

      return {
        name: `${os}_os_image`,
        type: 'string',
        enum: values,
      }
    })
    return true
  }
  return false
}

export const defaultGetDestinationEnv = (data: WizardData): any => {
  let env = {}
  let specialOptions = ['execute_now', 'separate_vm', 'skip_os_morphing']
    .concat(executionOptions.map(o => o.name))
    .concat(migrationImageOsTypes.map(o => `${o}_os_image`))


  if (data.options) {
    Object.keys(data.options).forEach(optionName => {
      if (specialOptions.find(o => o === optionName)
        // $FlowIssue
        || data.options[optionName] === null || data.options[optionName] === undefined) {
        return
      }
      if (optionName.indexOf('/') > 0) {
        let parentName = optionName.substr(0, optionName.lastIndexOf('/'))
        if (!env[parentName]) {
          env[parentName] = {}
        }
        env[parentName][optionName.substr(optionName.lastIndexOf('/') + 1)] = data.options ? data.options[optionName] : null
      } else {
        env[optionName] = data.options ? data.options[optionName] : null
      }
    })
  }
  return env
}

export const defaultGetNetworkMap = (data: WizardData) => {
  let env = {}
  env.network_map = {}
  if (data.networks && data.networks.length) {
    data.networks.forEach(mapping => {
      env.network_map[mapping.sourceNic.network_name] = mapping.targetNetwork.id
    })
  }
  return env
}

export const defaultGetMigrationImageMap = (data: WizardData) => {
  let env = {}
  env.migr_image_map = {}
  if (data.options) {
    migrationImageOsTypes.forEach(os => {
      if (data.options && data.options[`${os}_os_image`]) {
        env.migr_image_map[os] = data.options[`${os}_os_image`]
      }
    })
  }

  return env
}

export default class OptionsSchemaParser {
  static fillFieldValues(field: Field, options: DestinationOption[]) {
    let option = options.find(f => f.name === field.name)
    if (!option) {
      return
    }
    if (!defaultFillMigrationImageMapValues(field, option)) {
      defaultFillFieldValues(field, option)
    }
  }

  static getDestinationEnv(data: WizardData) {
    let env = {
      ...defaultGetDestinationEnv(data),
      ...defaultGetNetworkMap(data),
      ...defaultGetMigrationImageMap(data),
    }
    return env
  }
}

