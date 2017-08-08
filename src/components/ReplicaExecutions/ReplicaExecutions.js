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
/* eslint-disable no-trailing-spaces */
import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ReplicaExecutions.scss';
import Helper from '../Helper';
import LoadingIcon from '../LoadingIcon';
import moment from 'moment';
import MigrationActions from '../../actions/MigrationActions';
import Tasks from '../Tasks';
import ExecutionsTimeline from '../ExecutionsTimeline';
import { tasksPollTimeout } from '../../config'
import ConfirmationDialog from '../ConfirmationDialog'


const title = 'Replica Executions';

class ReplicaExecutions extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  static propTypes = {
    replica: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.changeExecution = this.changeExecution.bind(this)

    this.state = {
      executionRef: null,
      tasks: null,
      confirmationDialog: {
        visible: false,
        message: "Are you sure?",
        onConfirm: null,
        onCancel: null
      }
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

  componentWillReceiveProps(newProps) {
    if (newProps.replica && newProps.replica.executions.length) {
      let execution = newProps.replica.executions[newProps.replica.executions.length - 1]
      this.setState({
        executionRef: execution,
        tasks: execution.tasks
      })
    } else if (newProps.replica.executions.length == 0) {
      this.setState({
        executionRef: null,
        tasks: null
      })
    }
  }

  componentWillUnmount() {
    clearInterval(this.timeout)
  }

  cancelExecution() {
    MigrationActions.cancelMigration(this.props.replica, () => {
      this.refreshExecution()
    })
  }

  executeNow() {
    MigrationActions.executeReplica(this.props.replica)
    clearInterval(this.timeout)
    this.timeout = setInterval((e) => this.pollTasks(e), tasksPollTimeout)
  }

  deleteExecution() {
    this.setState({
      confirmationDialog: {
        visible: true,
        onConfirm: () => {
          this.setState({ confirmationDialog: { visible: false } })
          let index = this.props.replica.executions.indexOf(this.state.executionRef)

          MigrationActions.deleteReplicaExecution(this.props.replica, this.state.executionRef.id, () => {
            if (this.props.replica.executions[index - 1]) {
              this.changeExecution(this.props.replica.executions[index - 1])
            } else if (this.props.replica.executions[index + 1]) {
              this.changeExecution(this.props.replica.executions[index + 1])
            } else {
              this.changeExecution(null)
            }
          })
        },
        onCancel: () => {
          this.setState({ confirmationDialog: { visible: false } })
        }
      }
    })
  }

  refreshExecution() {
    MigrationActions.getReplicaExecutionDetail(this.props.replica, this.state.executionRef.id,
      (replica, executionId, response) => {
        let props = this.props
        props.migration.tasks = response.data.execution.tasks
        MigrationActions.getReplicaExecutions(replica)
        let state = this.processProps({ migration: { tasks: response.data.execution.tasks } }, null)
        this.setState(state)
      })
  }

  pollTasks() {
    if (this.props && this.props.replica && this.props.replica.executions.length) {
      if (this.props.replica.executions[this.props.replica.executions.length - 1].status == "RUNNING") {
        MigrationActions.getReplicaExecutionDetail(this.props.replica, this.state.executionRef.id,
          (replica, executionId, response) => {
            this.setState({
              tasks: response.data.execution.tasks
            })
          })
      }
    }
  }

  changeExecution(execution) {
    if (execution == null) {
      this.setState({
        executionRef: null,
        tasks: null
      })
    } else {
      this.setState({
        executionRef: execution,
        tasks: execution.tasks
      })
    }
  }

  render() {
    if (this.props.replica) {
      if (this.props.replica.executions.length && this.state.executionRef) {
        let executionBtn = <button className="wire red" onClick={(e) => this.deleteExecution(e)}>Delete</button>
        if (this.props.replica.executions && this.props.replica.executions[this.props.replica.executions.length - 1] &&
          this.props.replica.executions[this.props.replica.executions.length - 1].status == "RUNNING") {
          executionBtn =
            <button className="gray wire" onClick={(e) => this.cancelExecution(e)}>Cancel execution</button>
        }

        let executionsSorted = this.props.replica.executions

        executionsSorted.sort((a, b) => a.number - b.number)
        let executionTime = Helper.getTimeObject(this.state.executionRef.created_at)

        return (
          <div className={s.root}>
            <div className={s.container}>
              <ExecutionsTimeline
                executions={this.props.replica.executions}
                currentExecution={this.state.executionRef}
                handleChangeExecution={this.changeExecution}
              />
              <div className={s.executionsWrapper}>
                <div className={s.leftSide}>
                  <h4>Execution #{this.state.executionRef && this.state.executionRef.number}</h4>
                  <span className={s.date}>
                    {this.state.executionRef && moment(executionTime).format("MMM Do YYYY HH:mm")}
                  </span>
                  <span
                    className={"status-pill " + this.state.executionRef.status}
                  >{this.state.executionRef.status}</span>
                </div>
                <div className={s.rightSide}>
                  {executionBtn}
                </div>
              </div>
              <Tasks tasks={this.state.tasks} />
            </div>
            <ConfirmationDialog
              visible={this.state.confirmationDialog.visible}
              message={this.state.confirmationDialog.message}
              onConfirm={(e) => this.state.confirmationDialog.onConfirm(e)}
              onCancel={(e) => this.state.confirmationDialog.onCancel(e)}
            />
          </div>
        );
      } else {
        return (
          <div className={s.root}>
            <div className={s.container}>
              <div className="no-results">No executions for this replica <br /> <br />
                <button onClick={(e) => this.executeNow(e)}>Execute Now</button>
              </div>
            </div>
          </div>
        )
      }
    } else {
      return (
        <div className={s.root}>
          <div className={s.container}>
            <LoadingIcon />
          </div>
        </div>
      )
    }
  }
}

export default withStyles(ReplicaExecutions, s);
