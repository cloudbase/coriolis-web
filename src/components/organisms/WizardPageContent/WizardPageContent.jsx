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

import React from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'

import EndpointLogos from '../../atoms/EndpointLogos'
import WizardType from '../../molecules/WizardType'
import Button from '../../atoms/Button'
import WizardBreadcrumbs from '../../molecules/WizardBreadcrumbs'
import WizardEndpointList from '../WizardEndpointList'
import WizardInstances from '../WizardInstances'
import WizardNetworks from '../WizardNetworks'
import WizardStorage from '../WizardStorage'
import WizardOptions from '../WizardOptions'
import Schedule from '../Schedule'
import WizardSummary from '../WizardSummary'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import { providerTypes, wizardPages } from '../../../constants'
import configLoader from '../../../utils/Config'

import type { WizardData, WizardPage } from '../../../types/WizardData'
import type { Endpoint, StorageBackend, StorageMap } from '../../../types/Endpoint'
import type { Instance, Nic, Disk } from '../../../types/Instance'
import type { Field } from '../../../types/Field'
import type { Network, SecurityGroup } from '../../../types/Network'
import type { Schedule as ScheduleType } from '../../../types/Schedule'
import instanceStore from '../../../stores/InstanceStore'
import providerStore from '../../../stores/ProviderStore'
import endpointStore from '../../../stores/EndpointStore'
import networkStore from '../../../stores/NetworkStore'

import migrationArrowImage from './images/migration.js'

const Wrapper = styled.div`
  ${StyleProps.exactWidth(`${parseInt(StyleProps.contentWidth, 10) + 64}px`)}
  margin: 64px auto 32px auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
`
const Header = styled.div`
  text-align: center;
  font-size: 32px;
  font-weight: ${StyleProps.fontWeights.light};
  color: ${Palette.primary};
  margin-bottom: 32px;
`
const Body = styled.div`
  flex-grow: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  padding: 0 32px;
`
const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 32px 0 32px;
  margin-bottom: 80px;
`
const IconRepresentation = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;
  margin: 0 76px;
`
const Footer = styled.div``
const WizardTypeIcon = styled.div`
  width: 60px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 32px;
`
export const isOptionsPageValid = (data: ?any, schema: Field[]) => {
  const isValid = (field: Field): boolean => {
    if (data) {
      let fieldValue = data[field.name]
      if (fieldValue === null) {
        return false
      }
      if (fieldValue === undefined) {
        return field.default != null
      }
      return Boolean(fieldValue)
    }
    return field.default != null
  }

  if (schema && schema.length > 0) {
    let required = schema.filter(f => f.required && f.type !== 'object')
    schema.forEach(f => {
      if (f.type === 'object' && f.properties && f.properties.filter && f.properties.filter(p => isValid(p)).length > 0) {
        required = required.concat(f.properties.filter(p => p.required))
      }
    })

    let validFieldsCount = 0
    required.forEach(f => {
      if (isValid(f)) {
        validFieldsCount += 1
      }
    })

    if (validFieldsCount === required.length) {
      return true
    }
  }

  return false
}
type Props = {
  page: { id: string, title: string },
  type: 'replica' | 'migration',
  nextButtonDisabled: boolean,
  providerStore: typeof providerStore,
  instanceStore: typeof instanceStore,
  networkStore: typeof networkStore,
  endpointStore: typeof endpointStore,
  wizardData: WizardData,
  schedules: ScheduleType[],
  storageMap: StorageMap[],
  hasStorageMap: boolean,
  hasSourceOptions: boolean,
  pages: WizardPage[],
  onTypeChange: (isReplicaChecked: ?boolean) => void,
  onBackClick: () => void,
  onNextClick: () => void,
  onSourceEndpointChange: (endpoint: Endpoint) => void,
  onTargetEndpointChange: (endpoint: Endpoint) => void,
  onAddEndpoint: (provider: string, fromSource: boolean) => void,
  onInstancesSearchInputChange: (searchText: string) => void,
  onInstancesReloadClick: () => void,
  onInstanceClick: (instance: Instance) => void,
  onInstancePageClick: (page: number) => void,
  onDestOptionsChange: (field: Field, value: any) => void,
  onSourceOptionsChange: (field: Field, value: any) => void,
  onNetworkChange: (nic: Nic, network: Network, secGroups: ?SecurityGroup[]) => void,
  onStorageChange: (sourceStorage: Disk, targetStorage: StorageBackend, type: 'backend' | 'disk') => void,
  onAddScheduleClick: (schedule: ScheduleType) => void,
  onScheduleChange: (scheduleId: string, schedule: ScheduleType) => void,
  onScheduleRemove: (scheudleId: string) => void,
  onContentRef: (ref: any) => void,
}
type TimezoneValue = 'local' | 'utc'
type State = {
  useAdvancedOptions: boolean,
  timezone: TimezoneValue,
}
const testName = 'wpContent'
@observer
class WizardPageContent extends React.Component<Props, State> {
  state = {
    useAdvancedOptions: false,
    timezone: 'local',
  }

