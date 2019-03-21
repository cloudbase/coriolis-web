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

import { observable, action, computed, runInAction } from 'mobx'

import ProviderSource from '../sources/ProviderSource'
import configLoader from '../utils/Config'
import { providerTypes } from '../constants'
import { OptionsSchemaPlugin } from '../plugins/endpoint'
import type { OptionValues } from '../types/Endpoint'
import type { Field } from '../types/Field'
import type { Providers } from '../types/Providers'

export const getFieldChangeOptions = (config: {
  providerName: ?string,
  schema: Field[],
  data: any,
  field: ?Field,
  type: 'source' | 'destination',
}) => {
  let { providerName, schema, data, field, type } = config
  let providerWithEnvOptions = configLoader.config.providersWithEnvOptions.find(p => p.name === providerName && p.type === type)

  if (!providerName || !providerWithEnvOptions) {
    return null
  }
  let envRequiredFields = providerWithEnvOptions.envRequiredFields

  let findFieldInSchema = (name: string) => schema.find(f => f.name === name)

  let validFields = envRequiredFields.filter(fn => {
    let schemaField = findFieldInSchema(fn)
    if (data) {
      if (data[fn] === null) {
        return false
      }
      if (data[fn] === undefined && schemaField && schemaField.default) {
        return true
      }
      return data[fn]
    }
    return false
  })

  let isCurrentFieldValid = field ? validFields.find(fn => field ? fn === field.name : false) : true
  if (validFields.length !== envRequiredFields.length || !isCurrentFieldValid) {
    return null
  }

  let envData = {}
  validFields.forEach(fn => {
    envData[fn] = data ? data[fn] : null
    if (envData[fn] == null) {
      let schemaField = findFieldInSchema(fn)
      if (schemaField && schemaField.default) {
        envData[fn] = schemaField.default
      }
    }
  })

  return envData
}

class ProviderStore {
  @observable connectionInfoSchema: Field[] = []
  @observable connectionSchemaLoading: boolean = false
  @observable providers: ?Providers
  @observable providersLoading: boolean = false
  @observable destinationSchema: Field[] = []
  @observable destinationSchemaLoading: boolean = false
  @observable destinationOptions: OptionValues[] = []
  @observable destinationOptionsLoading: boolean = false
  @observable sourceOptions: OptionValues[] = []
  @observable sourceOptionsLoading: boolean = false
  @observable sourceSchema: Field[] = []
  @observable sourceSchemaLoading: boolean = false

  lastDestinationSchemaType: 'replica' | 'migration' = 'replica'
  lastSourceSchemaType: 'replica' | 'migration' = 'replica'

  @computed
  get providerNames(): string[] {
    let sortPriority = configLoader.config.providerSortPriority

    let array = Object.keys(this.providers || {}).sort((a, b) => {
      if (sortPriority[a] && sortPriority[b]) {
        return (sortPriority[a] - sortPriority[b]) || a.localeCompare(b)
      }
      if (sortPriority[a]) {
        return -1
      }
      if (sortPriority[b]) {
        return 1
      }
      return a.localeCompare(b)
    })
    return array
  }

  @action async getConnectionInfoSchema(providerName: string): Promise<void> {
    this.connectionSchemaLoading = true

    try {
      let fields: Field[] = await ProviderSource.getConnectionInfoSchema(providerName)
      runInAction(() => { this.connectionInfoSchema = fields })
    } finally {
      runInAction(() => { this.connectionSchemaLoading = false })
    }
  }

  @action clearConnectionInfoSchema() {
    this.connectionInfoSchema = []
  }

  @action async loadProviders(): Promise<void> {
    if (this.providers) {
      return
    }
    this.providersLoading = true
    try {
      let providers: Providers = await ProviderSource.loadProviders()
      runInAction(() => { this.providers = providers })
    } finally {
      runInAction(() => { this.providersLoading = false })
    }
  }

  destinationSchemaCache: { [string]: Field[] } = {}
  sourceSchemaCache: { [string]: Field[] } = {}

