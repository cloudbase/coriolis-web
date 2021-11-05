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
  providerSortPriority: { [providerName in ProviderTypes]: number },
  providerNames: { [providerName in ProviderTypes]: string }
  hiddenUsers: string[],
  passwordFields: string[],
  mainListItemsPerPage: number,
  servicesUrls: Services,
  maxMinionPoolEventsPerPage: number,
}