  componentDidMount() {
    this.props.onContentRef(this)
  }

  componentWillUnmount() {
    this.props.onContentRef(null)
  }

  getProvidersType(type: string) {
    if (this.props.type === 'replica') {
      if (type === 'source') {
        return providerTypes.SOURCE_REPLICA
      }
      return providerTypes.TARGET_REPLICA
    }

    if (type === 'source') {
      return providerTypes.SOURCE_MIGRATION
    }
    return providerTypes.TARGET_MIGRATION
  }

  getProviders(type: string): string[] {
    let validProviders = {}
    let providerType = this.getProvidersType(type)
    let providersObject = this.props.providerStore.providers

    if (!providersObject) {
      return []
    }

    Object.keys(providersObject).forEach(provider => {
      if (providersObject[provider].types.findIndex(t => t === providerType) > -1) {
        validProviders[provider] = true
      }
    })

    return this.props.providerStore.providerNames.filter(p => validProviders[p])
  }

  isNetworksPageValid() {
    if (this.props.networkStore.loading || this.props.instanceStore.loadingInstancesDetails) {
      return false
    }

    let instances = this.props.instanceStore.instancesDetails
    if (instances.length === 0) {
      return true
    }

    if (instances.find(i => i.devices)) {
      if (instances.find(i => i.devices.nics && i.devices.nics.length > 0)) {
        return this.props.wizardData.networks && this.props.wizardData.networks.length > 0
      }
      return true
    }

    return false
  }

  isNextButtonDisabled() {
    if (this.props.nextButtonDisabled) {
      return true
    }

    switch (this.props.page.id) {
      case 'source':
        return !this.props.wizardData.source
      case 'target':
        return !this.props.wizardData.target
      case 'vms':
        return !this.props.wizardData.selectedInstances || !this.props.wizardData.selectedInstances.length
      case 'source-options':
        return !isOptionsPageValid(this.props.wizardData.sourceOptions, this.props.providerStore.sourceSchema)
      case 'dest-options':
        return !isOptionsPageValid(this.props.wizardData.destOptions, this.props.providerStore.destinationSchema)
      case 'networks':
        return !this.isNetworksPageValid()
      default:
        return false
    }
  }

  handleAdvancedOptionsToggle(useAdvancedOptions: boolean) {
    this.setState({ useAdvancedOptions })
  }

  handleTimezoneChange(timezone: TimezoneValue) {
    this.setState({ timezone })
  }

  renderHeader() {
    let title = this.props.page.title

    if (this.props.page.id === 'type') {
      title += ` ${this.props.type.charAt(0).toUpperCase() + this.props.type.substr(1)}`
    }

    return <Header data-test-id={`${testName}-header`}>{title}</Header>
  }

