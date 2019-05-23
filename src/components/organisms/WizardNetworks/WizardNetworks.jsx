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
import { observer } from 'mobx-react'
import styled from 'styled-components'

import AutocompleteDropdown from '../../molecules/AutocompleteDropdown'
import StatusImage from '../../atoms/StatusImage'
import Dropdown from '../../molecules/Dropdown'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import type { Instance, Nic as NicType } from '../../../types/Instance'
import type { Network, NetworkMap } from '../../../types/Network'

import networkImage from './images/network.svg'
import bigNetworkImage from './images/network-big.svg'
import arrowImage from './images/arrow.svg'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`
const LoadingWrapper = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const LoadingText = styled.div`
  margin-top: 38px;
  font-size: 18px;
`
const NicsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`
const Nic = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px solid ${Palette.grayscale[1]};
  padding: 8px 0;

  &:last-child {
    border-bottom: 1px solid ${Palette.grayscale[1]};
  }
`
const NetworkImage = styled.div`
  ${StyleProps.exactSize('48px')}
  background: url('${networkImage}') center no-repeat;
  margin-right: 16px;
`
const NetworkTitle = styled.div`
  width: 320px;
`
const NetworkName = styled.div`
  font-size: 16px;
`
const NetworkSubtitle = styled.div`
  font-size: 12px;
  color: ${Palette.grayscale[5]};
  margin-top: 1px;
`
const ArrowImage = styled.div`
  min-width: 32px;
  ${StyleProps.exactHeight('16px')}
  background: url('${arrowImage}') center no-repeat;
  flex-grow: 1;
  margin-right: 16px;
`
const NoNicsMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64px;
  width: 440px;
`
const BigNetworkImage = styled.div`
  margin-bottom: 46px;
  ${StyleProps.exactSize('96px')}
  background: url('${bigNetworkImage}') center no-repeat;
`
const NoNicsTitle = styled.div`
  margin-bottom: 10px;
  font-size: 18px;
`
const NoNicsSubtitle = styled.div`
  color: ${Palette.grayscale[4]};
  text-align: center;
`

type Props = {
  loading: boolean,
  loadingInstancesDetails: boolean,
  networks: Network[],
  instancesDetails: Instance[],
  selectedNetworks: ?NetworkMap[],
  onChange: (nic: NicType, network: Network) => void,
}
@observer
class WizardNetworks extends React.Component<Props> {
  isLoading() {
    return this.props.loadingInstancesDetails
  }

  renderLoading() {
    if (!this.isLoading()) {
      return null
    }

    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>Loading networks...</LoadingText>
      </LoadingWrapper>
    )
  }

  renderNoNics() {
    return (
      <NoNicsMessage>
        <BigNetworkImage />
        <NoNicsTitle data-test-id="wNetworks-noNics">No networks were found</NoNicsTitle>
        <NoNicsSubtitle>We could not find any Networks attached to the selected Instances. Coriolis will skip this step.</NoNicsSubtitle>
      </NoNicsMessage>
    )
  }

  renderNics() {
    if (this.isLoading()) {
      return null
    }
    let nics = []
    this.props.instancesDetails.forEach(instance => {
      if (!instance.devices || !instance.devices.nics) {
        return
      }
      instance.devices.nics.forEach(nic => {
        if (nics.find(n => n.network_name === nic.network_name)) {
          return
        }
        nics.push(nic)
      })
    })

    if (nics.length === 0) {
      return this.renderNoNics()
    }

    return (
      <NicsWrapper>
        {nics.map(nic => {
          let connectedTo = this.props.instancesDetails.filter(i => {
            if (!i.devices || !i.devices.nics) {
              return false
            }
            if (i.devices.nics.find(n => n.network_name === nic.network_name)) {
              return true
            }
            return false
          }).map(i => i.instance_name)
          let selectedNetwork = this.props.selectedNetworks && this.props.selectedNetworks.find(n => n.sourceNic.network_name === nic.network_name)
          return (
            <Nic key={nic.id} data-test-id="networkItem">
              <NetworkImage />
              <NetworkTitle>
                <NetworkName data-test-id={`wNetworks-networkName-${nic.id}`}>{nic.network_name}</NetworkName>
                <NetworkSubtitle data-test-id={`wNetworks-connectedTo-${nic.id}`}>{`Connected to ${connectedTo.join(', ')}`}</NetworkSubtitle>
              </NetworkTitle>
              <ArrowImage />
              {this.props.networks.length > 10 ? (
                <AutocompleteDropdown
                  width={StyleProps.inputSizes.large.width}
                  selectedItem={selectedNetwork ? selectedNetwork.targetNetwork : null}
                  items={this.props.networks}
                  onChange={(item: Network) => { this.props.onChange(nic, item) }}
                  labelField="name"
                  valueField="id"
                />
              ) :
                (
                  <Dropdown
                    large
                    centered
                    noSelectionMessage="Select ..."
                    noItemsMessage={this.props.loading ? 'Loading ...' : 'No networks found'}
                    selectedItem={selectedNetwork ? selectedNetwork.targetNetwork : null}
                    items={this.props.networks}
                    labelField="name"
                    valueField="id"
                    onChange={(item: Network) => { this.props.onChange(nic, item) }}
                    data-test-id={`wNetworks-dropdown-${nic.id}`}
                  />
                )}
            </Nic>
          )
        })}
      </NicsWrapper>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderLoading()}
        {this.renderNics()}
      </Wrapper>
    )
  }
}

export default WizardNetworks
