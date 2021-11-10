/*
Copyright (C) 2020  Cloudbase Solutions SRL
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
import styled, { createGlobalStyle, css } from 'styled-components'
import moment from 'moment'
import { Collapse } from 'react-collapse'

import { Link } from 'react-router-dom'
import { MinionMachine, MinionPool } from '../../../../@types/MinionPool'
import DropdownLink from '../../../ui/Dropdowns/DropdownLink/DropdownLink'
import { ItemReplicaBadge } from '../../../ui/Dropdowns/NotificationDropdown/NotificationDropdown'
import Palette from '../../../styleUtils/Palette'
import StyleProps from '../../../styleUtils/StyleProps'
import Arrow from '../../../ui/Arrow/Arrow'

import networkImage from './images/network.svg'
import StatusPill from '../../../ui/StatusComponents/StatusPill/StatusPill'
import { MigrationItem, ReplicaItem, TransferItem } from '../../../../@types/MainItem'

const GlobalStyle = createGlobalStyle`
  .ReactCollapse--collapse {
    transition: height 0.4s ease-in-out;
  }
`
const Wrapper = styled.div``
const NoMachines = styled.div`
  text-align: center;
`
const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  margin-left: 20px;
`
const ArrowStyled = styled(Arrow)`
  position: absolute;
  left: -24px;
`
const Row = styled.div<any>`
  position: relative;
  padding: 8px 0;
  border-top: 1px solid white;
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
const RowHeader = styled.div<any>`
  display: flex;
  align-items: center;
  padding: 0 16px;
`
const RowHeaderColumn = styled.div<any>`
  display: flex;
  align-items: center;
  ${StyleProps.exactWidth('50%')}
`
const HeaderName = styled.div<any>`
  overflow: hidden;
  text-overflow: ellipsis;
  ${props => StyleProps.exactWidth(`calc(100% - ${props.source ? 120 : 8}px)`)}
`
const HeaderIcon = styled.div<any>`
  min-width: 16px;
  min-height: 16px;
  background: url('${networkImage}') center no-repeat;
  margin-right: 16px;
`
const HeaderFilter = styled.div``
const HeaderText = styled.div`
  margin-left: 16px;
`
const RowBody = styled.div<any>`
  display: flex;
  color: ${Palette.grayscale[5]};
  padding: 0 16px;
  margin-top: 4px;
`
const RowBodyColumn = styled.div<any>`
  margin-top: 8px;
  &:first-child {
    ${StyleProps.exactWidth('calc(50% - 70px)')}
    margin-right: 88px;
  }
  &:last-child {
    ${StyleProps.exactWidth('calc(50% - 16px)')}
  }
`
const RowBodyColumnValue = styled.div<any>`
  overflow-wrap: break-word;
`
const MachinesWrapper = styled.div``
const MachineWrapper = styled.div`
  background: ${Palette.grayscale[1]};
  border-radius: ${StyleProps.borderRadius};
`
const MachineTitle = styled.div`
  padding: 16px;
  border-bottom: 1px solid #7F8795;
  font-size: 16px;
`
const MachineBody = styled.div`
  padding: 16px;
`
const MachineRow = styled.div<{ secondary?: boolean }>`
  display: flex;
  margin-bottom: 8px;
  align-items: center;
  ${props => (props.secondary ? css`
    color: ${Palette.grayscale[5]};
    margin-bottom: 4px;
  ` : '')}
`
const ValueLink = styled(Link)`
  display: flex;
  color: ${Palette.primary};
  text-decoration: none;
  cursor: pointer;
`

type FilterType = 'all' | 'allocated' | 'not-allocated'
type Props = {
  item?: MinionPool | null,
  replicas: ReplicaItem[]
  migrations: MigrationItem[]
}
type State = {
  filterStatus: FilterType
  openedRows: string[]
}
class MinionPoolMachines extends React.Component<Props, State> {
  state = {
    filterStatus: 'all' as FilterType,
    openedRows: [],
  }

  get machines() {
    return this.props.item?.minion_machines || []
  }

  get filteredMachines() {
    switch (this.state.filterStatus) {
      case 'all':
        return this.machines
      case 'allocated':
        return this.machines.filter(m => m.allocation_status === 'ALLOCATED' || m.allocation_status === 'AVAILABLE')
      default:
        return this.machines.filter(m => m.allocation_status !== 'ALLOCATED' && m.allocation_status !== 'AVAILABLE')
    }
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

  renderNoMachines() {
    return (
      <NoMachines>There are no Minion Machines allocated to this Minion Pool</NoMachines>
    )
  }

  renderHeader() {
    const plural = this.machines.length === 1 ? '' : 's'
    return (
      <Header>
        <HeaderFilter>
          <DropdownLink
            items={[
              { label: 'All', value: 'all' },
              { label: 'Allocated', value: 'allocated' },
              { label: 'Not Allocated', value: 'not-allocated' },
            ]}
            selectedItem={this.state.filterStatus}
            onChange={item => {
              this.setState({
                filterStatus: item.value as FilterType,
              })
            }}
          />
        </HeaderFilter>
        <HeaderText>
          {this.machines.length} minion machine{plural}, {this.machines.filter(m => m.allocation_status === 'ALLOCATED' || m.allocation_status === 'AVAILABLE').length} allocated
        </HeaderText>
      </Header>
    )
  }

  renderConnectionInfo(machine: MinionMachine) {
    const isOpened: boolean = Boolean(this.state.openedRows.find(i => i === machine.id))

    return (
      <Row onClick={() => { this.handleRowClick(machine.id) }}>
        <ArrowStyled
          primary
          orientation={isOpened ? 'up' : 'down'}
          opacity={isOpened ? 1 : 0}
          thick
        />
        <RowHeader>
          <RowHeaderColumn>
            <HeaderIcon />
            <HeaderName>Connection Info</HeaderName>
          </RowHeaderColumn>
        </RowHeader>
        <Collapse isOpened={isOpened}>
          <RowBody>
            <RowBodyColumn>
              {Object.keys(machine.connection_info).map(prop => (
                <RowBodyColumnValue key={prop}>
                  {prop}: {machine.connection_info[prop]}
                </RowBodyColumnValue>
              ))}
            </RowBodyColumn>
          </RowBody>
        </Collapse>
      </Row>
    )
  }

  renderMachines() {
    if (this.filteredMachines.length === 0) {
      return (
        <NoMachines>No Minion Machines found</NoMachines>
      )
    }

    return (
      <MachinesWrapper>
        {this.filteredMachines.map(machine => {
          const findTransferItem = (transferItems: TransferItem[]) => transferItems
            .find(i => i.id === machine.allocated_action)
          const allocatedAction = machine.allocated_action ? (
            findTransferItem(this.props.replicas) || findTransferItem(this.props.migrations)
          ) : null
          return (
            <MachineWrapper key={machine.id}>
              <MachineTitle>ID: {machine.id}</MachineTitle>
              <MachineBody>
                <MachineRow>
                  Allocation Status: <StatusPill style={{ marginLeft: '8px' }} status={machine.allocation_status} />
                </MachineRow>
                <MachineRow style={{ marginBottom: '16px' }}>
                  <span style={{ width: '114px' }}>Power Status:</span> <StatusPill style={{ marginLeft: '8px' }} status={machine.power_status} />
                </MachineRow>
                <MachineRow secondary>Created At: {moment(machine.created_at).format('YYYY-MM-DD HH:mm:ss')}</MachineRow>
                {machine.updated_at ? <MachineRow secondary>Updated At: {moment(machine.updated_at).format('YYYY-MM-DD HH:mm:ss')}</MachineRow> : null}
                {machine.last_used_at ? <MachineRow secondary>Last Used At: {moment(machine.last_used_at).format('YYYY-MM-DD HH:mm:ss')}</MachineRow> : null}
                {machine.allocated_action ? (
                  <MachineRow secondary>
                    Allocated Action:
                    {allocatedAction ? (
                      <>
                        <ItemReplicaBadge style={{ margin: '0px 4px 0 5px' }}>{allocatedAction.type === 'replica' ? 'RE' : 'MI'}</ItemReplicaBadge>
                        <ValueLink
                          to={`/${allocatedAction.type}s/${allocatedAction.id}`}
                        >
                          {allocatedAction.instances[0]}
                        </ValueLink>
                      </>
                    ) : <span>&nbsp;{machine.allocated_action}</span>}
                  </MachineRow>
                ) : null}
              </MachineBody>
              {machine.connection_info ? this.renderConnectionInfo(machine) : null}
            </MachineWrapper>
          )
        })}
        <GlobalStyle />
      </MachinesWrapper>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.props.item?.minion_machines.length ? this.renderHeader() : this.renderNoMachines()}
        {this.props.item?.minion_machines.length ? this.renderMachines() : null}
      </Wrapper>
    )
  }
}

export default MinionPoolMachines
