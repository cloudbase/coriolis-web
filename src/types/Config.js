// @flow

export type Config = {
  disabledPages: string[],
  showUserDomainInput: boolean,
  defaultUserDomain: string,
  showOpenstackCurrentUserSwitch: boolean,
  useBarbicanSecrets: boolean,
  requestPollTimeout: number,
  sourceOptionsProviders: string[],
  instancesListBackgroundLoading: { default: number, [string]: number },
  sourceProvidersWithExtraOptions: Array<string | { name: string, envRequiredFields: string[] }>,
  destinationProvidersWithExtraOptions: Array<string | { name: string, envRequiredFields: string[] }>,
  providerSortPriority: { [providerName: string]: number },
  hiddenUsers: string[],
}
