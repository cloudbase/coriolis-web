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

import ProviderSource from '@src/sources/ProviderSource'
import apiCaller from '@src/utils/ApiCaller'

import configLoader from '@src/utils/Config'
import { providerTypes } from '@src/constants'
import { OptionsSchemaPlugin } from '@src/plugins'
import type { OptionValues } from '@src/@types/Endpoint'
import type { Field } from '@src/@types/Field'
import type { Providers, ProviderTypes } from '@src/@types/Providers'
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
  const relistFields = providerWithEnvOptions.relistFields

  const findFieldInSchema = (name: string) => schema.find(f => f.name === name)

  const filterValidField = (fn: string) => {
    const schemaField = findFieldInSchema(fn)
    if (data) {
      // This is for 'list_all_networks' field, which requires options calls after each value change
      // @TODO: refactor to use `relistFields` option
      if (schemaField && schemaField.type === 'boolean') {
        return true
      }
      if (data[fn] === null) {
        return false
      }
      const defaultValue = data[fn] === undefined && schemaField && schemaField.default
      const requiredValue = requiredValues?.find(f => f.field === fn)
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
  }

  const requiredValidFields = requiredFields.filter(filterValidField)
  const relistValidFields = relistFields?.filter(filterValidField)

  const relistField = relistFields?.find(fn => fn === field?.name)

  const isCurrentFieldValid = field ? (
    requiredValidFields.find(fn => fn === field.name)
    || relistField
  ) : true
  if (requiredValidFields.length !== requiredFields.length || !isCurrentFieldValid) {
    return null
  }

  const envData: any = {}
  const setEnvDataValue = (fn: string) => {
    envData[fn] = data ? data[fn] : null
    if (envData[fn] == null) {
      const schemaField = findFieldInSchema(fn)
      if (schemaField && schemaField.default) {
        envData[fn] = schemaField.default
      }
    }
  }
  requiredValidFields.forEach(fn => {
    setEnvDataValue(fn)
  })
  relistValidFields?.forEach(fn => {
    setEnvDataValue(fn)
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
    if (!this.providers) {
      return []
    }

    const sortPriority = configLoader.config.providerSortPriority

    const array = Object.keys(this.providers).sort((a, b) => {
      const aTyped = a as ProviderTypes
      const bTyped = b as ProviderTypes
      if (sortPriority[aTyped] && sortPriority[bTyped]) {
        return (sortPriority[aTyped] - sortPriority[bTyped]) || a.localeCompare(b)
      }
      if (sortPriority[aTyped]) {
        return -1
      }
      if (sortPriority[bTyped]) {
        return 1
      }
      return a.localeCompare(b)
    }) as ProviderTypes[]
    return array
  }

  private async setRegions(regionsField: Field | undefined) {
    if (!regionsField) {
      return
    }
    await regionStore.getRegions()
    regionsField.enum = [...regionStore.regions]
  }

  loadingForProvider: ProviderTypes | null = null

  @action async getConnectionInfoSchema(providerName: ProviderTypes): Promise<void> {
    if (this.connectionSchemaLoading && this.loadingForProvider === providerName) {
      return
    }

    this.connectionSchemaLoading = true
    this.loadingForProvider = providerName

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
    if (this.providers || this.providersLoading) {
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
    requiresWindowsImage?: boolean
  }): Promise<Field[]> {
    const {
      providerName, optionsType, useCache, quietError, requiresWindowsImage,
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
      const fields: Field[] = await ProviderSource.loadOptionsSchema({
        providerName, optionsType, useCache, quietError, requiresWindowsImage,
      })
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
    // when setting the image map, mark the windows image as required (usually done when the source is a windows image)
    requiresWindowsImage?: boolean,
    envData?: { [prop: string]: any } | null,
    useCache?: boolean,
    quietError?: boolean,
    allowMultiple?: boolean,
  }): Promise<OptionValues[]> {
    const {
      providerName, optionsType, endpointId, envData, useCache, quietError, allowMultiple, requiresWindowsImage,
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
      const options = await ProviderSource.getOptionsValues({
        optionsType, endpointId, envData, cache: useCache, quietError,
      })
      this.getOptionsValuesSuccess({
        optionsType,
        provider: providerName,
        options,
        isValid: isValid(),
        requiresWindowsImage: requiresWindowsImage || false,
      })
      return options
    } catch (e) {
      const err: any = e
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

  @action getOptionsValuesSuccess(opts: {
    optionsType: 'source' | 'destination',
    provider: ProviderTypes,
    options: OptionValues[],
    isValid: boolean,
    requiresWindowsImage: boolean,
  }) {
    const {
      optionsType, provider, options, isValid, requiresWindowsImage,
    } = opts
    if (!isValid) {
      return
    }
    const schema = optionsType === 'source' ? this.sourceSchema : this.destinationSchema
    schema.forEach(field => {
      const parser = OptionsSchemaPlugin.for(provider)
      parser.fillFieldValues({ field, options, requiresWindowsImage })
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
