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
  providersWithExtraOptions: Array<string | { name: string, envRequiredFields: string[] }>,
}
