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

import Button from '../../atoms/Button'
import StatusImage from '../../atoms/StatusImage'
import Modal from '../../molecules/Modal'
import DropdownLink from '../../molecules/DropdownLink'
import AlertModal from '../../organisms/AlertModal'
import ReplicaExecutionOptions from '../../organisms/ReplicaExecutionOptions'
import ScheduleItem from '../../molecules/ScheduleItem'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import DateUtils from '../../../utils/DateUtils'
import type { Schedule as ScheduleType } from '../../../types/Schedule'
import type { Field } from '../../../types/Field'
import { executionOptions } from '../../../config'

import scheduleImage from './images/schedule.svg'

const Wrapper = styled.div`
  ${StyleProps.exactWidth(StyleProps.contentWidth)}
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
const Table = styled.div``
const Header = styled.div`
  display: flex;
  margin-bottom: 4px;
`
const HeaderData = styled.div`
  width: ${props => props.width};
  font-size: 10px;
  font-weight: ${StyleProps.fontWeights.medium};
  color: ${Palette.grayscale[5]};
  text-transform: uppercase;
`
const Body = styled.div``
const NoSchedules = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${props => props.secondary ? 56 : 80}px 80px 80px 80px;
  background: ${props => props.secondary ? 'white' : Palette.grayscale[7]};
`
const NoSchedulesTitle = styled.div`
  margin-bottom: 10px;
  font-size: 18px;
`
const NoSchedulesSubtitle = styled.div`
  margin-bottom: 45px;
  color: ${Palette.grayscale[4]};
`
const ScheduleImage = styled.div`
  ${StyleProps.exactSize('96px')}
  background: url('${scheduleImage}') no-repeat center;
  margin-bottom: 46px;
`
const Footer = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`
const Timezone = styled.div`
  display: flex;
  align-items: center;
`
const TimezoneLabel = styled.div`
  margin-right: 4px;
`
const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  button {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
  }
`

type TimeZoneValue = 'local' | 'utc'
type Props = {
  schedules: ?ScheduleType[],
  unsavedSchedules: ScheduleType[],
  timezone: TimeZoneValue,
  onTimezoneChange: (timezone: TimeZoneValue) => void,
  onAddScheduleClick: (schedule: ScheduleType) => void,
  onChange: (scheduleId: string, schedule: ScheduleType, forceSave?: boolean) => void,
  onRemove: (scheduleId: string) => void,
  onSaveSchedule?: (schedule: ScheduleType) => void,
  adding?: boolean,
  loading?: boolean,
  secondaryEmpty?: boolean,
}
type State = {
  showOptionsModal: boolean,
  showDeleteConfirmation: boolean,
  selectedSchedule: ?ScheduleType,
  executionOptions: ?{ [string]: mixed },
}

const colWidths = ['6%', '18%', '10%', '18%', '10%', '10%', '23%', '5%']
@observer
class Schedule extends React.Component<Props, State> {
  static defaultProps: $Shape<Props> = {
    unsavedSchedules: [],
  }

  constructor() {
    super()

    this.state = {
      showOptionsModal: false,
      showDeleteConfirmation: false,
      selectedSchedule: null,
      executionOptions: null,
    }
  }

  handleDeleteClick(selectedSchedule: ScheduleType) {
    this.setState({ showDeleteConfirmation: true, selectedSchedule })
  }

  handleCloseDeleteConfirmation() {
    this.setState({ showDeleteConfirmation: false })
  }

  handleDeleteConfirmation() {
    this.setState({ showDeleteConfirmation: false })
    if (this.state.selectedSchedule && this.state.selectedSchedule.id) {
      this.props.onRemove(this.state.selectedSchedule.id)
    }
  }

  handleShowOptions(selectedSchedule: $Subtype<ScheduleType>) {
    this.setState({ showOptionsModal: true, executionOptions: selectedSchedule, selectedSchedule })
  }

  handleCloseOptionsModal() {
    this.setState({ showOptionsModal: false })
  }

  handleOptionsSave(fields: Field[]) {
    this.setState({ showOptionsModal: false })
    let options: ScheduleType = {}
    fields.forEach(f => {
      options[f.name] = f.value || false
    })

    if (this.state.selectedSchedule && this.state.selectedSchedule.id) {
      this.props.onChange(this.state.selectedSchedule.id, options, true)
    }
  }

  handleExecutionOptionsChange(fieldName: string, value: string) {
    let options = this.state.executionOptions
    if (!options) {
      options = {}
    }
    options = {
      ...options,
    }
    options[fieldName] = value

    this.setState({ executionOptions: options })
  }

  handleAddScheduleClick() {
    let hour = 0
    if (this.props.timezone === 'local') {
      hour = DateUtils.getUtcHour(0)
    }
    this.props.onAddScheduleClick({ schedule: { hour, minute: 0 } })
  }

  areExecutionOptionsChanged(schedule: ScheduleType) {
    let isChanged = false
    executionOptions.forEach(o => {
      let scheduleValue = schedule[o.name]
      let optionValue = o.value !== undefined ? o.value : false
      if (scheduleValue !== undefined && scheduleValue !== null && scheduleValue !== optionValue) {
        isChanged = true
      }
    })
    return isChanged
  }

