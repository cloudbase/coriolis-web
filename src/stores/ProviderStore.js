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

import { observable, action, computed } from 'mobx'

import ProviderSource from '../sources/ProviderSource'
import configLoader from '../utils/Config'
import { OptionsSchemaPlugin } from '../plugins/endpoint'
import type { OptionValues } from '../types/Endpoint'
import type { Field } from '../types/Field'
import type { Providers } from '../types/Providers'

export const getFieldChangeDestOptions = (config: {
  provider: ?string,
  destSchema: Field[],
  data: any,
  field: ?Field,
}) => {
  let { provider, destSchema, data, field } = config
  let providerWithExtraOptions = configLoader.config.destinationProvidersWithExtraOptions
    .find(p => typeof p !== 'string' && p.name === provider)
  if (!provider || !providerWithExtraOptions || typeof providerWithExtraOptions === 'string' || !providerWithExtraOptions.envRequiredFields) {
    return null
  }

  let findFieldInSchema = (name: string) => destSchema.find(f => f.name === name)

  let validFields = providerWithExtraOptions.envRequiredFields.filter(fn => {
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
  if (validFields.length !== providerWithExtraOptions.envRequiredFields.length || !isCurrentFieldValid) {
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

  lastDestinationSchemaType: string = ''
  lastSourceSchemaType: string = ''

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

  @action getConnectionInfoSchema(providerName: string): Promise<void> {
    this.connectionSchemaLoading = true

    return ProviderSource.getConnectionInfoSchema(providerName).then((fields: Field[]) => {
      this.connectionSchemaLoading = false
      this.connectionInfoSchema = fields
    }).catch(() => {
      this.connectionSchemaLoading = false
    })
  }

  @action clearConnectionInfoSchema() {
    this.connectionInfoSchema = []
  }

  @action loadProviders(): Promise<void> {
    this.providers = null
    this.providersLoading = true

    return ProviderSource.loadProviders().then((providers: Providers) => {
      this.providers = providers
      this.providersLoading = false
    }).catch(() => {
      this.providersLoading = false
    })
  }

  destinationSchemaCache: { [string]: Field[] } = {}
  @action loadDestinationSchema(providerName: string, schemaType: string, cache?: boolean): Promise<void> {
    this.lastDestinationSchemaType = schemaType

    let cacheKey = `${providerName}-${schemaType}`
    let cacheData = this.destinationSchemaCache[cacheKey]
    if (cache && cacheData) {
      this.destinationSchema = [...cacheData]
      return Promise.resolve()
    }

    this.destinationSchemaLoading = true

    return ProviderSource.loadDestinationSchema(providerName, schemaType).then((fields: Field[]) => {
      this.destinationSchemaLoading = false
      this.destinationSchema = fields
      this.destinationSchemaCache[cacheKey] = fields
    }).catch(err => {
      this.destinationSchemaLoading = false
      throw err
    })
  }

  @action loadSourceSchema(providerName: string, schemaType: string): Promise<void> {
    this.sourceSchemaLoading = true
    this.lastSourceSchemaType = schemaType

    return ProviderSource.loadSourceSchema(providerName, schemaType).then((fields: Field[]) => {
      this.sourceSchemaLoading = false
      this.sourceSchema = fields
    }).catch(err => {
      this.sourceSchemaLoading = false
      throw err
    })
  }

  cache: { key: string, data: OptionValues[] }[] = []

  @action getOptionsValues(config: {
    optionsType: 'source' | 'destination',
    endpointId: string,
    provider: string,
    envData?: { [string]: mixed },
    useCache?: boolean,
  }): Promise<OptionValues[]> {
    let { provider, optionsType, endpointId, envData, useCache } = config
    let providers = optionsType === 'source' ?
      configLoader.config.sourceProvidersWithExtraOptions :
      configLoader.config.destinationProvidersWithExtraOptions
    let providerWithExtraOptions = providers.find(p => typeof p === 'string' ? p === provider : p.name === provider)
    if (!providerWithExtraOptions) {
      return Promise.resolve([])
    }

    if (useCache) {
      let key = `${endpointId}-${provider}-${optionsType}-${JSON.stringify(envData)}`
      let cacheItem = this.cache.find(c => c.key === key)
      if (cacheItem) {
        this.getOptionsValuesSuccess(optionsType, provider, cacheItem.data)
        this.getOptionsValuesDone(optionsType)
        return Promise.resolve(cacheItem.data)
      }
    }

    if (optionsType === 'source') {
      this.sourceOptionsLoading = true
      this.sourceOptions = []
    } else {
      this.destinationOptionsLoading = true
      this.destinationOptions = []
    }

    let optionsValues = []

    return ProviderSource.getOptionsValues(optionsType, endpointId, envData).then(options => {
      this.getOptionsValuesSuccess(optionsType, provider, options)
      optionsValues = options
      if (useCache) {
        let key = `${endpointId}-${provider}-${optionsType}-${JSON.stringify(envData)}`
        if (this.cache.length > 20) {
          this.cache.splice(0)
        }
        this.cache.push({ key, data: options })
      }
    }).catch(err => {
      console.error(err)
      if (optionsType === 'source') {
        return this.loadSourceSchema(provider, this.lastSourceSchemaType)
          .then(() => envData ? this.getOptionsValues({ endpointId, provider, optionsType }) : null)
      }
      return this.loadDestinationSchema(provider, this.lastDestinationSchemaType)
        .then(() => envData ? this.getOptionsValues({ endpointId, provider, optionsType }) : null)
    }).then(() => {
      this.getOptionsValuesDone(optionsType)
      return optionsValues
    })
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
