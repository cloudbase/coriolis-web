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
import { Collapse } from 'react-collapse'

import Arrow from '../../atoms/Arrow'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import type { MainItem } from '../../../types/MainItem'
import type { Instance, Nic, Disk } from '../../../types/Instance'
import type { Network } from '../../../types/Network'

import instanceIcon from './images/instance.svg'
import networkIcon from './images/network.svg'
import storageIcon from './images/storage.svg'
import arrowIcon from './images/arrow.svg'

const Wrapper = styled.div`
  margin-top: 24px;
  margin-bottom: 48px;
`
const ArrowStyled = styled(Arrow)`
  position: absolute;
  left: -24px;
`
const Header = styled.div`
  display: flex;
`
const HeaderLabel = styled.div`
  font-size: 10px;
  color: ${Palette.grayscale[3]};
  font-weight: ${StyleProps.fontWeights.medium};
  text-transform: uppercase;
  width: 50%;
  margin-bottom: 8px;
  &:last-child { margin-left: 36px; }
`
const InstanceInfo = styled.div`
  background: ${Palette.grayscale[1]};
  border-radius: ${StyleProps.borderRadius};
  margin-bottom: 32px;
  &:last-child { margin-bottom: 0; }
`
const InstanceName = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${Palette.grayscale[5]};
  font-size: 16px;
`
const InstanceBody = styled.div`
  font-size: 14px;
`
const Row = styled.div`
  position: relative;
  padding: 8px 0;
  border-bottom: 1px solid white;
  transition: all ${StyleProps.animations.swift};
  &:last-child {
    border-bottom: 0;
    border-bottom-left-radius: ${StyleProps.borderRadius};
    border-bottom-right-radius: ${StyleProps.borderRadius};
  }
  &:hover {
    background: ${Palette.grayscale[0]};
    ${ArrowStyled} {
      opacity: 1;
    }
  }
  cursor: pointer;
`
const RowHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0 16px;
`
const RowHeaderColumn = styled.div`
  display: flex;
  align-items: center;
  ${StyleProps.exactWidth('50%')}
  &:last-child { margin-left: 19px; }
`
const HeaderName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  ${props => StyleProps.exactWidth(`calc(100% - ${props.source ? 120 : 8}px)`)}
`
const RowBody = styled.div`
  display: flex;
  color: ${Palette.grayscale[5]};
  padding: 0 16px;
  margin-top: 4px;
`
const RowBodyColumn = styled.div`
  &:first-child {
    ${StyleProps.exactWidth('calc(50% - 70px)')}
    margin-right: 88px;
  }
  &:last-child {
    ${StyleProps.exactWidth('calc(50% - 16px)')}
  }
`
const RowBodyColumnValue = styled.div`
  overflow-wrap: break-word;
`
const getHeaderIcon = (icon: 'instance' | 'network' | 'storage'): string => {
  switch (icon) {
    case 'instance':
      return instanceIcon
    case 'network':
      return networkIcon
    default:
      return storageIcon
  }
}
const HeaderIcon = styled.div`
  width: 16px;
  height: 16px;
  background: url('${props => getHeaderIcon(props.icon)}') center no-repeat;
  margin-right: 16px;
`
const ArrowIcon = styled.div`
  width: 32px;
  height: 16px;
  background: url('${arrowIcon}') center no-repeat;
  margin-left: 16px;
