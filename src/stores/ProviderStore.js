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

import { observable, action } from 'mobx'

import ProviderSource from '../sources/ProviderSource'
import { providersWithExtraOptions } from '../config.js'
import { OptionsSchemaPlugin } from '../plugins/endpoint'
import type { DestinationOption } from '../types/Endpoint'
import type { Field } from '../types/Field'
import type { Providers } from '../types/Providers'

export const getFieldChangeDestOptions = (options: {
  provider: ?string,
  destSchema: Field[],
  data: any,
  field: ?Field,
}) => {
  let { provider, destSchema, data, field } = options
  let providerWithExtraOptions = providersWithExtraOptions.find(p => typeof p !== 'string' && p.name === provider)
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
  @observable destinationOptions: DestinationOption[] = []
  @observable destinationOptionsLoading: boolean = false

  lastDestinationSchemaType: string = ''

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

  @action loadDestinationSchema(providerName: string, schemaType: string): Promise<void> {
    this.destinationSchemaLoading = true
    this.lastDestinationSchemaType = schemaType

    return ProviderSource.loadDestinationSchema(providerName, schemaType).then((fields: Field[]) => {
      this.destinationSchemaLoading = false
      this.destinationSchema = fields
    }).catch(() => {
      this.destinationSchemaLoading = false
    })
  }

  @action getDestinationOptions(endpointId: string, provider: string, envData?: { [string]: mixed }): Promise<DestinationOption[]> {
    let providerWithExtraOptions = providersWithExtraOptions.find(p => typeof p === 'string' ? p === provider : p.name === provider)
    if (!providerWithExtraOptions) {
      return Promise.resolve([])
    }

    this.destinationOptionsLoading = true
    this.destinationOptions = []
    let destOptions = []

    return ProviderSource.getDestinationOptions(endpointId, envData).then(options => {
      this.destinationSchema.forEach(field => {
        const parser = OptionsSchemaPlugin[provider] || OptionsSchemaPlugin.default
        parser.fillFieldValues(field, options)
      })
      this.destinationOptions = options
      destOptions = options
      this.destinationOptionsLoading = false
    }).catch(err => {
      console.error(err)
      if (envData) {
        return this.loadDestinationSchema(provider, this.lastDestinationSchemaType).then(() => {
          return this.getDestinationOptions(endpointId, provider)
        })
      }
      return this.loadDestinationSchema(provider, this.lastDestinationSchemaType)
    }).then(() => {
      this.destinationOptionsLoading = false
      return destOptions
    })
  }
}

export default new ProviderStore()
