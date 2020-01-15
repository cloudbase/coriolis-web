// @flow

type Type = 'source' | 'destination'

type ExtraOption = {
  name: string,
  types: Type[],
  requiredFields: string[],
  requiredValues?: {
    field: string,
    values: string[],
  }[]
}

export type Config = {
  disabledPages: string[],
  showUserDomainInput: boolean,
  defaultUserDomain: string,
  showOpenstackCurrentUserSwitch: boolean,
  useBarbicanSecrets: boolean,
  requestPollTimeout: number,
  instancesListBackgroundLoading: { default: number, [string]: number },
  extraOptionsApiCalls: ExtraOption[],
  providerSortPriority: { [providerName: string]: number },
  hiddenUsers: string[],
  passwordFields: string[],
  mainListItemsPerPage: number,
}
