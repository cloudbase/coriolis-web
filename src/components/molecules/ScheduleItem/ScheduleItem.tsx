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
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'
import moment from 'moment'

import Switch from '../../atoms/Switch'
import Dropdown from '../Dropdown'
import DatetimePicker from '../DatetimePicker'
import Button from '../../atoms/Button'
import type { Schedule, ScheduleFieldName } from '../../../@types/Schedule'

import { executionOptions } from '../../../constants'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import DateUtils from '../../../utils/DateUtils'
import notificationStore from '../../../stores/NotificationStore'
import deleteImage from './images/delete.svg'
import deleteHoverImage from './images/delete-hover.svg'
import saveImage from './images/save.svg'
import saveHoverImage from './images/save-hover.svg'

const Wrapper = styled.div<any>`
  display: flex;
  border-top: 1px solid ${Palette.grayscale[1]};
  padding: 16px 0;
  position: relative;
  &:last-child {
    border-bottom: 1px solid ${Palette.grayscale[1]};
  }
`
const Data = styled.div<any>`
  width: ${props => props.width};
`
const Label = styled.div<any>`
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
const DropdownStyled = styled(Dropdown)`
  font-size: 12px;
`
const ItemButton = (props: any) => css`
  width: 16px;
  height: 16px;
  position: absolute;
  cursor: pointer;
  top: 24px;
  ${props.hidden ? 'display: none;' : ''}
`
const DeleteButton = styled.div<any>`
  ${props => ItemButton(props)}
  background: url('${deleteImage}') center no-repeat;
  right: -32px;

  &:hover {
    background: url('${deleteHoverImage}') center no-repeat;
  }
`
const SaveButton = styled.div<any>`
  ${props => ItemButton(props)}
  background: url('${saveImage}') center no-repeat;
  right: -64px;
  &:hover {
    background: url('${saveHoverImage}') center no-repeat;
  }
