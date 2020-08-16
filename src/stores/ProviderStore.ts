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

import {
  observable, action, computed, runInAction,
} from 'mobx'

import ProviderSource from '../sources/ProviderSource'
import apiCaller from '../utils/ApiCaller'

import configLoader from '../utils/Config'
import { providerTypes } from '../constants'
import { OptionsSchemaPlugin } from '../plugins/endpoint'
import type { OptionValues } from '../@types/Endpoint'
import type { Field } from '../@types/Field'
import type { Providers, ProviderTypes } from '../@types/Providers'
import regionStore from './RegionStore'

export const getFieldChangeOptions = (config: {
  providerName: string | null,
  schema: Field[],
  data: any,
  field: Field | null,
  type: 'source' | 'destination',
}) => {
  const {
    providerName, schema, data, field, type,
  } = config
  const providerWithEnvOptions = configLoader.config.extraOptionsApiCalls
    .find(p => p.name === providerName && p.types.find(t => t === type))

  if (!providerName || !providerWithEnvOptions) {
    return null
  }
  const requiredFields = providerWithEnvOptions.requiredFields
  const requiredValues = providerWithEnvOptions.requiredValues

  const findFieldInSchema = (name: string) => schema.find(f => f.name === name)

  const validFields = requiredFields.filter(fn => {
    const schemaField = findFieldInSchema(fn)
    if (data) {
      // This is for 'list_all_networks' field, which requires options calls after each value change
      if (schemaField && schemaField.type === 'boolean') {
        return true
      }
      if (data[fn] === null) {
        return false
      }
      const defaultValue = data[fn] === undefined && schemaField && schemaField.default
      const requiredValue = requiredValues && requiredValues.find(f => f.field === fn)
      if (defaultValue != null) {
        if (requiredValue) {
          return Boolean(requiredValue.values.find(v => v === defaultValue))
        }
        return true
      }
      if (requiredValue) {
        return Boolean(requiredValue.values.find(v => v === data[fn]))
      }
      return data[fn]
    }
    return false
  })

  const isCurrentFieldValid = field
    ? validFields.find(fn => (field ? fn === field.name : false)) : true
  if (validFields.length !== requiredFields.length || !isCurrentFieldValid) {
    return null
  }

  const envData: any = {}
  validFields.forEach(fn => {
    envData[fn] = data ? data[fn] : null
    if (envData[fn] == null) {
      const schemaField = findFieldInSchema(fn)
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

  @observable providers: Providers | null = null

  @observable providersLoading: boolean = false

  @observable destinationSchema: Field[] = []

  @observable destinationSchemaLoading: boolean = false

  @observable destinationOptions: OptionValues[] = []

  // Set to true while loading the options call for the first set of options
  @observable destinationOptionsPrimaryLoading: boolean = false

  // Set to true while loading the options call with a set of values in the 'env' parameter
  @observable destinationOptionsSecondaryLoading: boolean = false

  @observable sourceOptions: OptionValues[] = []

  // Set to true while loading the options call for the first set of options
  @observable sourceOptionsPrimaryLoading: boolean = false

  // Set to true while loading the options call with a set of values in the 'env' parameter
  @observable sourceOptionsSecondaryLoading: boolean = false

  @observable sourceSchema: Field[] = []

  @observable sourceSchemaLoading: boolean = false

  lastDestinationSchemaType: 'replica' | 'migration' = 'replica'

  @computed
  get providerNames(): ProviderTypes[] {
    const sortPriority = configLoader.config.providerSortPriority

    const array: any[] = Object.keys(this.providers || {}).sort((a, b) => {
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

  private async setRegions(regionsField: Field | undefined) {
    if (!regionsField) {
      return
    }
    await regionStore.getRegions()
    regionsField.enum = [...regionStore.regions]
  }

  @action async getConnectionInfoSchema(providerName: ProviderTypes): Promise<void> {
    this.connectionSchemaLoading = true

    try {
      const fields: Field[] = await ProviderSource.getConnectionInfoSchema(providerName)
      await this.setRegions(fields.find(f => f.name === 'mapped_regions'))
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
      const providers: Providers = await ProviderSource.loadProviders()
      runInAction(() => { this.providers = providers })
    } finally {
      runInAction(() => { this.providersLoading = false })
    }
  }

  loadOptionsSchemaLastReqId: string = ''

  loadOptionsSchemaLastDirection: 'source' | 'destination' | '' = ''

  @action async loadOptionsSchema(options: {
    providerName: ProviderTypes,
    optionsType: 'source' | 'destination',
    useCache?: boolean,
    quietError?: boolean,
  }): Promise<Field[]> {
    const {
      providerName, optionsType, useCache, quietError,
    } = options

    if (optionsType === 'source') {
      this.sourceSchemaLoading = true
    } else {
      this.destinationSchemaLoading = true
    }

    const reqId = providerName
    this.loadOptionsSchemaLastReqId = reqId
    this.loadOptionsSchemaLastDirection = optionsType

    const isValid = () => {
      const isSameRequest = this.loadOptionsSchemaLastReqId === reqId
      const isSameDirection = this.loadOptionsSchemaLastDirection === optionsType
      if (!isSameDirection) {
        return true
      }
      return isSameRequest
    }

    try {
      const fields: Field[] = await ProviderSource
        .loadOptionsSchema(providerName, optionsType, useCache, quietError)
      this.loadOptionsSchemaSuccess(fields, optionsType, isValid())
      return fields
    } finally {
      this.loadOptionsSchemaDone(optionsType, isValid())
    }
  }

  @action loadOptionsSchemaSuccess(
    fields: Field[],
    optionsType: 'source' | 'destination',
    isValid: boolean,
  ) {
    if (!isValid) {
      return
    }
    if (optionsType === 'source') {
      this.sourceSchema = fields
    } else {
      this.destinationSchema = fields
    }
  }

  @action loadOptionsSchemaDone(optionsType: 'source' | 'destination', isValid: boolean) {
    if (!isValid) {
      return
    }
    if (optionsType === 'source') {
      this.sourceSchemaLoading = false
    } else {
      this.destinationSchemaLoading = false
    }
  }

  getOptionsValuesLastReqId: string = ''

  getOptionsValuesLastDirection: 'source' | 'destination' | '' = ''

  async getOptionsValues(config: {
    optionsType: 'source' | 'destination',
    endpointId: string,
    providerName: ProviderTypes,
    envData?: { [prop: string]: any } | null,
    useCache?: boolean,
    quietError?: boolean,
    allowMultiple?: boolean,
  }): Promise<OptionValues[]> {
    const {
      providerName, optionsType, endpointId, envData, useCache, quietError, allowMultiple,
    } = config
    const providerType = optionsType === 'source' ? providerTypes.SOURCE_OPTIONS : providerTypes.DESTINATION_OPTIONS

    await this.loadProviders()
    if (!this.providers) {
      return []
    }
    const providerWithExtraOptions = this.providers[providerName]
      .types.find(t => t === providerType)
    if (!providerWithExtraOptions) {
      return []
    }

    let canceled = false
    if (!allowMultiple) {
      apiCaller.cancelRequests(endpointId)
    }
    this.getOptionsValuesStart(optionsType, !envData)

    const reqId = `${endpointId}-${providerType}`
    this.getOptionsValuesLastReqId = reqId
    this.getOptionsValuesLastDirection = optionsType

    const isValid = () => {
      const isSameRequest = this.getOptionsValuesLastReqId === reqId
      const isSameDirection = this.getOptionsValuesLastDirection === optionsType
      if (!isSameDirection) {
        return true
      }
      return isSameRequest
    }

    try {
      const options = await ProviderSource
        .getOptionsValues(optionsType, endpointId, envData, useCache, quietError)
      this.getOptionsValuesSuccess(
        optionsType,
        providerName,
        options,
        isValid(),
      )
      return options
    } catch (err) {
      console.error(err)
      canceled = err ? err.canceled : false
      if (canceled) {
        return optionsType === 'source' ? [...this.sourceOptions] : [...this.destinationOptions]
      }
      throw err
    } finally {
      if (!canceled) {
        this.getOptionsValuesDone(
          optionsType,
          !envData,
          isValid(),
        )
      }
    }
  }

  @action getOptionsValuesStart(optionsType: 'source' | 'destination', isPrimary: boolean) {
    if (optionsType === 'source') {
      if (isPrimary) {
        this.sourceOptions = []
        this.sourceOptionsPrimaryLoading = true
        this.sourceOptionsSecondaryLoading = false
      } else {
        this.sourceOptionsPrimaryLoading = false
        this.sourceOptionsSecondaryLoading = true
      }
    } else if (isPrimary) {
      this.destinationOptions = []
      this.destinationOptionsPrimaryLoading = true
      this.destinationOptionsSecondaryLoading = false
    } else {
      this.destinationOptionsPrimaryLoading = false
      this.destinationOptionsSecondaryLoading = true
    }
  }

  @action getOptionsValuesDone(
    optionsType: 'source' | 'destination',
    isPrimary: boolean,
    isValid: boolean,
  ) {
    if (!isValid) {
      return
    }

    if (optionsType === 'source') {
      if (isPrimary) {
        this.sourceOptionsPrimaryLoading = false
      } else {
        this.sourceOptionsSecondaryLoading = false
      }
    } else if (isPrimary) {
      this.destinationOptionsPrimaryLoading = false
    } else {
      this.destinationOptionsSecondaryLoading = false
    }
  }

  @action getOptionsValuesSuccess(
    optionsType: 'source' | 'destination',
    provider: ProviderTypes,
    options: OptionValues[],
    isValid: boolean,
  ) {
    if (!isValid) {
      return
    }
    const schema = optionsType === 'source' ? this.sourceSchema : this.destinationSchema
    schema.forEach(field => {
      const parser = OptionsSchemaPlugin.for(provider)
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
