import { ProviderTypes } from './Providers'

type Type = 'source' | 'destination'

type ExtraOption = {
  name: string,
  types: Type[],
  requiredFields: string[],
  relistFields?: string[],
  requiredValues?: {
    field: string,
    values: string[],
  }[]
}

export type Services = {
  keystone: string,
  barbican: string,
  coriolis: string,
  coriolisLogs: string,
  coriolisLogStreamBaseUrl: string,
  coriolisLicensing: string,
}

export type ProviderMigrationCloneDiskDisabledOption = {
  defaultValue: boolean
  description: string
}

export type ProviderMigrationOptions = {
  [provider in ProviderTypes]?: {
    cloneDiskDisabledOptions: ProviderMigrationCloneDiskDisabledOption
  }
}

export type Config = {
  disabledPages: string[],
  showUserDomainInput: boolean,
  defaultUserDomain: string,
  adminRoleName: string,
  showOpenstackCurrentUserSwitch: boolean,
  useBarbicanSecrets: boolean,
  requestPollTimeout: number,
  instancesListBackgroundLoading: { default: number, [prop: string]: number },
  extraOptionsApiCalls: ExtraOption[],
  providerSortPriority: { [providerName: string]: number },
  hiddenUsers: string[],
  passwordFields: string[],
  mainListItemsPerPage: number,
  servicesUrls: Services,
  maxMinionPoolEventsPerPage: number,
  providerMigrationOptions: ProviderMigrationOptions
}
