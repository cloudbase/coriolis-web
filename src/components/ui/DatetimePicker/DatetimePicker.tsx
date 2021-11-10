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
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import styled, { createGlobalStyle } from 'styled-components'
import Datetime from 'react-datetime'
import moment from 'moment'
import autobind from 'autobind-decorator'

import DropdownButton from '../Dropdowns/DropdownButton/DropdownButton'

import DomUtils from '../../../utils/DomUtils'
import DateUtils from '../../../utils/DateUtils'
import StyleProps from '../../styleUtils/StyleProps'

import style from './style'

require('moment/locale/en-gb')

const GlobalStyle = createGlobalStyle`${style}`

const Wrapper = styled.div<any>`
  width: ${StyleProps.inputSizes.regular.width}px;
`
const DropdownButtonStyled = styled(DropdownButton)`
  font-size: 12px;
`
const Portal = styled.div<any>`
  position: absolute;
  z-index: 10;
  &.hideTip {
    .rdtPicker:after {
      content: none;
    }
  }
`
const DatetimeStyled = styled(Datetime)<any>`
  ${StyleProps.boxShadow}
`

type Props = {
  value: Date | null,
  onChange: (date: Date) => void,
  isValidDate?: (currentDate: Date, selectedDate: Date) => boolean,
  timezone: 'utc' | 'local',
  useBold?: boolean,
  dispatchChangeContinously?: boolean,
}
type State = {
  showPicker: boolean,
  date: moment.Moment | null,
}
@observer
class DatetimePicker extends React.Component<Props, State> {
  state: State = {
    showPicker: false,
    date: null,
  }

  itemMouseDown: boolean | undefined

  portalRef: HTMLElement | undefined | null

  buttonRef: HTMLElement | undefined | null

  scrollableParent: HTMLElement | undefined | null

  UNSAFE_componentWillMount() {
    if (this.props.value) {
      this.setState({ date: moment(this.props.value) })
    }
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick, false)
    if (this.buttonRef) {
      this.scrollableParent = DomUtils.getScrollableParent(this.buttonRef)
      this.scrollableParent.addEventListener('scroll', this.handleScroll)
    }
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    this.setState({ date: newProps.value && moment(newProps.value) })
  }

  componentDidUpdate() {
    this.setPortalPosition()
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick, false)
    if (this.scrollableParent) {
      this.scrollableParent.removeEventListener('scroll', this.handleScroll, false)
    }
  }

  setPortalPosition() {
    if (!this.portalRef || !this.buttonRef) {
      return
    }

    const buttonRect = this.buttonRef.getBoundingClientRect()
    const leftOffset = (buttonRect.left - (this.portalRef.offsetWidth - buttonRect.width)) + 10
    const tipHeight = 12
    let topOffset = buttonRect.top + this.buttonRef.offsetHeight + tipHeight
    const listHeight = this.portalRef.offsetHeight

    if (topOffset + listHeight > window.innerHeight) {
      topOffset = window.innerHeight - listHeight - 16
      this.portalRef.classList.add('hideTip')
    } else {
      this.portalRef.classList.remove('hideTip')
    }

    this.portalRef.style.top = `${topOffset + window.pageYOffset}px`
    this.portalRef.style.left = `${leftOffset + window.pageXOffset}px`
  }

  isValidDate(currentDate: Date, selectedDate: Date): boolean {
    if (!this.props.isValidDate) {
      return true
    }

    return this.props.isValidDate(currentDate, selectedDate)
  }

  @autobind
  handleScroll() {
    if (this.buttonRef) {
      if (DomUtils.isElementInViewport(this.buttonRef, this.scrollableParent)) {
        this.setPortalPosition()
      } else if (this.state.showPicker) {
        this.setState({ showPicker: false })
      }
    }
  }

  @autobind
  handlePageClick(e: Event) {
    const path = DomUtils.getEventPath(e)

    if (!this.itemMouseDown && !path.find(n => n.className === 'rdtPicker')) {
      this.dispatchChange()
      this.setState({ showPicker: false })
    }
  }

  handleDropdownClick() {
    this.dispatchChange()
    this.setState(prevState => ({ showPicker: !prevState.showPicker }))
  }

  handleChange(newDate: Date) {
    let date = moment(newDate)
    if (this.props.timezone === 'utc') {
      date = DateUtils.getLocalTime(newDate)
    }

    this.setState({ date }, () => {
      if (this.props.dispatchChangeContinously) {
        this.dispatchChange()
      }
    })
  }

  dispatchChange() {
    if (
      this.state.date
      && this.state.showPicker
      && this.state.date.toDate().getTime() !== (this.props.value && this.props.value.getTime())
    ) {
      this.props.onChange(this.state.date.toDate())
    }
  }

  renderDateTimePicker(timezoneDate: moment.Moment | null) {
    if (!this.state.showPicker) {
      return null
    }

    const { body } = document
    return ReactDOM.createPortal((
      <Portal ref={(e: HTMLElement | null | undefined) => { this.portalRef = e }}>
        <DatetimeStyled
          input={false}
          value={timezoneDate}
          style={{ top: 0, right: 0 }}
          onChange={(date: Date) => { this.handleChange(date) }}
          dateFormat="DD/MM/YYYY"
          timeFormat="hh:mm A"
          locale="en-gb"
          isValidDate={
            (currentDate: Date, selectedDate: Date) => this.isValidDate(currentDate, selectedDate)
          }
        />
      </Portal>
    ), body)
  }

  render() {
    let timezoneDate = this.state.date
    if (this.props.timezone === 'utc' && timezoneDate) {
      timezoneDate = DateUtils.getUtcTime(timezoneDate)
    }

    return (
      <>
        <GlobalStyle />
        <Wrapper>
          <DropdownButtonStyled
            customRef={e => { this.buttonRef = e }}
            data-test-id="datetimePicker-dropdownButton"
            width={207}
            value={(timezoneDate && moment(timezoneDate).format('DD/MM/YYYY hh:mm A')) || '-'}
            centered
            useBold={this.props.useBold}
            onClick={() => { this.handleDropdownClick() }}
            onMouseDown={() => { this.itemMouseDown = true }}
            onMouseUp={() => { this.itemMouseDown = false }}
          />
          {this.renderDateTimePicker(timezoneDate)}
        </Wrapper>
      </>
    )
  }
}

export default DatetimePicker