  renderBody() {
    let body = null

    let getOptionsLoadingSkipFields = (type: 'source' | 'destination') => {
      let extraOptionsConfig = configLoader.config.extraOptionsApiCalls.find(o => {
        let provider = type === 'source' ? this.props.wizardData.source && this.props.wizardData.source.type
          : this.props.wizardData.target && this.props.wizardData.target.type
        return o.name === provider && o.types.find(t => t === type)
      })
      let optionsLoadingRequiredFields = []
      if (extraOptionsConfig) {
        optionsLoadingRequiredFields = extraOptionsConfig.requiredFields
      }
      return optionsLoadingRequiredFields
    }

    switch (this.props.page.id) {
      case 'type':
        body = (
          <WizardType
            selected={this.props.type}
            onChange={this.props.onTypeChange}
          />
        )
        break
      case 'source':
        body = (
          <WizardEndpointList
            providers={this.getProviders('source')}
            loading={this.props.providerStore.providersLoading}
            otherEndpoint={this.props.wizardData.target}
            selectedEndpoint={this.props.wizardData.source}
            endpoints={this.props.endpointStore.endpoints}
            onChange={this.props.onSourceEndpointChange}
            onAddEndpoint={type => { this.props.onAddEndpoint(type, true) }}
          />
        )
        break
      case 'target':
        body = (
          <WizardEndpointList
            providers={this.getProviders('target')}
            loading={this.props.providerStore.providersLoading}
            otherEndpoint={this.props.wizardData.source}
            selectedEndpoint={this.props.wizardData.target}
            endpoints={this.props.endpointStore.endpoints}
            onChange={this.props.onTargetEndpointChange}
            onAddEndpoint={type => { this.props.onAddEndpoint(type, false) }}
          />
        )
        break
      case 'vms':
        body = (
          <WizardInstances
            instances={this.props.instanceStore.instances}
            instancesPerPage={this.props.instanceStore.instancesPerPage}
            chunksLoading={this.props.instanceStore.chunksLoading}
            currentPage={this.props.instanceStore.currentPage}
            searchText={this.props.instanceStore.searchText}
            loading={this.props.instanceStore.instancesLoading}
            searching={this.props.instanceStore.searching}
            searchNotFound={this.props.instanceStore.searchNotFound}
            reloading={this.props.instanceStore.reloading}
            onSearchInputChange={this.props.onInstancesSearchInputChange}
            onReloadClick={this.props.onInstancesReloadClick}
            onInstanceClick={this.props.onInstanceClick}
            onPageClick={this.props.onInstancePageClick}
            selectedInstances={this.props.wizardData.selectedInstances}
            hasSourceOptions={this.props.hasSourceOptions}
          />
        )
        break
      case 'source-options':
        body = (
          <WizardOptions
            loading={this.props.providerStore.sourceSchemaLoading || this.props.providerStore.sourceOptionsPrimaryLoading}
            optionsLoading={this.props.providerStore.sourceOptionsSecondaryLoading}
            optionsLoadingSkipFields={getOptionsLoadingSkipFields('source')}
            fields={this.props.providerStore.sourceSchema}
            onChange={this.props.onSourceOptionsChange}
            data={this.props.wizardData.sourceOptions}
            useAdvancedOptions
            hasStorageMap={false}
            wizardType={`${this.props.type}-source-options`}
          />
        )
        break
      case 'dest-options':
        body = (
          <WizardOptions
            loading={this.props.providerStore.destinationSchemaLoading || this.props.providerStore.destinationOptionsPrimaryLoading}
            optionsLoading={this.props.providerStore.destinationOptionsSecondaryLoading}
            optionsLoadingSkipFields={[...getOptionsLoadingSkipFields('destination'), 'description', 'execute_now', 'execute_now_options', 'default_storage']}
            selectedInstances={this.props.wizardData.selectedInstances}
            fields={this.props.providerStore.destinationSchema}
            onChange={this.props.onDestOptionsChange}
            data={this.props.wizardData.destOptions}
            useAdvancedOptions={this.state.useAdvancedOptions}
            hasStorageMap={this.props.hasStorageMap}
            storageBackends={this.props.endpointStore.storageBackends}
            storageConfigDefault={this.props.endpointStore.storageConfigDefault}
            wizardType={this.props.type}
            onAdvancedOptionsToggle={useAdvancedOptions => { this.handleAdvancedOptionsToggle(useAdvancedOptions) }}
          />
        )
        break
      case 'networks':
        body = (
          <WizardNetworks
            networks={this.props.networkStore.networks}
            selectedNetworks={this.props.wizardData.networks}
            loading={this.props.networkStore.loading}
            instancesDetails={this.props.instanceStore.instancesDetails}
            loadingInstancesDetails={this.props.instanceStore.loadingInstancesDetails}
            onChange={this.props.onNetworkChange}
          />
        )
        break
      case 'storage':
        body = (
          <WizardStorage
            storageBackends={this.props.endpointStore.storageBackends}
            instancesDetails={this.props.instanceStore.instancesDetails}
            storageMap={this.props.storageMap}
            onChange={this.props.onStorageChange}
          />
        )
        break
      case 'schedule':
        body = (
          <Schedule
            schedules={this.props.schedules}
            onAddScheduleClick={this.props.onAddScheduleClick}
            onChange={this.props.onScheduleChange}
            onRemove={this.props.onScheduleRemove}
            timezone={this.state.timezone}
            onTimezoneChange={timezone => { this.handleTimezoneChange(timezone) }}
            secondaryEmpty
          />
        )
        break
      case 'summary':
        body = (
          <WizardSummary
            data={this.props.wizardData}
            schedules={this.props.schedules}
            storageMap={this.props.storageMap}
            wizardType={this.props.type}
            instancesDetails={this.props.instanceStore.instancesDetails}
          />
        )
        break
      default:
    }

    return <Body>{body}</Body>
  }

  renderNavigationActions() {
    let sourceEndpoint = this.props.wizardData.source && this.props.wizardData.source.type
    let targetEndpoint = this.props.wizardData.target && this.props.wizardData.target.type
    let currentPageIndex = wizardPages.findIndex(p => p.id === this.props.page.id)
    let isLastPage = currentPageIndex === wizardPages.length - 1

    return (
      <Navigation>
        <Button secondary onClick={this.props.onBackClick}>Back</Button>
        <IconRepresentation>
          <EndpointLogos height={32} endpoint={sourceEndpoint || ''} />
          <WizardTypeIcon
            dangerouslySetInnerHTML={{
              __html: this.props.type === 'replica'
                ? migrationArrowImage(Palette.alert) : migrationArrowImage(Palette.primary),
            }}
          />
          <EndpointLogos height={32} endpoint={targetEndpoint} />
        </IconRepresentation>
        <Button
          onClick={this.props.onNextClick}
          disabled={this.isNextButtonDisabled()}
        >{isLastPage ? 'Finish' : 'Next'}</Button>
      </Navigation>
    )
  }

  render() {
    if (!this.props.page) {
      return null
    }

    return (
      <Wrapper>
        {this.renderHeader()}
        {this.renderBody()}
        <Footer>
          {this.renderNavigationActions()}
          <WizardBreadcrumbs
            selected={this.props.page}
            pages={this.props.pages}
          />
        </Footer>
      </Wrapper>
    )
  }
}

export default WizardPageContent
