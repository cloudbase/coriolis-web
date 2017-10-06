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
import Modal from 'react-modal'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ReplicaExecutions.scss';
import Helper from '../Helper';
import LoadingIcon from '../LoadingIcon';
import moment from 'moment';
import NotificationActions from '../../actions/NotificationActions'
import MigrationActions from '../../actions/MigrationActions';
import Tasks from '../Tasks';
import ExecutionsTimeline from '../ExecutionsTimeline';
import { tasksPollTimeout } from '../../config'
import ConfirmationDialog from '../ConfirmationDialog'
import ReplicaExecutionOptions from '../ReplicaExecutionOptions'


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
      showExecutionModal: false,
      deleteConfirmationDialog: {
        visible: false,
        message: "Are you sure?",
        onConfirm: null,
        onCancel: null
      },
      cancelExecutionConfirmationDialog: {
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
      let isNewExecution = newProps.replica.executions.length > (this.state.executionsCount || 0)
      let lastExecution = newProps.replica.executions[newProps.replica.executions.length - 1]

      // Don't update the component every time the last execution is updated
      // Update the component if the last execution is the currently selected one
      // Update the component if a new execution was just added
      if (!this.state.executionRef || this.state.executionRef.id === lastExecution.id || isNewExecution) {
        this.setState({
          executionsCount: newProps.replica.executions.length,
          executionRef: lastExecution,
          tasks: lastExecution.tasks
        })
      }
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
    this.setState({
      cancelExecutionConfirmationDialog: {
        visible: true,
        onConfirm: () => {
          MigrationActions.cancelMigration(this.props.replica, () => {
            this.refreshExecution()
          })
          this.setState({ cancelExecutionConfirmationDialog: { visible: false } })
        },
        onCancel: () => {
          this.setState({ cancelExecutionConfirmationDialog: { visible: false } })
        }
      }
    })
  }

  showExecutionModal() {
    this.setState({ showExecutionModal: true })
  }

  closeExecutionModal() {
    this.setState({ showExecutionModal: false })
  }

  executeNow(options) {
    this.closeExecutionModal()
    MigrationActions.executeReplica(this.props.replica, null, null, options)
    clearInterval(this.timeout)
    this.timeout = setInterval((e) => this.pollTasks(e), tasksPollTimeout)
  }

  deleteExecution() {
    this.setState({
      deleteConfirmationDialog: {
        visible: true,
        onConfirm: () => {
          this.setState({ deleteConfirmationDialog: { visible: false } })
          let index = this.props.replica.executions.indexOf(this.state.executionRef)

          MigrationActions.deleteReplicaExecution(this.props.replica, this.state.executionRef.id, () => {
            let executions = this.props.replica.executions

            if (executions[index]) {
              this.changeExecution(executions[index])
            } else if (executions[index - 1]) {
              this.changeExecution(executions[index - 1])
            } else {
              this.changeExecution(null)
            }
          })
        },
        onCancel: () => {
          this.setState({ deleteConfirmationDialog: { visible: false } })
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
    let executions = this.props && this.props.replica && this.props.replica.executions
    let lastExecution = executions && executions.length && executions[executions.length - 1]
    if (lastExecution.status === 'RUNNING') {
      MigrationActions.getReplicaExecutionDetail(this.props.replica, lastExecution.id)
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

  handleExecutionIdCopy() {
    let succesful = Helper.copyTextToClipboard(this.state.executionRef.id)

    if (succesful) {
      NotificationActions.notify('The ID has been copied to clipboard.')
    } else {
      NotificationActions.notify('The ID couldn\'t be copied', 'error')
    }
  }

  render() {
    let modalStyle = {
      overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(164, 170, 181, 0.69)"
      },
      content: {
        padding: "0px",
        borderRadius: "4px",
        border: "none",
        bottom: "auto",
        width: "576px",
        height: "auto",
        left: "50%",
        top: "120px",
        marginLeft: "-288px"
      }
    }

    if (this.props.replica) {
      if (this.props.replica.executions.length && this.state.executionRef) {
        let executionBtn = <button className="wire red" onClick={(e) => this.deleteExecution(e)}>Delete</button>

        if (this.state.executionRef.status === 'RUNNING') {
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
                  <span className={"status-pill " + this.state.executionRef.status}>
                    {this.state.executionRef.status}
                  </span>
                  <span className={s.date}>
                    {this.state.executionRef && moment(executionTime).format("MMM Do YYYY HH:mm")}
                  </span>
                  <div className={s.id} onClick={this.handleExecutionIdCopy.bind(this)}>
                    <div className={s.idLabel}>
                      {this.state.executionRef && this.state.executionRef.id ? 'ID: ' + this.state.executionRef.id : ''}
                    </div>
                    <div className="copyButton"></div>
                  </div>
                </div>
                <div className={s.rightSide}>
                  {executionBtn}
                </div>
              </div>
              <Tasks tasks={this.state.tasks} execution={this.state.executionRef} />
            </div>
            <ConfirmationDialog
              visible={this.state.deleteConfirmationDialog.visible}
              message={this.state.deleteConfirmationDialog.message}
              onConfirm={(e) => this.state.deleteConfirmationDialog.onConfirm(e)}
              onCancel={(e) => this.state.deleteConfirmationDialog.onCancel(e)}
            />
            <ConfirmationDialog
              visible={this.state.cancelExecutionConfirmationDialog.visible}
              message={this.state.cancelExecutionConfirmationDialog.message}
              onConfirm={(e) => this.state.cancelExecutionConfirmationDialog.onConfirm(e)}
              onCancel={(e) => this.state.cancelExecutionConfirmationDialog.onCancel(e)}
            />
          </div>
        );
      } else {
        return (
          <div className={s.root}>
            <div className={s.container}>
              <div className="noResultsLarge">
                <span className="icon"></span>
                <h3>It looks like there are no executions in this replica</h3>
                <p>This replica has not been executed yet</p>
                <button onClick={this.showExecutionModal.bind(this)}>Execute Now</button>
              </div>
            </div>
            <Modal
              isOpen={this.state.showExecutionModal}
              style={modalStyle}
              onRequestClose={this.closeExecutionModal.bind(this)}
              contentLabel="Replica Execution Options"
            >
              <ReplicaExecutionOptions
                onCancel={this.closeExecutionModal.bind(this)}
                onExecute={this.executeNow.bind(this)}
              />
            </Modal>
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