`
const padNumber = (number: number) => {
  if (number < 10) return `0${number}`
  return number.toString()
}

type Field = { label: string, value?: any }
type TimezoneValue = 'utc' | 'local'
type Props = {
  colWidths: string[],
  item: Schedule,
  onChange: (schedule: Schedule, forced?: boolean) => void,
  onSaveSchedule: () => void,
  onShowOptionsClick: () => void,
  onDeleteClick: () => void,
  unsavedSchedules: Schedule[],
  timezone: TimezoneValue,
}
@observer
class ScheduleItem extends React.Component<Props> {
  getFieldValue(
    items: Field[],
    fieldName: ScheduleFieldName,
    zeroBasedIndex?: boolean,
    defaultSelectedIndex?: number,
  ) {
    if (this.props.item.schedule == null) {
      return defaultSelectedIndex !== undefined ? items[defaultSelectedIndex] : items[0]
    }

    if (this.props.item.schedule[fieldName] == null) {
      return items[0]
    }

    if (zeroBasedIndex) {
      let value = this.props.item.schedule[fieldName] || 0

      if (fieldName === 'hour' && this.props.timezone === 'local') {
        value = DateUtils.getLocalHour(value)
      }

      return items[value + 1]
    }

    return items[this.props.item.schedule[fieldName] || 0]
  }

  handleMonthChange(item: Field) {
    const month = item.value || 1
    const maxNumDays = moment().month(month - 1).daysInMonth()
    const change: Schedule = { schedule: { month: item.value } }
    if (this.props.item.schedule && this.props.item.schedule.dom && change.schedule
      && this.props.item.schedule.dom > maxNumDays) {
      change.schedule.dom = maxNumDays
    }

    this.props.onChange(change)
  }

  handleExpirationDateChange(date: Date) {
    const newDate = moment(date)
    if (newDate.diff(new Date(), 'minutes') < 60) {
      notificationStore.alert('Please select a further expiration date.', 'error')
      return
    }

    this.props.onChange({ expiration_date: newDate.toDate() })
  }

  handleHourChange(hour: number) {
    let usableHour = hour
    if (this.props.timezone === 'local' && usableHour != null) {
      usableHour = DateUtils.getUtcHour(usableHour)
    }

    this.props.onChange({ schedule: { hour: usableHour } })
  }

  shouldUseBold(fieldName: string, isRootField?: boolean) {
    const unsavedSchedule = this.props.unsavedSchedules.find(s => s.id === this.props.item.id)
    if (!unsavedSchedule) {
      return false
    }
    const data: any = isRootField ? unsavedSchedule : unsavedSchedule.schedule
    if (data && data[fieldName] !== undefined) {
      return true
    }
    return false
  }

  areExecutionOptionsChanged() {
    let isChanged = false
    executionOptions.forEach(o => {
      const usableItem: any = this.props.item
      const scheduleValue = usableItem[o.name]
      const optionValue = o.defaultValue !== undefined ? o.defaultValue : false
      if (scheduleValue != null && scheduleValue !== optionValue) {
        isChanged = true
      }
    })
    return isChanged
  }

  renderLabel(value: Field) {
    return <Label>{value.label}</Label>
  }

  renderMonthValue() {
    const items: any = [{ label: 'Any', value: null }]
    const months = moment.months()
    months.forEach((label, value) => {
      items.push({ label, value: value + 1 })
    })

    if (this.props.item.enabled) {
      return this.renderLabel(this.getFieldValue(items, 'month'))
    }

    return (
      <DropdownStyled
        centered
        width={160}
        items={items}
        useBold={this.shouldUseBold('month')}
        selectedItem={this.getFieldValue(items, 'month')}
        onChange={item => { this.handleMonthChange(item) }}
        data-test-id="scheduleItem-monthDropdown"
      />
    )
  }

  renderDayOfMonthValue() {
    const month = this.props.item.schedule && this.props.item.schedule.month
      ? this.props.item.schedule.month : 1
    const items: any = [{ label: 'Any', value: null }]
    for (let i = 1; i <= moment().month(month - 1).daysInMonth(); i += 1) {
      items.push({ label: i.toString(), value: i })
    }

    if (this.props.item.enabled) {
      return this.renderLabel(this.getFieldValue(items, 'dom'))
    }

    return (
      <DropdownStyled
        centered
        width={86}
        items={items}
        useBold={this.shouldUseBold('dom')}
        selectedItem={this.getFieldValue(items, 'dom')}
        onChange={item => { this.props.onChange({ schedule: { dom: item.value } }) }}
        data-test-id="scheduleItem-dayOfMonthDropdown"
      />
    )
  }

  renderDayOfWeekValue() {
    const items: any = [{ label: 'Any', value: null }]

    const days = moment.weekdays(true)
    days.forEach((label, value) => {
      items.push({ label, value })
    })

    if (this.props.item.enabled) {
      return this.renderLabel(this.getFieldValue(items, 'dow', true))
    }

    return (
      <DropdownStyled
        centered
        width={160}
        items={items}
        useBold={this.shouldUseBold('dow')}
        selectedItem={this.getFieldValue(items, 'dow', true)}
        onChange={item => { this.props.onChange({ schedule: { dow: item.value } }) }}
        data-test-id="scheduleItem-dayOfWeekDropdown"
      />
    )
  }

  renderHourValue() {
    const items: any = [{ label: 'Any', value: null }]
    for (let i = 0; i <= 23; i += 1) {
      items.push({ label: padNumber(i), value: i })
    }

    if (this.props.item.enabled) {
      return this.renderLabel(this.getFieldValue(items, 'hour', true, 1))
    }

    return (
      <DropdownStyled
        centered
        width={86}
        items={items}
        useBold={this.shouldUseBold('hour')}
        selectedItem={this.getFieldValue(items, 'hour', true, 1)}
        onChange={item => { this.handleHourChange(item.value) }}
        data-test-id="scheduleItem-hourDropdown"
      />
    )
  }

  renderMinuteValue() {
    const items: any = [{ label: 'Any', value: null }]
    for (let i = 0; i <= 59; i += 1) {
      items.push({ label: padNumber(i), value: i })
    }

    if (this.props.item.enabled) {
      return this.renderLabel(this.getFieldValue(items, 'minute', true, 1))
    }

    return (
      <DropdownStyled
        centered
        width={86}
        items={items}
        useBold={this.shouldUseBold('minute')}
        selectedItem={this.getFieldValue(items, 'minute', true, 1)}
        onChange={item => { this.props.onChange({ schedule: { minute: item.value } }) }}
        data-test-id="scheduleItem-minuteDropdown"
      />
    )
  }

  renderExpirationValue() {
    const date = this.props.item.expiration_date && moment(this.props.item.expiration_date)

    if (this.props.item.enabled) {
      let labelDate = date
      if (this.props.timezone === 'utc' && date) {
        labelDate = DateUtils.getUtcTime(date)
      }
      return this.renderLabel({ label: (labelDate && labelDate.format('DD/MM/YYYY hh:mm A')) || '-' })
    }

    return (
      <DatetimePicker
        value={date ? date.toDate() : null}
        timezone={this.props.timezone}
        useBold={this.shouldUseBold('expiration_date', true)}
        onChange={newDate => { this.handleExpirationDateChange(newDate) }}
        isValidDate={newDate => moment(newDate).isAfter(moment())}
      />
    )
  }

  render() {
    const enabled = typeof this.props.item.enabled !== 'undefined' && this.props.item.enabled !== null ? this.props.item.enabled : false
    return (
      <Wrapper data-test-id="scheduleItem">
        <Data width={this.props.colWidths[0]}>
          <Switch
            noLabel
            height={16}
            checked={enabled}
            onChange={itemEnabled => { this.props.onChange({ enabled: itemEnabled }, true) }}
            data-test-id="scheduleItem-enabled"
          />
        </Data>
        <Data width={this.props.colWidths[1]}>
          {this.renderMonthValue()}
        </Data>
        <Data width={this.props.colWidths[2]}>
          {this.renderDayOfMonthValue()}
        </Data>
        <Data width={this.props.colWidths[3]}>
          {this.renderDayOfWeekValue()}
        </Data>
        <Data width={this.props.colWidths[4]}>
          {this.renderHourValue()}
        </Data>
        <Data width={this.props.colWidths[5]}>
          {this.renderMinuteValue()}
        </Data>
        <Data width={this.props.colWidths[6]}>
          {this.renderExpirationValue()}
        </Data>
        <Data width={this.props.colWidths[7]}>
          <Button
            onClick={this.props.onShowOptionsClick}
            secondary
            hollow={!this.areExecutionOptionsChanged()}
            width="40px"
            style={{
              fontSize: '9px',
              letterSpacing: '1px',
              padding: '0 0 1px 3px',
            }}
            data-test-id="scheduleItem-optionsButton"
          >•••
          </Button>
        </Data>
        <DeleteButton
          data-test-id="scheduleItem-deleteButton"
          onClick={this.props.onDeleteClick}
          hidden={this.props.item.enabled}
        />
        <SaveButton
          data-test-id="scheduleItem-saveButton"
          onClick={this.props.onSaveSchedule}
          hidden={this.props.item.enabled
            || !this.props.unsavedSchedules.find(us => us.id === this.props.item.id)}
        />
      </Wrapper>
    )
  }
}

export default ScheduleItem
