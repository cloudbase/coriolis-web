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
import s from './WizardSchedule.scss';
import ScheduleItem from '../ScheduleItem';

const title = 'Schedule';

class WizardSchedule extends Component {

  static propTypes = {
    schedules: PropTypes.array,
    setWizardState: PropTypes.func,
    migrationType: PropTypes.string
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props)
    this.blankSchedule = {
      type: "Execute Now",
      date: new Date(),
      hour: { label: "12", value: 12 },
      minute: { label: "00", value: 0 },
      tod: "AM",
      timezone: "EET",
    }

    this.state = {
      valid: true,
      nextStep: "WizardSummary",
      schedules: this.props.schedules
    }
  }


  componentWillMount() {
    // if none, add the first
    if (this.props.schedules.length == 0) {
      this.setState({ schedules: [this.blankSchedule] }, () => {
        this.props.setWizardState(this.state);
      })
    } else {
      this.props.setWizardState(this.state)
    }
    this.context.onSetTitle(title);
  }

  updateState(data) {
    let schedules = this.props.schedules
    schedules[data.key] = data.data

    this.updateSchedule(schedules)
  }

  addSchedule() {
    let schedules = this.props.schedules
    schedules.push(this.blankSchedule)

    this.updateSchedule(schedules)
  }

  removeSchedule(index) {
    let schedules = this.props.schedules
    delete schedules[index]

    this.updateSchedule(schedules)
  }

  updateSchedule(schedules) {
    this.props.setWizardState({ schedules: schedules });
  }

  render() {
    let _this = this
    let schedules = this.props.schedules.map((schedule, index) => (
        <ScheduleItem
          data={schedule}
          key={index}
          index={index}
          removeHandle={(e) => _this.removeSchedule(e)}
          updateState={(e) => _this.updateState(e)}
        />
      )
    )
    let newScheduleBtn = null
    if (this.props.migrationType == 'replica') {
      newScheduleBtn = <button className={s.addScheduleBtn} onClick={(e) => this.addSchedule(e)}>Add schedule</button>
    }


    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className="items-list">
            {schedules}
          </div>
          {/*{newScheduleBtn}*/}
        </div>
      </div>
    );
  }

}

export default withStyles(WizardSchedule, s);