  padNumber(number: number) {
    if (number < 10) {
      return `0${number}`
    }

    return number.toString()
  }

  shouldUseBold(scheduleId: ?string, fieldName: string, isRootField?: boolean) {
    const unsavedSchedule = this.props.unsavedSchedules.find(s => s.id === scheduleId)
    if (!unsavedSchedule) {
      return false
    }
    let data = isRootField ? unsavedSchedule : unsavedSchedule.schedule
    if (data && data[fieldName] !== undefined && data[fieldName] !== null) {
      return true
    }
    return false
  }

  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <LoadingWrapper>
        <StatusImage loading data-test-id="schedule-loadingStatus" />
        <LoadingText>Loading schedules...</LoadingText>
      </LoadingWrapper>
    )
  }

  renderHeader() {
    let headerLabels = ['Run', 'Month', 'Day of month', 'Day of week', 'Hour', 'Minute', 'Expires', 'Options']

    return (
      <Header>
        {headerLabels.map((l, i) => {
          return <HeaderData key={l} width={colWidths[i]}>{l}</HeaderData>
        })}
      </Header>
    )
  }

  renderBody() {
    if (!this.props.schedules) {
      return null
    }

    return (
      <Body>
        {this.props.schedules.map(schedule => (
          <ScheduleItem
            key={schedule.id}
            colWidths={colWidths}
            item={schedule}
            unsavedSchedules={this.props.unsavedSchedules}
            timezone={this.props.timezone}
            onChange={(data, forceSave) => { if (schedule.id) this.props.onChange(schedule.id, data, forceSave) }}
            onSaveSchedule={() => { if (this.props.onSaveSchedule) this.props.onSaveSchedule(schedule) }}
            onShowOptionsClick={() => { this.handleShowOptions(schedule) }}
            onDeleteClick={() => { this.handleDeleteClick(schedule) }}
            data-test-id={`schedule-item-${schedule.id || ''}`}
          />
        ))}
      </Body>
    )
  }

  renderTable() {
    if (!this.props.schedules || this.props.schedules.length === 0 || this.props.loading) {
      return null
    }

    return (
      <Table>
        {this.renderHeader()}
        {this.renderBody()}
      </Table>
    )
  }

  renderNoSchedules() {
    if ((this.props.schedules && this.props.schedules.length > 0) || this.props.loading) {
      return null
    }

    return (
      <NoSchedules secondary={this.props.secondaryEmpty}>
        <ScheduleImage />
        <NoSchedulesTitle data-test-id="schedule-noScheduleTitle">{this.props.secondaryEmpty ? 'Schedule this Replica' : 'This Replica has no Schedules.'}</NoSchedulesTitle>
        <NoSchedulesSubtitle>{this.props.secondaryEmpty ? 'You can schedule this replica so that it executes automatically.' : 'Add a new schedule so that the Replica executes automatically.'}</NoSchedulesSubtitle>
        <Button
          hollow={this.props.secondaryEmpty}
          onClick={() => { this.handleAddScheduleClick() }}
          data-test-id="schedule-noScheduleAddButton"
        >Add Schedule</Button>
      </NoSchedules>
    )
  }

  renderFooter() {
    if (!this.props.schedules || this.props.schedules.length === 0 || this.props.loading) {
      return null
    }

    let timezoneItems = [
      { label: 'Local Time', value: 'local' },
      { label: 'UTC', value: 'utc' },
    ]
    let selectedItem = this.props.timezone || timezoneItems[0].value

    return (
      <Footer>
        <Buttons>
          <Button
            data-test-id="schedule-addScheduleButton"
            disabled={this.props.adding}
            secondary
            onClick={() => { this.handleAddScheduleClick() }}
          >Add Schedule</Button>
        </Buttons>
        <Timezone>
          <TimezoneLabel>Show all times in</TimezoneLabel>
          <DropdownLink
            data-test-id="schedule-timezoneDropdown"
            items={timezoneItems}
            selectedItem={selectedItem}
            onChange={item => { this.props.onTimezoneChange(item.value === 'utc' ? 'utc' : 'local') }}
          />
        </Timezone>
      </Footer>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderTable()}
        {this.renderFooter()}
        {this.renderNoSchedules()}
        {this.renderLoading()}
        {this.state.showOptionsModal ? (
          <Modal
            isOpen
            title="Execution options"
            onRequestClose={() => { this.handleCloseOptionsModal() }}
          >
            <ReplicaExecutionOptions
              options={this.state.executionOptions}
              onChange={(fieldName, value) => { this.handleExecutionOptionsChange(fieldName, value) }}
              executionLabel="Save"
              onCancelClick={() => { this.handleCloseOptionsModal() }}
              onExecuteClick={fields => { this.handleOptionsSave(fields) }}
            />
          </Modal>
        ) : null}
        {this.state.showDeleteConfirmation ? (
          <AlertModal
            isOpen
            title="Delete Schedule?"
            message="Are you sure you want to delete this schedule?"
            extraMessage=" "
            onConfirmation={() => { this.handleDeleteConfirmation() }}
            onRequestClose={() => { this.handleCloseDeleteConfirmation() }}
          />
        ) : null}
      </Wrapper>
    )
  }
}

export default Schedule
