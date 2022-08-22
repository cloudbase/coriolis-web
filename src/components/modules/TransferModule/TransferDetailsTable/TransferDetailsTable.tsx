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

import * as React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { Collapse } from 'react-collapse'

import Arrow from '@src/components/ui/Arrow'

import { ThemePalette, ThemeProps } from '@src/components/Theme'

import {
  TransferNetworkMap, isNetworkMapSecurityGroups,
  isNetworkMapSourceDest, TransferItem,
} from '@src/@types/MainItem'
import type { Instance, Nic, Disk } from '@src/@types/Instance'
import { Network, NetworkUtils } from '@src/@types/Network'

import { MinionPool } from '@src/@types/MinionPool'
import { EndpointUtils, StorageBackend } from '@src/@types/Endpoint'
import instanceIcon from './images/instance.svg'
import networkIcon from './images/network.svg'
import storageIcon from './images/storage.svg'
import arrowIcon from './images/arrow.svg'

export const GlobalStyle = createGlobalStyle`
  .ReactCollapse--collapse {
    transition: height 0.4s ease-in-out;
  }
`
const Wrapper = styled.div<any>`
  margin: 24px 0;
`
export const ArrowStyled = styled(Arrow)`
  position: absolute;
  left: -24px;
`
const Header = styled.div<any>`
  display: flex;
`
const HeaderLabel = styled.div<any>`
  font-size: 10px;
  color: ${ThemePalette.grayscale[3]};
  font-weight: ${ThemeProps.fontWeights.medium};
  text-transform: uppercase;
  width: 50%;
  margin-bottom: 8px;
  &:last-child { margin-left: 36px; }
`
const InstanceInfo = styled.div<any>`
  background: ${ThemePalette.grayscale[1]};
  border-radius: ${ThemeProps.borderRadius};
  margin-bottom: 32px;
  &:last-child { margin-bottom: 0; }
`
const InstanceName = styled.div<any>`
  padding: 16px;
  border-bottom: 1px solid ${ThemePalette.grayscale[5]};
  font-size: 16px;
`
const InstanceBody = styled.div<any>`
  font-size: 14px;
`
export const Row = styled.div`
  position: relative;
  padding: 8px 0;
  border-bottom: 1px solid white;
  transition: all ${ThemeProps.animations.swift};
  &:last-child {
    border-bottom: 0;
    border-bottom-left-radius: ${ThemeProps.borderRadius};
    border-bottom-right-radius: ${ThemeProps.borderRadius};
  }
  &:hover {
    background: ${ThemePalette.grayscale[0]};
    ${ArrowStyled} {
      opacity: 1;
    }
  }
  cursor: pointer;
`
export const RowHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0 16px;
`
export const RowHeaderColumn = styled.div`
  display: flex;
  align-items: center;
  ${ThemeProps.exactWidth('50%')}
  &:last-child { margin-left: 19px; }
`
export const HeaderName = styled.div<{ source?: boolean }>`
  overflow: hidden;
  text-overflow: ellipsis;
  ${props => ThemeProps.exactWidth(`calc(100% - ${props.source ? 120 : 8}px)`)}
`
export const RowBody = styled.div`
  display: flex;
  color: ${ThemePalette.grayscale[5]};
  padding: 0 16px;
  margin-top: 4px;
`
export const RowBodyColumn = styled.div`
  &:first-child {
    ${ThemeProps.exactWidth('calc(50% - 70px)')}
    margin-right: 88px;
  }
  &:last-child {
    ${ThemeProps.exactWidth('calc(50% - 16px)')}
  }
`
export const RowBodyColumnValue = styled.div`
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
export const HeaderIcon = styled.div<{ icon: 'instance' | 'network' | 'storage' }>`
  width: 16px;
  height: 16px;
  background: url('${props => getHeaderIcon(props.icon)}') center no-repeat;
  margin-right: 16px;
`
export const ArrowIcon = styled.div`
  width: 32px;
  height: 16px;
  background: url('${arrowIcon}') center no-repeat;
  margin-left: 16px;
`
export const TEST_ID = 'mainDetailsTable'

export type Props = {
  item?: TransferItem | null,
  instancesDetails: Instance[],
  networks?: Network[],
  minionPools: MinionPool[]
  storageBackends: StorageBackend[]
}
type State = {
  openedRows: string[],
}

class TransferDetailsTable extends React.Component<Props, State> {
  state = {
    openedRows: [],
  }

  getTransferResult(instance: Instance): Instance | null {
    if (this.props.item?.transfer_result) {
      const transferInstanceKey = Object.keys(this.props.item.transfer_result)
        .find(k => k === instance.name || k === instance.instance_name || k === instance.id)
      if (transferInstanceKey) {
        return this.props.item.transfer_result[transferInstanceKey]
      }
    }
    return null
  }

  handleRowClick(id: string) {
    if (this.state.openedRows.find(i => i === id)) {
      this.setState(prevState => ({
        openedRows: prevState.openedRows.filter(i => i !== id),
      }))
    } else {
      this.setState(prevState => ({
        openedRows: [...prevState.openedRows, id],
      }))
    }
  }

