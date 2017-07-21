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

import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ScheduleItem.scss';
import Dropdown from '../NewDropdown';
import DatePicker from 'react-datepicker';
import moment from 'moment';

class ScheduleItem extends Component {

  static propTypes = {
    data: PropTypes.object,
    index: PropTypes.number,
    updateState: PropTypes.func,
    removeHandle: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = this.props.data
    this.state.date = moment()
    this.types = ["Execute Now"] // "One time", "Every Day", "Once a week", "Once a month"]
    this.dateTypes = ["One time"]
    this.tods = ["AM", "PM"]
    this.timezones = ["EET", "EST", "GMT"]
    this.hours = []
    for (let i = 1; i <= 24; i++) {
      this.hours.push({ label: (i < 10 ? "0" : "") + i, value: i })
    }
    this.minutes = []
    for (let i = 0; i < 60; i++) {
      this.minutes.push({ label: (i < 10 ? "0" : "") + i, value: i })
    }
  }

  componentWillMount() {
    this.updateParentState()
  }

  handleChangeType(value) {
    this.setState({ type: value.value }, this.updateParentState);
  }

  handleChangeHour(value) {
    this.setState({ hour: value }, this.updateParentState);
  }

  handleChangeMinute(value) {
    this.setState({ minute: value }, this.updateParentState);
  }

  handleChangeTod(value) {
    this.setState({ tod: value }, this.updateParentState);
  }

  handleChangeTimezone(value) {
    this.setState({ timezone: value }, this.updateParentState);
  }

  handleRemove() {
    this.props.removeHandle(this.props.index)
  }

  updateParentState() {
    this.props.updateState({ key: this.props.index, data: this.state })
  }

  handleChangeDate(date) {
    this.setState({
      date: date
    });
  }

  render() {
    let dateDisabled = this.dateTypes.indexOf(this.state.type) == -1
    let hourDisabled = this.state.type == "Execute Now"
    return (
      <div className={s.root + " item"}>
        <div className={s.removeBtn + " icon-delete"} onClick={(e) => this.handleRemove(e)}></div>
        <span className="cell">
          <Dropdown
            options={this.types}
            onChange={(e) => this.handleChangeType(e)}
            value={this.state.type}
          />
        </span>
        <span className="cell">
          <DatePicker
            minDate={moment()}
            selected={this.state.date}
            onChange={(e) => this.handleChangeDate(e)}
            disabled={dateDisabled}
          />
        </span>
        <span className="cell">
          <Dropdown
            options={this.hours}
            onChange={(e) => this.handleChangeHour(e)}
            value={this.state.hour}
            disabled={hourDisabled}
          />
        </span>
        <span className="cell">
          <Dropdown
            options={this.minutes}
            onChange={(e) => this.handleChangeMinute(e)}
            value={this.state.minute}
            disabled={hourDisabled}
          />
        </span>
        <span className="cell">
          <Dropdown
            options={this.timezones}
            onChange={(e) => this.handleChangeTimezone(e)}
            value={this.state.timezone}
            disabled={hourDisabled}
          />
        </span>
      </div>
    );
  }

}

export default withStyles(ScheduleItem, s);
