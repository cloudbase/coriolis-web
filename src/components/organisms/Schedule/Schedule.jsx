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
import moment from 'moment'

import {
  Switch,
  Dropdown,
  Button,
  DatetimePicker,
  ReplicaExecutionOptions,
  Modal,
  DropdownLink,
  StatusImage,
  AlertModal,
} from 'components'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import NotificationActions from '../../../actions/NotificationActions'
import DateUtils from '../../../utils/DateUtils'

import deleteImage from './images/delete.svg'
import deleteHoverImage from './images/delete-hover.svg'
import scheduleImage from './images/schedule.svg'

const Wrapper = styled.div`
  width: 800px;
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
const Row = styled.div`
  display: flex;
  border-top: 1px solid ${Palette.grayscale[1]};
  padding: 16px 0;
  position: relative;
  &:last-child {
    border-bottom: 1px solid ${Palette.grayscale[1]};
  }
`
const DeleteButton = styled.div`
  width: 16px;
  height: 16px;
  background: url('${deleteImage}') center no-repeat;
  position: absolute;
  cursor: pointer;
  right: -32px;
  top: 24px;
  ${props => props.hidden ? 'display: none;' : ''}

  &:hover {
    background: url('${deleteHoverImage}') center no-repeat;
  }
`
const RowData = styled.div`
  width: ${props => props.width};
`
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
const DropdownStyled = styled(Dropdown)`
  font-size: 12px;
`
const Label = styled.div`
  background: ${Palette.grayscale[7]};
  height: 100%;
  font-size: 12px;
  margin-right: 8px;
  border-radius: ${StyleProps.borderRadius};
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  line-height: 35px;
  margin-bottom: -8px;
`
const Footer = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const Timezone = styled.div`
  display: flex;
  align-items: center;
`
const TimezoneLabel = styled.div`
  margin-right: 4px;