  renderRow(opts: {
    id: string,
    icon: 'instance' | 'network' | 'storage',
    sourceName: string,
    destinationName: React.ReactNode,
    sourceBody: string[],
    destinationBody: string[],
  }) {
    const {
      id, icon, sourceName, destinationName, sourceBody, destinationBody,
    } = opts
    const isOpened: boolean = Boolean(this.state.openedRows.find(i => i === id))

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
            <HeaderName source>{sourceName}</HeaderName>
            {destinationName ? <ArrowIcon /> : null}
          </RowHeaderColumn>
          <RowHeaderColumn>
            <HeaderName>{destinationName}</HeaderName>
          </RowHeaderColumn>
        </RowHeader>
        <Collapse isOpened={isOpened}>
          <RowBody>
            <RowBodyColumn>
              {sourceBody.map(l => <RowBodyColumnValue key={l}>{l}</RowBodyColumnValue>)}
            </RowBodyColumn>
            <RowBodyColumn>
              {destinationBody.map(l => <RowBodyColumnValue key={l}>{l}</RowBodyColumnValue>)}
            </RowBodyColumn>
          </RowBody>
        </Collapse>
      </Row>
    )
  }

  renderStorage(instance: Instance, type: 'backend' | 'disk') {
    const storageMapping = this.props.item?.storage_mappings
    const transferResult = this.getTransferResult(instance)
    const rows: React.ReactNode[] = []
    const diskFieldName = type === 'backend' ? 'storage_backend_identifier' : 'id'
    const mappingFieldName = type === 'backend' ? 'source' : 'disk_id'
    const storageMappingFieldName = type === 'backend' ? 'backend_mappings' : 'disk_mappings'

    instance.devices.disks.forEach(disk => {
      const sourceName = disk[diskFieldName] || ''
      const mappedDisk = (storageMapping?.[storageMappingFieldName] as any)
        ?.find((m: any) => String(m[mappingFieldName]) === String(disk[diskFieldName]))
      let destinationName: React.ReactNode
      let destinationKey: string
      const defaultBusTypeInfo = EndpointUtils.getBusTypeStorageId(this.props.storageBackends, this.props.item?.storage_mappings?.default || null)

      if (disk.disabled) {
        destinationKey = disk.disabled.info || disk.disabled.message
        destinationName = <span style={{ color: ThemePalette.grayscale[5] }}>{destinationKey}</span>
      } else {
        destinationName = defaultBusTypeInfo.id || 'Default'
        destinationKey = destinationName as string
      }
      let destinationBody: string[] = []

      if (mappedDisk) {
        const busTypeInfo = EndpointUtils.getBusTypeStorageId(this.props.storageBackends, mappedDisk?.destination)

        destinationName = busTypeInfo.id
        destinationKey = destinationName as string
        if (busTypeInfo.busType) {
          destinationBody.push(`Bus Type: ${busTypeInfo.busType}`)
        }
      } else if (defaultBusTypeInfo.busType) {
        destinationBody.push(`Bus Type: ${defaultBusTypeInfo.busType}`)
      }
      const getBody = (d: Disk): string[] => {
        const body: string[] = []
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
      const sourceBody = getBody(disk)

      if (transferResult) {
        const transferDisk = transferResult.devices.disks
          .find(d => d.storage_backend_identifier === destinationName)
        if (transferDisk) {
          destinationName = transferDisk.name || transferDisk.id
          destinationKey = destinationName as string
          destinationBody = destinationBody.concat(getBody(transferDisk))
        }
      } else if (this.props.item?.type === 'migration' && (
        this.props.item.last_execution_status === 'RUNNING'
        || this.props.item.last_execution_status === 'AWAITING_MINION_ALLOCATIONS'
      )) {
        destinationBody = ['Waiting for migration to finish']
      }

      rows.push(this.renderRow({
        id: `${instance.instance_name || instance.id}-${sourceName}-${destinationKey}`,
        icon: 'storage',
        sourceName,
        destinationName,
        sourceBody,
        destinationBody,
      }))
    })

    return rows
  }

  renderNetworks(instance: Instance) {
    let destinationNetworkMap: TransferNetworkMap | null = null
    if (this.props.item && this.props.item.network_map) {
      destinationNetworkMap = this.props.item.network_map
    }
    if (destinationNetworkMap == null) {
      return null
    }
    const transferResult = this.getTransferResult(instance)
    const rows: React.ReactNode[] = []
    instance.devices.nics.forEach(nic => {
      if (destinationNetworkMap
        && isNetworkMapSourceDest(destinationNetworkMap)
        && destinationNetworkMap[nic.network_name]) {
        const getBody = (n: Nic): string[] => {
          const body: string[] = [`Name: ${n.network_name}`]
          const ipv4 = n.ip_addresses ? n.ip_addresses.find(ip => /(?:\d+?\.){3}\d+/g.exec(ip)) : null
          const ipv6 = n.ip_addresses ? n.ip_addresses.find(ip => /\w*:\w*/g.exec(ip)) : null
          if (ipv4) {
            body.push(`IP Address (IPv4): ${ipv4}`)
          }
          if (ipv6) {
            body.push(`IP Address (IPv6): ${ipv6}`)
          }
          return body
        }
        const destNetMapObj = destinationNetworkMap[nic.network_name]
        const portKeyInfo = NetworkUtils.getPortKeyNetworkId(this.props.networks || [], destNetMapObj as any)
        const destinationNetworkId = isNetworkMapSecurityGroups(destNetMapObj) ? destNetMapObj.id : portKeyInfo.id
        const destinationNetwork = this.props.networks?.find(n => n.id === destinationNetworkId)
        const sourceBody = getBody(nic)

        let destinationBody: string[] = []
        if (isNetworkMapSecurityGroups(destNetMapObj) && destNetMapObj.security_groups?.length) {
          const destSecGroupsInfo = (destinationNetwork?.security_groups) || []
          const secNames = destNetMapObj.security_groups.map(s => {
            const foundSecGroupInfo = destSecGroupsInfo.find(si => (typeof si === 'string' ? si === s : si.id === s))
            return foundSecGroupInfo && typeof foundSecGroupInfo !== 'string' && foundSecGroupInfo.name ? foundSecGroupInfo.name : s
          })
          destinationBody = [`Security Groups: ${secNames.join(', ')}`]
        }

        if (portKeyInfo.portKey != null) {
          destinationBody = [`Port Key: ${portKeyInfo.portKey}`]
        }

        let destinationNetworkName = destinationNetworkId
        if (destinationNetwork) {
          destinationNetworkName = destinationNetwork.name
        }
        if (transferResult) {
          const destinationNic = transferResult.devices.nics
            .find(n => n.network_id === destinationNetworkId
              || n.network_name === destinationNetworkId)
          if (destinationNic) {
            destinationNetworkName = destinationNic.network_name
            destinationBody = getBody(destinationNic)
          }
        } else if (this.props.item?.type === 'migration' && (
          this.props.item.last_execution_status === 'RUNNING'
          || this.props.item.last_execution_status === 'AWAITING_MINION_ALLOCATIONS'
        )) {
          destinationBody = ['Waiting for migration to finish']
        }

        rows.push(this.renderRow({
          id: `${instance.instance_name || instance.id}-${nic.network_name}`,
          icon: 'network',
          sourceName: nic.mac_address,
          destinationName: destinationNetworkName,
          sourceBody,
          destinationBody,
        }))
      }
    })

    return rows
  }

  renderInstanceDetails(instance: Instance) {
    const getBody = (i: Instance): string[] => [
      `ID: ${i.id}`,
      `Cores: ${i.num_cpu}`,
      `Memory: ${i.memory_mb} MB`,
      `Flavor Name: ${i.flavor_name || 'N/A'}`,
      `OS Type: ${i.os_type}`,
    ]

    const sourceBody: string[] = getBody(instance)

    const minionPoolMappings = this.props.item?.instance_osmorphing_minion_pool_mappings
    const minionPoolId = minionPoolMappings
      && minionPoolMappings[instance.instance_name || instance.id || instance.name]
    if (minionPoolId) {
      const minionPool = this.props.minionPools.find(m => m.id === minionPoolId)
      sourceBody.push(`Minion Pool: ${minionPool?.name || minionPoolId}`)
    }
    let destinationBody: string[] = []
    let destinationName: string = ''
    const transferResult = this.getTransferResult(instance)
    if (transferResult) {
      destinationName = transferResult.instance_name || transferResult.name
      destinationBody = getBody(transferResult)
    } else if (this.props.item?.type === 'migration' && (
      this.props.item.last_execution_status === 'RUNNING'
      || this.props.item.last_execution_status === 'AWAITING_MINION_ALLOCATIONS'
    )) {
      destinationName = 'Waiting for migration to finish'
    }
    const instanceName = instance.instance_name || instance.id
    return this.renderRow({
      id: instanceName,
      icon: 'instance',
      sourceName: instanceName,
      destinationName,
      sourceBody,
      destinationBody,
    })
  }

  render() {
    if (this.props.instancesDetails.length === 0 || !this.props.item) {
      return null
    }

    return (
      <Wrapper>
        <GlobalStyle />
        <Header>
          <HeaderLabel>Source</HeaderLabel>
          <HeaderLabel>Target</HeaderLabel>
        </Header>
        {this.props.instancesDetails.map(instance => (
          <InstanceInfo key={instance.name}>
            <InstanceName>{instance.name}</InstanceName>
            <InstanceBody>
              {this.renderInstanceDetails(instance)}
              {this.renderNetworks(instance)}
              {this.renderStorage(instance, 'disk')}
              {this.renderStorage(instance, 'backend')}
            </InstanceBody>
          </InstanceInfo>
        ))}
      </Wrapper>
    )
  }
}

export default TransferDetailsTable
