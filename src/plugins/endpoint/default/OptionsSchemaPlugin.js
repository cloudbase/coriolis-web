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
import type { OptionValues, StorageMap } from '../../../types/Endpoint'
import type { NetworkMap } from '../../../types/Network'
import { executionOptions } from '../../../constants'

const migrationImageOsTypes = ['windows', 'linux']

export const defaultFillFieldValues = (field: Field, option: OptionValues) => {
  if (field.type === 'string') {
    field.enum = [...option.values]
    if (option.config_default) {
      field.default = typeof option.config_default === 'string' ? option.config_default : option.config_default.id
    }
  }
  if (field.type === 'array') {
    field.enum = [...option.values]
  }
}

export const defaultFillMigrationImageMapValues = (field: Field, option: OptionValues): boolean => {
  if (field.name !== 'migr_image_map') {
    return false
  }
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

export const defaultGetDestinationEnv = (options: ?{ [string]: mixed }, oldOptions?: ?{ [string]: mixed }): any => {
  let env = {}
  let specialOptions = ['execute_now', 'separate_vm', 'skip_os_morphing', 'default_storage', 'description']
    .concat(executionOptions.map(o => o.name))
    .concat(migrationImageOsTypes.map(o => `${o}_os_image`))

  if (!options) {
    return env
  }

  Object.keys(options).forEach(optionName => {
    if (specialOptions.find(o => o === optionName) || !options || options[optionName] == null || options[optionName] === '') {
      return
    }

    if (optionName.indexOf('/') > 0) {
      let parentName = optionName.substr(0, optionName.lastIndexOf('/'))
      if (!env[parentName]) {
        env[parentName] = oldOptions ? oldOptions[parentName] || {} : {}
      }
      env[parentName][optionName.substr(optionName.lastIndexOf('/') + 1)] = options ? options[optionName] : null
    } else {
      env[optionName] = options ? options[optionName] : null
    }
  })
  return env
}

export const defaultGetMigrationImageMap = (options: ?{ [string]: mixed }) => {
  let env = {}
  if (!options) {
    return env
  }
  migrationImageOsTypes.forEach(os => {
    if (!options || !options[`${os}_os_image`]) {
      return
    }
    if (!env.migr_image_map) {
      env.migr_image_map = {}
    }

    env.migr_image_map[os] = options[`${os}_os_image`]
  })

  return env
}

export default class OptionsSchemaParser {
  static fillFieldValues(field: Field, options: OptionValues[]) {
    let option = options.find(f => f.name === field.name)
    if (!option) {
      return
    }
    if (!defaultFillMigrationImageMapValues(field, option)) {
      defaultFillFieldValues(field, option)
    }
  }

  static getDestinationEnv(options: ?{ [string]: mixed }, oldOptions?: any) {
    let env = {
      ...defaultGetDestinationEnv(options, oldOptions),
      ...defaultGetMigrationImageMap(options),
    }
    return env
  }

  static getNetworkMap(networkMappings: ?NetworkMap[]) {
    let payload = {}
    if (networkMappings && networkMappings.length) {
      networkMappings.forEach(mapping => {
        payload[mapping.sourceNic.network_name] = mapping.targetNetwork.id
      })
    }
    return payload
  }

  static getStorageMap(defaultStorage: ?string, storageMap: ?StorageMap[], configDefault?: ?string) {
    if (!defaultStorage && !storageMap) {
      return null
    }

    let payload = {}
    if (defaultStorage) {
      payload.default = defaultStorage
    }

    if (!storageMap) {
      return payload
    }

    storageMap.forEach(mapping => {
      if (mapping.target.id === null && !configDefault) {
        return
      }

      if (mapping.type === 'backend') {
        if (!payload.backend_mappings) {
          payload.backend_mappings = []
        }
        payload.backend_mappings.push({
          source: mapping.source.storage_backend_identifier,
          destination: mapping.target.id === null ? configDefault : mapping.target.name,
        })
      } else {
        if (!payload.disk_mappings) {
          payload.disk_mappings = []
        }
        payload.disk_mappings.push({
          disk_id: mapping.source.id.toString(),
          destination: mapping.target.id === null ? configDefault : mapping.target.name,
        })
      }
    })
    return payload
  }
}

