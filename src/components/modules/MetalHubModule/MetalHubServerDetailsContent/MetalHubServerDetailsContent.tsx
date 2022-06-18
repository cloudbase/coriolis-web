/*
Copyright (C) 2022  Cloudbase Solutions SRL
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
import { observer } from 'mobx-react'
import styled from 'styled-components'
import moment from 'moment'

import CopyValue from '@src/components/ui/CopyValue'
import StatusImage from '@src/components/ui/StatusComponents/StatusImage'
import Button from '@src/components/ui/Button'

import { ThemePalette, ThemeProps } from '@src/components/Theme'
import { MetalHubDisk, MetalHubNic, MetalHubServer } from '@src/@types/MetalHub'
import {
  ArrowStyled, GlobalStyle, HeaderIcon, HeaderName, Row, RowBody, RowBodyColumn, RowBodyColumnValue, RowHeader, RowHeaderColumn,
} from '@src/components/modules/TransferModule/TransferDetailsTable'
import { Collapse } from 'react-collapse'
import LoadingButton from '@src/components/ui/LoadingButton'
import StatusPill from '@src/components/ui/StatusComponents/StatusPill'

const Wrapper = styled.div`
  ${ThemeProps.exactWidth(ThemeProps.contentWidth)}
  margin: 0 auto;
  padding-left: 126px;
`
const Info = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 32px;
  margin-left: -32px;
`
const Field = styled.div`
  ${ThemeProps.exactWidth('calc(50% - 32px)')}
  margin-bottom: 32px;
  margin-left: 32px;
`
const Value = styled.div``
const Label = styled.div`
  font-size: 10px;
  font-weight: ${ThemeProps.fontWeights.medium};
  color: ${ThemePalette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 3px;
`
const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 32px 0 64px 0;
`
const Buttons = styled.div<any>`
  margin-top: 64px;
  display: flex;
  justify-content: space-between;
`
const ButtonsColumn = styled.div<any>`
  display: flex;
  flex-direction: column;
  button {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`
const Table = styled.div``
const TableBody = styled.div``
const TableHeader = styled.div`
  background: ${ThemePalette.grayscale[1]};
  border-radius: ${ThemeProps.borderRadius};
  margin-bottom: 32px;
  &:last-child { margin-bottom: 0; }
`
const TableHeaderInfo = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${ThemePalette.grayscale[5]};
  font-size: 16px;
`
const TableBodyContent = styled.div`
  font-size: 14px;
`
const HeaderSubtitle = styled.span`
  color: ${ThemePalette.grayscale[5]};
  margin-left: 4px;
`
type Props = {
  server: MetalHubServer | null,
  loading: boolean,
  creatingReplica: boolean,
  creatingMigration: boolean,
  onCreateReplicaClick: () => void,
  onCreateMigrationClick: () => void,
  onDeleteClick: () => void,
}
type State = {
  openedRows: string[],
}
@observer
class MetalHubServerDetailsContent extends React.Component<Props, State> {
  state: State = {
    openedRows: [],
  }

  handleRowClick(id: string) {
    if (this.state.openedRows.find(i => i === id)) {
      this.setState(prevState => ({
        openedRows: prevState.openedRows.filter(i => id !== i),
      }))
    } else {
      this.setState(prevState => ({
        openedRows: [...prevState.openedRows, id],
      }))
    }
  }

  renderLoading() {
    return (
      <LoadingWrapper>
        <StatusImage />
      </LoadingWrapper>
    )
  }

  renderButtons() {
    if (this.props.loading) {
      return null
    }

    const creating = this.props.creatingReplica || this.props.creatingMigration

    return (
      <Buttons>
        <ButtonsColumn>
          {this.props.creatingReplica ? (
            <LoadingButton>
              Loading Wizard ...
            </LoadingButton>
          ) : (
            <Button
              onClick={this.props.onCreateReplicaClick}
              disabled={creating || !this.props.server?.active}
              hollow
            >Create Replica
            </Button>
          )}
          {this.props.creatingMigration ? (
            <LoadingButton>
              Loading Wizard ...
            </LoadingButton>
          ) : (
            <Button
              hollow
              disabled={creating || !this.props.server?.active}
              onClick={this.props.onCreateMigrationClick}
            >Create Migration
            </Button>
          )}
        </ButtonsColumn>
        <ButtonsColumn>
          <Button
            alert
            hollow
            onClick={() => { this.props.onDeleteClick() }}
          >Remove Server
          </Button>
        </ButtonsColumn>
      </Buttons>
    )
  }

  renderInfo() {
    if (this.props.loading || !this.props.server) {
      return null
    }
    const server = this.props.server
    return (
      <Info>
        <Field>
          <Label>Hostname</Label>
          {this.renderValue(server.hostname || '-')}
        </Field>
        <Field>
          <Label>ID</Label>
          {this.renderValue(String(server.id))}
        </Field>
        <Field>
          <Label>Status</Label>
          <Value>{server.active ? (
            <StatusPill status="COMPLETED" label="Active" />
          ) : (
            <StatusPill status="ERROR" label="Inactive" />
          )}
          </Value>
        </Field>
        <Field>
          <Label>API Endpoint</Label>
          {this.renderValue(String(server.api_endpoint))}
        </Field>
        <Field>
          <Label>Created At</Label>
          <Value>{moment(server.created_at).format('YYYY-MM-DD HH:mm:ss')}</Value>
        </Field>
        <Field>
          <Label>Updated At</Label>
          <Value>{moment(server.updated_at).format('YYYY-MM-DD HH:mm:ss')}</Value>
        </Field>
        <Field>
          <Label>Firmware Type</Label>
          {this.renderValue(server.firmware_type || '-')}
        </Field>
        <Field>
          <Label>CPU Cores</Label>
          {server.physical_cores || '-'} physical, {server.logical_cores || '-'} logical
        </Field>
        <Field>
          <Label>Memory Size</Label>
          {server.memory ? this.renderValue(`${(server.memory / 1024 / 1024 / 1024).toFixed(2)} GB`) : '-'}
        </Field>
        <Field>
          <Label>Operating System</Label>
          {server.os_info.os_name ? this.renderValue(`${server.os_info.os_name} ${server.os_info.os_version}`) : '-'}
        </Field>
      </Info>
    )
  }

  renderValue(value: string) {
    return value !== '-' ? (
      <CopyValue
        value={value}
        maxWidth="90%"
      />
    ) : <Value>{value}</Value>
  }

  renderNics(nics: MetalHubNic[]) {
    return nics.map(nic => {
      const isOpened: boolean = Boolean(this.state.openedRows.find(i => i === nic.nic_name))

      return (
        <Row key={nic.nic_name} onClick={() => { this.handleRowClick(nic.nic_name) }}>
          <ArrowStyled
            primary
            orientation={isOpened ? 'up' : 'down'}
            opacity={isOpened ? 1 : 0}
            thick
          />
          <RowHeader>
            <RowHeaderColumn>
              <HeaderIcon icon="network" />
              <HeaderName source>{nic.nic_name}</HeaderName>
            </RowHeaderColumn>
            <RowHeaderColumn />
          </RowHeader>
          <Collapse isOpened={isOpened}>
            <RowBody>
              <RowBodyColumn>
                {[
                  `MAC Address: ${nic.mac_address}`,
                  `IP Addresses: ${nic.ip_addresses.join(', ')}`,
                  `Interface Type: ${nic.interface_type}`,
                ].map(l => <RowBodyColumnValue key={l}>{l}</RowBodyColumnValue>)}
              </RowBodyColumn>
            </RowBody>
          </Collapse>
        </Row>
      )
    })
  }

  renderPartitions(partitions: MetalHubDisk['partitions'], sectorSize: number) {
    return partitions.map(partition => {
      const isOpened: boolean = Boolean(this.state.openedRows.find(i => i === partition.partition_uuid))
      const size = partition.sectors * sectorSize
      const sizeString = size < 1024 * 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(2)} MB` : `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
      return (
        <Row key={partition.partition_uuid} onClick={() => { this.handleRowClick(partition.partition_uuid) }}>
          <ArrowStyled
            primary
            orientation={isOpened ? 'up' : 'down'}
            opacity={isOpened ? 1 : 0}
            thick
          />
          <RowHeader>
            <RowHeaderColumn>
              <HeaderIcon icon="storage" />
              <HeaderName source>{partition.name} <HeaderSubtitle>{sizeString}</HeaderSubtitle></HeaderName>
            </RowHeaderColumn>
            <RowHeaderColumn />
          </RowHeader>
          <Collapse isOpened={isOpened}>
            <RowBody>
              <RowBodyColumn>
                {[
                  `ID: ${partition.partition_uuid}`,
                  `Path: ${partition.path}`,
                  `Sectors: ${partition.sectors}`,
                  `Start Sector: ${partition.start_sector}`,
                  `End Sector: ${partition.end_sector}`,
                ].map(l => <RowBodyColumnValue key={l}>{l}</RowBodyColumnValue>)}
              </RowBodyColumn>
            </RowBody>
          </Collapse>
        </Row>
      )
    })
  }

  renderNicsTable() {
    if (this.props.loading || !this.props.server?.nics) {
      return null
    }
    return (
      <Table style={{ marginTop: '24px' }}>
        <Label>Network Interface Controllers</Label>
        <TableBody>
          <TableHeader>
            <TableBodyContent>
              {this.renderNics(this.props.server.nics)}
            </TableBodyContent>
          </TableHeader>
        </TableBody>
      </Table>
    )
  }

  renderPartitionsTable() {
    if (this.props.loading || !this.props.server?.disks) {
      return null
    }
    return (
      <Table>
        <GlobalStyle />
        <Label>Disk Partitions</Label>
        <TableBody>
          {this.props.server.disks.map(disk => (
            <TableHeader key={disk.id}>
              <TableHeaderInfo>{disk.name} <HeaderSubtitle>{(disk.size / 1024 / 1024 / 1024).toFixed(2)} GB</HeaderSubtitle></TableHeaderInfo>
              <TableBodyContent>
                {this.renderPartitions(disk.partitions, disk.physical_sector_size)}
              </TableBodyContent>
            </TableHeader>
          ))}
        </TableBody>
      </Table>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderInfo()}
        {this.renderPartitionsTable()}
        {this.renderNicsTable()}
        {this.props.loading ? this.renderLoading() : null}
        {this.renderButtons()}
        <GlobalStyle />
      </Wrapper>
    )
  }
}

export default MetalHubServerDetailsContent
