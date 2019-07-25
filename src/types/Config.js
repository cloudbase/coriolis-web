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
  providersWithEnvOptions: Array<{ name: string, type: 'source' | 'destination', envRequiredFields: string[] }>,
  providerSortPriority: { [providerName: string]: number },
  hiddenUsers: string[],
}