`

const colWidths = ['6%', '18%', '10%', '18%', '10%', '10%', '23%', '5%']
const daysInMonths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
class Schedule extends React.Component {
  static propTypes = {
    schedules: PropTypes.array,
    timezone: PropTypes.string,
    onTimezoneChange: PropTypes.func,
    onAddScheduleClick: PropTypes.func,
    onChange: PropTypes.func,
    onRemove: PropTypes.func,
    adding: PropTypes.bool,
    loading: PropTypes.bool,
    secondaryEmpty: PropTypes.bool,
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

  getFieldValue(schedule, items, fieldName, zeroBasedIndex, defaultSelectedIndex) {
    if (schedule === null || schedule === undefined) {
      return defaultSelectedIndex !== undefined ? items[defaultSelectedIndex] : items[0]
    }

    if (schedule[fieldName] === null || schedule[fieldName] === undefined) {
      return items[0]
    }

    if (zeroBasedIndex) {
      let value = schedule[fieldName]

      if (fieldName === 'hour') {
        if (this.props.timezone === 'local') {
          value = DateUtils.getLocalHour(value)
        }
      }

      return items[value + 1]
    }

    return items[schedule[fieldName]]
  }

  padNumber(number) {
    if (number < 10) {
      return `0${number}`
    }

    return number
  }

  handleDeleteClick(selectedSchedule) {
    this.setState({ showDeleteConfirmation: true, selectedSchedule })
  }

  handleCloseDeleteConfirmation() {
    this.setState({ showDeleteConfirmation: false })
  }

  handleDeleteConfirmation() {
    this.setState({ showDeleteConfirmation: false })
    this.props.onRemove(this.state.selectedSchedule.id)
  }

  handleShowOptions(selectedSchedule) {
    this.setState({ showOptionsModal: true, executionOptions: selectedSchedule, selectedSchedule })
  }

  handleCloseOptionsModal() {
    this.setState({ showOptionsModal: false })
  }

  handleOptionsSave(fields) {
    this.setState({ showOptionsModal: false })
    let options = {}
    fields.forEach(f => {
      options[f.name] = f.value || false
    })

    this.props.onChange(this.state.selectedSchedule.id, options)
  }

  handleExecutionOptionsChange(fieldName, value) {
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

  handleMonthChange(s, item) {
    let month = item.value || 1
    let maxNumDays = daysInMonths[month - 1]
    let change = { schedule: { month: item.value } }
    if (s.schedule && s.schedule.dom && s.schedule.dom > maxNumDays) {
      change.schedule.dom = maxNumDays
    }

    this.props.onChange(s.id, change)
  }

  handleExpirationDateChange(s, date) {
    let newDate = moment(date)
    if (newDate.diff(new Date(), 'minutes') < 60) {
      NotificationActions.notify('Please select a further expiration date.', 'error')
      return
    }

    this.props.onChange(s.id, { expiration_date: newDate.toDate() })
  }

  handleHourChange(s, hour) {
    if (this.props.timezone === 'local' && hour !== null && hour !== undefined) {
      hour = DateUtils.getUtcHour(hour)
    }

    this.props.onChange(s.id, { schedule: { hour } })
  }

  handleAddScheduleClick() {
    let hour = 0
    if (this.props.timezone === 'local') {
      hour = DateUtils.getUtcHour(0)
    }
    this.props.onAddScheduleClick({ schedule: { hour, minute: 0 } })
  }

  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <LoadingWrapper>
        <StatusImage loading />
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

  renderLabel(value) {
    return <Label>{value.label}</Label>
  }

  renderMonthValue(s) {
    let items = [{ label: 'Any', value: null }]
    let months = moment.months()
    months.forEach((label, value) => {
      items.push({ label, value: value + 1 })
    })

    if (s.enabled) {
      return this.renderLabel(this.getFieldValue(s.schedule, items, 'month'))
    }

    return (
      <DropdownStyled
        centered
        width={136}
        items={items}
        selectedItem={this.getFieldValue(s.schedule, items, 'month')}
        onChange={item => { this.handleMonthChange(s, item) }}
      />
    )
  }

  renderDayOfMonthValue(s) {
    let month = (s.schedule && s.schedule.month) || 1
    let items = [{ label: 'Any', value: null }]
    for (let i = 1; i <= daysInMonths[month - 1]; i += 1) {
      items.push({ label: i, value: i })
    }

    if (s.enabled) {
      return this.renderLabel(this.getFieldValue(s.schedule, items, 'dom'))
    }

    return (
      <DropdownStyled
        centered
        width={72}
        items={items}
        selectedItem={this.getFieldValue(s.schedule, items, 'dom')}
        onChange={item => { this.props.onChange(s.id, { schedule: { dom: item.value } }) }}
      />
    )
  }

  renderDayOfWeekValue(s) {
    let items = [{ label: 'Any', value: null }]
    let days = moment.weekdays(true)
    days.forEach((label, value) => {
      items.push({ label, value })
    })

    if (s.enabled) {
      return this.renderLabel(this.getFieldValue(s.schedule, items, 'dow', true))
    }

    return (
      <DropdownStyled
        centered
        width={136}
        items={items}
        selectedItem={this.getFieldValue(s.schedule, items, 'dow', true)}
        onChange={item => { this.props.onChange(s.id, { schedule: { dow: item.value } }) }}
      />
    )
  }

  renderHourValue(s) {
    let items = [{ label: 'Any', value: null }]
    for (let i = 0; i <= 23; i += 1) {
      items.push({ label: this.padNumber(i), value: i })
    }

    if (s.enabled) {
      return this.renderLabel(this.getFieldValue(s.schedule, items, 'hour', true, 1))
    }

    return (
      <DropdownStyled
        centered
        width={72}
        items={items}
        selectedItem={this.getFieldValue(s.schedule, items, 'hour', true, 1)}
        onChange={item => { this.handleHourChange(s, item.value) }}
      />
    )
  }

  renderMinuteValue(s) {
    let items = [{ label: 'Any', value: null }]
    for (let i = 0; i <= 59; i += 1) {
      items.push({ label: this.padNumber(i), value: i })
    }

    if (s.enabled) {
      return this.renderLabel(this.getFieldValue(s.schedule, items, 'minute', true, 1))
    }

    return (
      <DropdownStyled
        centered
        width={72}
        items={items}
        selectedItem={this.getFieldValue(s.schedule, items, 'minute', true, 1)}
        onChange={item => { this.props.onChange(s.id, { schedule: { minute: item.value } }) }}
      />
    )
  }

  renderExpirationValue(s) {
    let date = s.expiration_date && moment(s.expiration_date)
    let labelDate = date
    if (this.props.timezone === 'utc' && date) {
      labelDate = DateUtils.getUtcTime(date)
    }

    if (s.enabled) {
      return this.renderLabel({ label: (labelDate && labelDate.format('DD/MM/YYYY hh:mm A')) || '-' })
    }

    return (
      <DatetimePicker
        value={date}
        timezone={this.props.timezone}
        onChange={date => { this.handleExpirationDateChange(s, date) }}
      />
    )
  }

  renderBody() {
    return (
      <Body>
        {this.props.schedules.map((s, i) => {
          return (
            <Row key={i}>
              <RowData width={colWidths[0]}>
                <Switch
                  noLabel
                  height={16}
                  checked={s.enabled !== null && s.enabled !== undefined ? s.enabled : false}
                  onChange={enabled => { this.props.onChange(s.id, { enabled }) }}
                />
              </RowData>
              <RowData width={colWidths[1]}>
                {this.renderMonthValue(s)}
              </RowData>
              <RowData width={colWidths[2]}>
                {this.renderDayOfMonthValue(s)}
              </RowData>
              <RowData width={colWidths[3]}>
                {this.renderDayOfWeekValue(s)}
              </RowData>
              <RowData width={colWidths[4]}>
                {this.renderHourValue(s)}
              </RowData>
              <RowData width={colWidths[5]}>
                {this.renderMinuteValue(s)}
              </RowData>
              <RowData width={colWidths[6]}>
                {this.renderExpirationValue(s)}
              </RowData>
              <RowData width={colWidths[7]}>
                <Button
                  onClick={() => { this.handleShowOptions(s) }}
                  secondary
                  width="40px"
                >•••</Button>
              </RowData>
              <DeleteButton
                onClick={() => { this.handleDeleteClick(s) }}
                hidden={s.enabled !== null && s.enabled !== undefined ? s.enabled : false}
              />
            </Row>
          )
        })}
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
        <NoSchedulesTitle>{this.props.secondaryEmpty ? 'Schedule this Replica' : 'This Replica has no Schedules.'}</NoSchedulesTitle>
        <NoSchedulesSubtitle>{this.props.secondaryEmpty ? 'You can schedule this replica so that it executes automatically.' : 'Add a new schedule so that the Replica executes automatically.'}</NoSchedulesSubtitle>
        <Button hollow={this.props.secondaryEmpty} onClick={() => { this.handleAddScheduleClick() }}>Add Schedule</Button>
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
        <Button
          disabled={this.props.adding}
          secondary
          onClick={() => { this.handleAddScheduleClick() }}
        >Add Schedule</Button>
        <Timezone>
          <TimezoneLabel>Show all times in</TimezoneLabel>
          <DropdownLink
            items={timezoneItems}
            selectedItem={selectedItem}
            onChange={this.props.onTimezoneChange}
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
        <Modal
          isOpen={this.state.showOptionsModal}
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
        <AlertModal
          isOpen={this.state.showDeleteConfirmation}
          title="Delete Schedule?"
          message="Are you sure you want to delete this schedule?"
          extraMessage=" "
          onConfirmation={() => { this.handleDeleteConfirmation() }}
          onRequestClose={() => { this.handleCloseDeleteConfirmation() }}
        />
      </Wrapper>
    )
  }
}

export default Schedule
