// @flow

type Type = 'source' | 'destination'

export type Config = {
  disabledPages: string[],
  showUserDomainInput: boolean,
  defaultUserDomain: string,
  showOpenstackCurrentUserSwitch: boolean,
  useBarbicanSecrets: boolean,
  requestPollTimeout: number,
  sourceOptionsProviders: string[],
  instancesListBackgroundLoading: { default: number, [string]: number },
  extraOptionsApiCalls: Array<{ name: string, types: Type[], requiredFields: string[] }>,
  providerSortPriority: { [providerName: string]: number },
  hiddenUsers: string[],
  passwordFields: string[],
}
