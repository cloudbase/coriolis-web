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

import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import {
  WizardType,
  Button,
  WizardBreadcrumbs,
  EndpointLogos,
  WizardEndpointList,
  WizardInstances,
  WizardNetworks,
  WizardOptions,
  Schedule,
  WizardSummary,
} from 'components'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import { providerTypes, wizardConfig } from '../../../config'

import migrationArrowImage from './images/migration.js'

const bodyWidth = 800
const Wrapper = styled.div`
  ${StyleProps.exactWidth(`${bodyWidth + 64}px`)}
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
  justify-content: space-between;
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
`

class WizardPageContent extends React.Component {
  static propTypes = {
    page: PropTypes.object,
    type: PropTypes.string,
    nextButtonDisabled: PropTypes.bool,
    providerStore: PropTypes.object,
    instanceStore: PropTypes.object,
    networkStore: PropTypes.object,
    wizardData: PropTypes.object,
    endpoints: PropTypes.array,
    onTypeChange: PropTypes.func,
    onBackClick: PropTypes.func,
    onNextClick: PropTypes.func,
    onSourceEndpointChange: PropTypes.func,
    onTargetEndpointChange: PropTypes.func,
    onAddEndpoint: PropTypes.func,
    onInstancesSearchInputChange: PropTypes.func,
    onInstancesNextPageClick: PropTypes.func,
    onInstancesPreviousPageClick: PropTypes.func,
    onInstancesReloadClick: PropTypes.func,
    onInstanceClick: PropTypes.func,
    onOptionsChange: PropTypes.func,
    onNetworkChange: PropTypes.func,
    onAddScheduleClick: PropTypes.func,
    onScheduleChange: PropTypes.func,
    onScheduleRemove: PropTypes.func,
  }

  constructor() {
    super()

    this.state = {
      useAdvancedOptions: false,
      timezone: 'local',
    }
  }

  getProvidersType(type) {
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

  getProviders(type) {
    let providers = []
    let providerType = this.getProvidersType(type)

    Object.keys(this.props.providerStore.providers || {}).forEach(provider => {
      if (this.props.providerStore.providers[provider].types.findIndex(t => t === providerType) > -1) {
        providers.push(provider)
      }
    })

    return providers
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

  isOptionsPageValid() {
    let schema = this.props.providerStore.optionsSchema
    if (schema && schema.length > 0) {
      let required = schema.filter(f => f.required && f.type !== 'object')
      let validFieldsCount = 0
      required.forEach(f => {
        if (this.props.wizardData.options && this.props.wizardData.options[f.name] !== null && this.props.wizardData.options[f.name] !== undefined) {
          validFieldsCount += 1
        }
      })

      if (validFieldsCount === required.length) {
        return true
      }
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
      case 'options':
        return !this.isOptionsPageValid()
      case 'networks':
        return !this.isNetworksPageValid()
      default:
        return false
    }
  }

  handleAdvancedOptionsToggle(useAdvancedOptions) {
    this.setState({ useAdvancedOptions })
  }

  handleTimezoneChange(timezone) {
    this.setState({ timezone: timezone.value })
  }

  renderHeader() {
    let title = this.props.page.title

    if (this.props.page.id === 'type') {
      title += ` ${this.props.type.charAt(0).toUpperCase() + this.props.type.substr(1)}`
    }

    return <Header>{title}</Header>
  }

  renderBody() {
    let body = null

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
            endpoints={this.props.endpoints}
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
            endpoints={this.props.endpoints}
            onChange={this.props.onTargetEndpointChange}
            onAddEndpoint={type => { this.props.onAddEndpoint(type, false) }}
          />
        )
        break
      case 'vms':
        body = (
          <WizardInstances
            instances={this.props.instanceStore.instances}
            loading={this.props.instanceStore.instancesLoading}
            searching={this.props.instanceStore.searching}
            searchNotFound={this.props.instanceStore.searchNotFound}
            reloading={this.props.instanceStore.reloading}
            onSearchInputChange={this.props.onInstancesSearchInputChange}
            onNextPageClick={this.props.onInstancesNextPageClick}
            onPreviousPageClick={this.props.onInstancesPreviousPageClick}
            hasNextPage={this.props.instanceStore.hasNextPage}
            currentPage={this.props.instanceStore.currentPage}
            loadingPage={this.props.instanceStore.loadingPage}
            onReloadClick={this.props.onInstancesReloadClick}
            onInstanceClick={this.props.onInstanceClick}
            selectedInstances={this.props.wizardData.selectedInstances}
          />
        )
        break
      case 'options':
        body = (
          <WizardOptions
            selectedInstances={this.props.wizardData.selectedInstances}
            fields={this.props.providerStore.optionsSchema}
            onChange={this.props.onOptionsChange}
            data={this.props.wizardData.options}
            useAdvancedOptions={this.state.useAdvancedOptions}
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
      case 'schedule':
        body = (
          <Schedule
            schedules={this.props.wizardData.schedules}
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
            wizardType={this.props.type}
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
    let currentPageIndex = wizardConfig.pages.findIndex(p => p.id === this.props.page.id)
    let isLastPage = currentPageIndex === wizardConfig.pages.length - 1

    return (
      <Navigation>
        <Button secondary onClick={this.props.onBackClick}>Back</Button>
        <IconRepresentation>
          <EndpointLogos height={32} endpoint={sourceEndpoint} />
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
          <WizardBreadcrumbs selected={this.props.page} wizardType={this.props.type} />
        </Footer>
      </Wrapper>
    )
  }
}

export default WizardPageContent