  @action async loadOptionsSchema(options: {
    providerName: string,
    schemaType: 'migration' | 'replica',
    optionsType: 'source' | 'destination',
    useCache?: boolean,
  }): Promise<void> {
    let { schemaType, providerName, optionsType, useCache } = options
    let cacheData: any

    let cacheKey = `${providerName}-${schemaType}`
    if (optionsType === 'source') {
      cacheData = this.sourceSchemaCache[cacheKey]
      this.lastSourceSchemaType = schemaType
    } else {
      cacheData = this.destinationSchemaCache[cacheKey]
      this.lastDestinationSchemaType = schemaType
    }
    if (useCache && cacheData) {
      if (optionsType === 'source') {
        this.sourceSchema = [...cacheData]
      } else {
        this.destinationSchema = [...cacheData]
      }
      return
    }

    if (optionsType === 'source') {
      this.sourceSchemaLoading = true
    } else {
      this.destinationSchemaLoading = true
    }

    try {
      let fields: Field[] = await ProviderSource.loadOptionsSchema(providerName, schemaType, optionsType)
      this.loadOptionsSchemaSuccess(fields, cacheKey, optionsType)
    } catch (err) {
      throw err
    } finally {
      this.loadOptionsSchemaDone(optionsType)
    }
  }

  @action loadOptionsSchemaSuccess(fields: Field[], cacheKey: string, optionsType: 'source' | 'destination') {
    if (optionsType === 'source') {
      this.sourceSchema = fields
      this.sourceSchemaCache[cacheKey] = fields
    } else {
      this.destinationSchema = fields
      this.destinationSchemaCache[cacheKey] = fields
    }
  }

  @action loadOptionsSchemaDone(optionsType: 'source' | 'destination') {
    if (optionsType === 'source') {
      this.sourceSchemaLoading = false
    } else {
      this.destinationSchemaLoading = false
    }
  }

  cache: { key: string, data: OptionValues[] }[] = []

  async getOptionsValues(config: {
    optionsType: 'source' | 'destination',
    endpointId: string,
    providerName: string,
    envData?: { [string]: mixed },
    useCache?: boolean,
  }): Promise<OptionValues[]> {
    let { providerName, optionsType, endpointId, envData, useCache } = config
    let providerType = optionsType === 'source' ? providerTypes.SOURCE_OPTIONS : providerTypes.DESTINATION_OPTIONS

    await this.loadProviders()
    if (!this.providers) {
      return []
    }
    let providerWithExtraOptions = this.providers[providerName].types.find(t => t === providerType)
    if (!providerWithExtraOptions) {
      return []
    }

    if (useCache) {
      let key = `${endpointId}-${providerName}-${optionsType}-${JSON.stringify(envData)}`
      let cacheItem = this.cache.find(c => c.key === key)
      if (cacheItem) {
        this.getOptionsValuesSuccess(optionsType, providerName, cacheItem.data)
        this.getOptionsValuesDone(optionsType)
        return cacheItem.data
      }
    }

    this.getOptionsValuesStart(optionsType)

    try {
      let options = await ProviderSource.getOptionsValues(optionsType, endpointId, envData)
      this.getOptionsValuesSuccess(optionsType, providerName, options)
      if (useCache) {
        let key = `${endpointId}-${providerName}-${optionsType}-${JSON.stringify(envData)}`
        if (this.cache.length > 20) {
          this.cache.splice(0)
        }
        this.cache.push({ key, data: options })
      }
      return options
    } catch (err) {
      console.error(err)
      let schemaType = optionsType === 'source' ? this.lastSourceSchemaType : this.lastDestinationSchemaType
      if (!envData) {
        return []
      }
      let newOptions = await this.loadOptionsSchema({ providerName, schemaType, optionsType })
      return newOptions
    } finally {
      this.getOptionsValuesDone(optionsType)
    }
  }

  @action getOptionsValuesStart(optionsType: 'source' | 'destination') {
    if (optionsType === 'source') {
      this.sourceOptionsLoading = true
      this.sourceOptions = []
    } else {
      this.destinationOptionsLoading = true
      this.destinationOptions = []
    }
  }

  @action getOptionsValuesDone(optionsType: 'source' | 'destination') {
    if (optionsType === 'source') {
      this.sourceOptionsLoading = false
    } else {
      this.destinationOptionsLoading = false
    }
  }

  @action getOptionsValuesSuccess(optionsType: 'source' | 'destination', provider: string, options: OptionValues[]) {
    let schema = optionsType === 'source' ? this.sourceSchema : this.destinationSchema
    schema.forEach(field => {
      const parser = OptionsSchemaPlugin[provider] || OptionsSchemaPlugin.default
      parser.fillFieldValues(field, options)
    })
    if (optionsType === 'source') {
      this.sourceSchema = [...schema]
      this.sourceOptions = options
    } else {
      this.destinationSchema = [...schema]
      this.destinationOptions = options
    }
  }
}

export default new ProviderStore()