`
export const TEST_ID = 'mainDetailsTable'

export type Props = {
  item: ?MainItem,
  instancesDetails: Instance[],
  networks?: Network[],
}
type State = {
  openedRows: string[],
}

class MainDetailsTable extends React.Component<Props, State> {
  state = {
    openedRows: [],
  }

  getTransferResult(instance: Instance): ?Instance {
    if (this.props.item && this.props.item.transfer_result) {
      let transferInstanceKey = Object.keys(this.props.item.transfer_result).find(i => i.indexOf(instance.name))
      if (transferInstanceKey && this.props.item && this.props.item.transfer_result) {
        let result = this.props.item.transfer_result[transferInstanceKey]
        result.instance_name = transferInstanceKey
        return result
      }
    }
    return null
  }

  handleRowClick(id: string) {
    if (this.state.openedRows.find(i => i === id)) {
      this.setState({
        openedRows: this.state.openedRows.filter(i => i !== id),
      })
    } else {
      this.setState({
        openedRows: [...this.state.openedRows, id],
      })
    }
  }

  renderRow(
    id: string,
    icon: 'instance' | 'network' | 'storage',
    sourceName: string,
    destinationName: string,
    sourceBody: string[],
    destinationBody: string[]
  ) {
    let isOpened: boolean = Boolean(this.state.openedRows.find(i => i === id))

    return (
      <Row key={id} onClick={() => { this.handleRowClick(id) }}>
        <ArrowStyled
          primary
          orientation={isOpened ? 'up' : 'down'}
          opacity={isOpened ? 1 : 0}
          thick
        />
        <RowHeader>
          <RowHeaderColumn>
            <HeaderIcon icon={icon} />
            <HeaderName source data-test-id={`${TEST_ID}-source-${icon}`}>{sourceName}</HeaderName>
            {destinationName ? <ArrowIcon /> : null}
          </RowHeaderColumn>
          <RowHeaderColumn>
            <HeaderName data-test-id={`${TEST_ID}-destination-${icon}`}>{destinationName}</HeaderName>
          </RowHeaderColumn>
        </RowHeader>
        <Collapse isOpened={isOpened} springConfig={{ stiffness: 100, damping: 20 }}>
          <RowBody>
            <RowBodyColumn>{sourceBody.map(l => <RowBodyColumnValue key={l}>{l}</RowBodyColumnValue>)}</RowBodyColumn>
            <RowBodyColumn>{destinationBody.map(l => <RowBodyColumnValue key={l}>{l}</RowBodyColumnValue>)}</RowBodyColumn>
          </RowBody>
        </Collapse>
      </Row>
    )
  }

  renderStorage(instance: Instance) {
    let storageMapping = this.props.item && this.props.item.storage_mappings
    let transferResult = this.getTransferResult(instance)
    let rows = []
    instance.devices.disks.forEach(disk => {
      let sourceName = disk.id
      let mappedDisk = storageMapping && storageMapping.disk_mappings &&
        storageMapping.disk_mappings.find(m => String(m.disk_id) === String(disk.id))
      let destinationName: string = (
        this.props.item && this.props.item.storage_mappings
        && this.props.item.storage_mappings.default
      ) || 'Default'
      if (mappedDisk) {
        destinationName = mappedDisk.destination
      }
      let getBody = (d: Disk): string[] => {
        let body: string[] = []
        if (d.size_bytes) {
          body.push(`Size: ${(d.size_bytes / 1024 / 1024).toFixed(0)} MB`)
        }
        if (d.storage_backend_identifier) {
          body.push(`Backend Identifier: ${d.storage_backend_identifier}`)
        }
        if (d.format) {
          body.push(`Format: ${d.format}`)
        }
        if (d.guest_device) {
          body.push(`Guest Device: ${d.guest_device}`)
        }
        return body
      }
      let sourceBody = getBody(disk)
      let destinationBody = []
      if (transferResult) {
        let transferDisk = transferResult.devices.disks.find(d => d.storage_backend_identifier === destinationName)
        if (transferDisk) {
          destinationName = transferDisk.name || transferDisk.id
          destinationBody = getBody(transferDisk)
        }
      } else if (this.props.item && this.props.item.status === 'RUNNING' && this.props.item.type === 'migration') {
        destinationBody = ['Waiting for migration to finish']
      }

      rows.push(this.renderRow(
        `${instance.instance_name || instance.name}-${sourceName}-${destinationName}`,
        'storage',
        sourceName,
        destinationName,
        sourceBody,
        destinationBody
      ))
    })

    return rows
  }

  renderNetworks(instance: Instance) {
    let destinationNetworkMap = null
    if (this.props.item && this.props.item.network_map) {
      destinationNetworkMap = this.props.item.network_map
    }
    if (destinationNetworkMap == null) {
      return null
    }
    let transferResult = this.getTransferResult(instance)
    let rows = []
    instance.devices.nics.forEach(nic => {
      if (destinationNetworkMap && destinationNetworkMap[nic.network_name]) {
        let getBody = (n: Nic): string[] => {
          let body: string[] = [`Name: ${n.network_name}`]
          let ipv4 = n.ip_addresses ? n.ip_addresses.find(ip => /(?:\d+?\.){3}\d+/g.exec(ip)) : null
          let ipv6 = n.ip_addresses ? n.ip_addresses.find(ip => /\w*:\w*/g.exec(ip)) : null
          if (ipv4) {
            body.push(`IP Address (IPv4): ${ipv4}`)
          }
          if (ipv6) {
            body.push(`IP Address (IPv6): ${ipv6}`)
          }
          return body
        }
        let destNetMapObj = destinationNetworkMap[nic.network_name]
        let destinationNetworkId = String(typeof destNetMapObj === 'string' || !destNetMapObj
          || !destNetMapObj.id ? destNetMapObj : destNetMapObj.id)
        let destinationNetwork = this.props.networks && this.props.networks.find(n => n.id === destinationNetworkId)

        let sourceBody = getBody(nic)

        let destinationBody = []
        if (destNetMapObj.security_groups && destNetMapObj.security_groups.length) {
          let destSecGroupsInfo = (destinationNetwork && destinationNetwork.security_groups) || []
          // $FlowIgnore
          let secNames = destNetMapObj.security_groups.map(s => {
            let foundSecGroupInfo = destSecGroupsInfo.find(si => si.id ? si.id === s : si === s)
            return foundSecGroupInfo && foundSecGroupInfo.name ? foundSecGroupInfo.name : s
          })
          destinationBody = [`Security Groups: ${secNames.join(', ')}`]
        }

        let destinationNetworkName = destinationNetworkId
        if (destinationNetwork) {
          destinationNetworkName = destinationNetwork.name
        }
        if (transferResult) {
          let destinationNic = transferResult.devices.nics
            .find(n => n.network_id === destinationNetworkId || n.network_name === destinationNetworkId)
          if (destinationNic) {
            destinationNetworkName = destinationNic.network_name
            destinationBody = getBody(destinationNic)
          }
        } else if (this.props.item && this.props.item.status === 'RUNNING' && this.props.item.type === 'migration') {
          destinationBody = ['Waiting for migration to finish']
        }

        rows.push(this.renderRow(
          `${instance.instance_name || instance.name}-${nic.network_name}`,
          'network',
          nic.mac_address,
          destinationNetworkName,
          sourceBody,
          destinationBody
        ))
      }
    })

    return rows
  }

  renderInstanceDetails(instance: Instance) {
    let getBody = (i: Instance): string[] => [
      `Cores: ${i.num_cpu}`,
      `Memory: ${i.memory_mb} MB`,
      `Flavor Name: ${i.flavor_name || 'N/A'}`,
      `OS Type: ${i.os_type}`,
    ]

    let sourceBody: string[] = getBody(instance)
    let destinationBody: string[] = []
    let destinationName: string = ''
    let transferResult = this.getTransferResult(instance)
    if (transferResult) {
      destinationName = transferResult.instance_name || transferResult.name
      destinationBody = getBody(transferResult)
    } else if (this.props.item && this.props.item.status === 'RUNNING' && this.props.item.type === 'migration') {
      destinationName = 'Waiting for migration to finish'
    }
    let instanceName = instance.instance_name || instance.name
    return this.renderRow(
      instanceName,
      'instance',
      instanceName,
      destinationName,
      sourceBody,
      destinationBody
    )
  }

  render() {
    if (this.props.instancesDetails.length === 0 || !this.props.item) {
      return null
    }

    return (
      <Wrapper>
        <Header>
          <HeaderLabel>Source</HeaderLabel>
          <HeaderLabel>Destination</HeaderLabel>
        </Header>
        {this.props.instancesDetails.map(instance => (
          <InstanceInfo key={instance.name}>
            <InstanceName data-test-id={`${TEST_ID}-instanceName-${instance.name}`}>{instance.name}</InstanceName>
            <InstanceBody>
              {this.renderInstanceDetails(instance)}
              {this.renderNetworks(instance)}
              {this.renderStorage(instance)}
            </InstanceBody>
          </InstanceInfo>
        ))}
      </Wrapper>
    )
  }
}

export default MainDetailsTable
