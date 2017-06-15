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
import s from './ReplicaExecutions.scss';
import Dropdown from '../NewDropdown';
import LoadingIcon from '../LoadingIcon';
import moment from 'moment';
import MigrationActions from '../../actions/MigrationActions';
import Tasks from '../Tasks';
import ExecutionsTimeline from '../ExecutionsTimeline';
import {tasksPollTimeout} from '../../config'


const title = 'Replica Executions';

class ReplicaExecutions extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  static propTypes = {
    migration: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.changeExecution = this.changeExecution.bind(this)

    this.state = {
      executionRef: null,
      tasks: null
    }
  }

  componentWillMount() {
    this.context.onSetTitle(title);
    this.componentWillReceiveProps(this.props)
    this.timeout = setInterval((e) => this.pollTasks(e), tasksPollTimeout)
  }

  componentDidMount() {
    this.pollTasks()
  }

  componentWillUnmount() {
    clearInterval(this.timeout)
  }

  componentWillReceiveProps(newProps, oldProps) {
    if (newProps.migration && newProps.migration.executions.length) {
      let execution = newProps.migration.executions[newProps.migration.executions.length - 1]
      this.setState({
        executionRef: execution,
        tasks: execution.tasks
      })
    }
  }

  executeNow() {
    MigrationActions.executeReplica(this.props.migration)
    clearInterval(this.timeout)
    this.timeout = setInterval((e) => this.pollTasks(e), tasksPollTimeout)
  }

  cancelExecution() {
    MigrationActions.cancelMigration(this.props.migration, (replica, response) => {
      this.refreshExecution()
    })
  }

  deleteExecution() {
    MigrationActions.cancelMigration(this.props.migration, (replica, response) => {
      this.refreshExecution()
    })
  }

  refreshExecution() {
    MigrationActions.getReplicaExecutionDetail(this.props.migration, this.state.executionRef.id,
      (replica, executionId, response) => {
        let props = this.props
        props.migration.tasks = response.data.execution.tasks
        MigrationActions.getReplicaExecutions(replica)
        let state = this.processProps({ migration: {tasks: response.data.execution.tasks } }, null)
        this.setState(state)
      })
  }

  pollTasks() {
    if (this.props && this.props.migration) {
      if (this.props.migration.executions[this.props.migration.executions.length - 1].status == "RUNNING") {
        MigrationActions.getReplicaExecutionDetail(this.props.migration, this.state.executionRef.id,
          (replica, executionId, response) => {
            this.setState({
              tasks: response.data.execution.tasks
            })
          })
      }
    }
  }

  changeExecution(execution) {
    this.setState({
      executionRef: execution,
      tasks: execution.tasks
    })
  }

  render() {
    if (this.props.migration) {
      let executionBtn = null //<button className="red wire" onClick={(e) => this.deleteExecution(e)}>Delete execution</button>
      if (this.props.migration.executions &&
        this.props.migration.executions[this.props.migration.executions.length - 1].status == "RUNNING") {
        executionBtn = <button className="gray wire" onClick={(e) => this.cancelExecution(e)}>Cancel execution</button>
      }

      let executionsSorted = this.props.migration.executions
      executionsSorted.sort((a, b) => a.number - b.number)

      return (
        <div className={s.root}>
          <div className={s.container}>
            <ExecutionsTimeline
              executions={this.props.migration.executions}
              currentExecution={this.state.executionRef}
              handleChangeExecution={this.changeExecution}
            />
            <div className={s.executionsWrapper}>
              <div className={s.leftSide}>
                <h4>Execution #{this.state.executionRef && this.state.executionRef.number}</h4>
                <span className={s.date}>
                  {this.state.executionRef && moment(this.state.executionRef.created_at).format("MMM Do YYYY HH:mm")}
                </span>
                <span className={"status-pill " + this.state.executionRef.status}>{this.state.executionRef.status}</span>
              </div>
              <div className={s.rightSide}>
                {executionBtn}
              </div>
            </div>
            <Tasks tasks={this.state.tasks}/>
          </div>
        </div>
      );
    } else {
      return (
        <div className={s.root}>
          <div className={s.container}>
            <LoadingIcon/>
          </div>
        </div>
      )
    }

  }

}

export default withStyles(ReplicaExecutions, s);
