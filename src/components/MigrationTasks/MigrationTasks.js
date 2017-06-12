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
import moment from 'moment';
import Table from '../Table';
import s from './MigrationTasks.scss';
import TextTruncate from 'react-text-truncate';
import LoadingIcon from "../LoadingIcon/LoadingIcon";
import Dropdown from '../NewDropdown';
import MigrationActions from '../../actions/MigrationActions';
import {tasksPollTimeout} from '../../config'
import Tasks from '../Tasks';

const title = 'Migration Tasks';

class MigrationTasks extends Component {

  timeout = null

  static propTypes = {
    migration: PropTypes.object
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props)
    this.headers = [
      { label: "Task", key: 'task_type', width: 1 },
      { label: "Instance", key: 'instance', width: 1 },
      { label: "Latest Message", key: 'latest_message', width: 2 },
      { label: "Timestamp", key: 'timestamp', width: 1 }
    ]

    this.state = null
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
    this.timeout = setInterval((e) => this.pollTasks(e), tasksPollTimeout)
    this.context.onSetTitle(title);
    this.pollTasks()
  }

  componentWillUnmount() {
    clearInterval(this.timeout)
  }

  componentWillReceiveProps(props) {
    if (props.migration && props.migration.tasks) {
      let loadMigration = false
      props.migration.tasks.forEach((item) => {
        if (item.progress_updates.length) {
          let first = true
          if (item.progress_updates[0] != null) {
            item.progress_updates.sort((a, b) => moment(a.created_at).isAfter(moment(b.created_at)))
          } else {
            loadMigration = true // set flag to reload migration
          }
        }
      }, this)
      if (loadMigration) {
        MigrationActions.loadMigration(this.props.migration)
      }
    }
  }


  pollTasks() {
    if (this.props && this.props.migration &&
      this.props.migration.type == 'migration' && this.props.migration.status === "RUNNING") {
      MigrationActions.loadMigration(this.props.migration)
    }
  }

  render() {
    return (
      <div className={s.root}>
        { this.props.migration &&
          <div className={s.container}>
            <Tasks tasks={this.props.migration.tasks}/>
          </div>
        }
      </div>
    );
  }

}

export default withStyles(MigrationTasks, s);
