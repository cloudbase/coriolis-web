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
import styled, { injectGlobal } from 'styled-components'
import Datetime from 'react-datetime'
import PropTypes from 'prop-types'
import moment from 'moment'

import { DropdownButton } from 'components'

import DomUtils from '../../../utils/DomUtils'
import DateUtils from '../../../utils/DateUtils'
import StyleProps from '../../styleUtils/StyleProps'

import style from './style.js'

require('moment/locale/en-gb')

injectGlobal`${style}`

const Wrapper = styled.div`
  position: relative;
  width: ${StyleProps.inputSizes.regular.width}px;
`
const DropdownButtonStyled = styled(DropdownButton)`
  font-size: 12px;
`
const DatetimeStyled = styled(Datetime)`
  position: absolute;
  right: -11px;
  top: 49px;
  z-index: 10;

  .rdtPicker {
    display: ${props => props.open ? 'block' : 'none'};
  }
`

class DatetimePicker extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    isValidDate: PropTypes.func,
    timezone: PropTypes.string,
  }

  constructor() {
    super()

    this.state = {
      showPicker: false,
      date: null,
    }
    this.handlePageClick = this.handlePageClick.bind(this)
  }

  componentWillMount() {
    this.setState({ date: this.props.value })
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick, false)
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick, false)
  }

  isValidDate(currentDate, selectedDate) {
    if (!this.props.isValidDate) {
      return true
    }

    return this.props.isValidDate(currentDate, selectedDate)
  }

  handlePageClick(e) {
    let path = DomUtils.getEventPath(e)

    if (!this.itemMouseDown && !path.find(n => n.className === 'rdtPicker')) {
      if (this.state.date && this.state.showPicker) {
        this.props.onChange(this.state.date)
      }
      this.setState({ showPicker: false })
    }
  }

  handleDropdownClick() {
    if (this.state.showPicker && this.state.date) {
      this.props.onChange(this.state.date)
    }

    this.setState({ showPicker: !this.state.showPicker })
  }

  handleChange(date) {
    if (this.props.timezone === 'utc') {
      date = DateUtils.getLocalTime(date)
    }

    this.setState({ date })
  }

  render() {
    let timezoneDate = this.state.date
    if (this.props.timezone === 'utc' && timezoneDate) {
      timezoneDate = DateUtils.getUtcTime(timezoneDate)
    }

    return (
      <Wrapper>
        <DropdownButtonStyled
          width={176}
          value={(timezoneDate && moment(timezoneDate).format('DD/MM/YYYY hh:mm A')) || '-'}
          centered
          onClick={() => { this.handleDropdownClick() }}
          onMouseDown={() => { this.itemMouseDown = true }}
          onMouseUp={() => { this.itemMouseDown = false }}
        />
        <DatetimeStyled
          input={false}
          value={timezoneDate}
          open={this.state.showPicker}
          onChange={date => { this.handleChange(date) }}
          dateFormat="DD/MM/YYYY"
          timeFormat="hh:mm A"
          locale="en-gb"
          isValidDate={(currentDate, selectedDate) => this.isValidDate(currentDate, selectedDate)}
        />
      </Wrapper>
    )
  }
}

export default DatetimePicker
