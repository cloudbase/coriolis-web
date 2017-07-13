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
import MigrationStore from '../../stores/MigrationStore';
import MigrationActions from '../../actions/MigrationActions';
import ScheduleItem from '../ScheduleItem';
import s from './ReplicaSchedule.scss';

const title = 'Migration Schedule';

class ReplicaSchedule extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  static propTypes = {
    replica: PropTypes.object,
    schedules: PropTypes.array
  }

  constructor(props) {
    super(props)
    this.store = MigrationStore
    this.blankSchedule = {
      type: "Execute Now",
      date: new Date(),
      hour: { label: "12", value: 12 },
      minute: { label: "00", value: 0 },
      tod: "AM",
      timezone: "EET",
    }

    this.state = {
      schedules: this.props.replica.schedules
    }
  }

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  updateState(data) {
    let schedules = this.state.schedules
    schedules[data.key] = data.data

    this.updateSchedule(schedules)
  }

  addSchedule() {
    let schedules = this.state.schedules
    schedules.push(this.blankSchedule)

    this.updateSchedule(schedules)
  }

  removeSchedule(index) {
    let schedules = this.state.schedules
    schedules.splice(index, 1)

    this.updateSchedule(schedules)
  }

  updateSchedule(schedules) {
    this.setState({ schedules: schedules })
    MigrationActions.setMigrationProperty(this.props.replica.id, 'schedules', schedules)
  }

  render() {
    let _this = this
    let schedules

    if (this.state.schedules && this.state.schedules.length) {
      schedules = this.state.schedules.map((schedule, index) => (
          <ScheduleItem
            data={schedule}
            key={index}
            index={index}
            removeHandle={(e) => _this.removeSchedule(e)}
            updateState={(e) => _this.updateState(e)}
          />
        )
      )
    } else {
      schedules = <div className="no-results">No schedules for this migration</div>
    }

    let newScheduleBtn = null
    if (this.props.replica.migrationType == 'replica') {
      newScheduleBtn = <button className={s.addScheduleBtn} onClick={(e) => this.addSchedule(e)}>Add schedule</button>
    }


    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className="items-list">
            {schedules}
          </div>
          {newScheduleBtn}
        </div>
      </div>
    );
  }

}

export default withStyles(ReplicaSchedule, s);
