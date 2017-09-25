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

import React, { PropTypes } from 'react';
import Reflux from 'reflux';
import Modal from 'react-modal'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ReplicaView.scss';
import Header from '../Header';
import Link from '../Link';
import MigrationStore from '../../stores/MigrationStore';
import MigrationActions from '../../actions/MigrationActions';
import LoadingIcon from '../LoadingIcon';
import TextTruncate from 'react-text-truncate';
import Location from '../../core/Location';
import ConfirmationDialog from '../ConfirmationDialog'
import { tasksPollTimeout } from '../../config'
import ReplicaExecutionOptions from '../ReplicaExecutionOptions'

class ReplicaView extends Reflux.Component {

  static propTypes = {
    type: PropTypes.string
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props)
    this.store = MigrationStore

    this.state = {
      title: 'Coriolis: View Replica',
      isBeingExecuted: false,
      showExecutionModal: false,
      confirmationDialog: {
        visible: false,
        message: "Are you sure?",
        onConfirm: null,
        onCancel: null
      }
    }
  }

  componentWillMount() {
    super.componentWillMount.call(this)

    MigrationActions.setReplica(this.props.replicaId)
  }

  componentDidMount() {
    this.context.onSetTitle(this.state.title);
    this.pollReplicaExecution()
  }

  componentWillUnmount() {
    super.componentWillUnmount.call(this)
    clearInterval(this.interval)
  }

  pollReplicaExecution() {
    clearInterval(this.interval)
    this.interval = setInterval(this.pollReplicaExecution.bind(this), tasksPollTimeout)

    MigrationActions.getReplicaExecutions(this.state.replicas.find(replica => replica.id == this.props.replicaId),
      () => {
        let execs = this.state.replicas.find(r => r.id == this.props.replicaId).executions
        if (execs && execs.length && execs[execs.length - 1].status !== 'RUNNING') {
          clearInterval(this.interval)
        }
      })
  }

  showExecutionModal() {
    this.setState({ showExecutionModal: true })
  }

  closeExecutionModal() {
    this.setState({ showExecutionModal: false })
  }

  executeReplica(options) {
    this.setState({ isBeingExecuted: true, showExecutionModal: false })
    let item = this.state.replicas.filter(replica => replica.id == this.props.replicaId)[0]
    MigrationActions.executeReplica(item, () => {
      this.pollReplicaExecution()
      this.setState({ isBeingExecuted: false })
    }, () => {
      this.pollReplicaExecution()
      this.setState({ isBeingExecuted: false })
    }, options)
  }

  goBack() {
    Location.push('/replicas')
  }

  onMigrationActionsChange(option) {
    let item = this.state.replicas.filter(replica => replica.id == this.props.replicaId)[0]
    switch (option.value) {
      case "delete":
        MigrationActions.deleteReplica(item)
        Location.push('/cloud-endpoints')
        break
      case "start":
        this.showExecutionModal()
        break
      default:
        break
    }
  }

  currentReplica(replicaId) {
    if (this.state.replicas) {
      return this.state.replicas.filter(replica => replica.id == replicaId)[0]
    } else {
      return null
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
    let item = this.currentReplica(this.props.replicaId)
    let title = "Edit"

    if (item) {
      title = "Edit Replica"

      let itemStatus = item.status
      if (item.executions.length) {
        itemStatus = item.executions[item.executions.length - 1].status
      }

      return (
        <div className={s.root}>
          <Header title={title} linkUrl="/replicas" />
          <div className={s.migrationHead}>
            <div className={s.container}>
              <div className="backBtn" onClick={(e) => this.goBack(e)}></div>
              <div className={s.migrationTypeImg + ' icon ' + item.type + "-large"}></div>
              <div className={s.migrationInfo}>
                <h2>
                  <TextTruncate line={1} truncateText="..." text={item.name} />
                </h2>
                <div className={s.migrationStats}>
                  <span className={s.migrationType + " " + item.type}>{item.type}</span>
                  <span className={s.migrationStatus + " " + itemStatus + " status-pill"}>{itemStatus}</span>
                </div>
              </div>
              <div className={s.migrationActions}>
                <div>
                  <button
                    className="gray"
                    disabled={item.status === "RUNNING" || this.state.isBeingExecuted}
                    onClick={this.showExecutionModal.bind(this)}
                  >
                    Execute Now
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={s.container}>
            {item ? (
              <div className={s.sidebar}>
                <Link
                  to={"/replica/" + item.id + "/"}
                  className={this.props.type == 'detail' ? "active" : ""}
                >Replica</Link>
                <Link
                  to={"/replica/executions/" + item.id + "/"}
                  className={this.props.type == 'tasks' ? "active" : ""}
                >Executions</Link>
                <Link
                  to={"/replica/schedule/" + item.id + "/"}
                  className={this.props.type == 'schedule' ? "active" : ""}
                >Schedule</Link>
              </div>
            ) : ""}

            <div className={s.content}>
              {React.cloneElement(this.props.children, { replica: item })}
            </div>
          </div>
          <ConfirmationDialog
            visible={this.state.confirmationDialog.visible}
            message={this.state.confirmationDialog.message}
            onConfirm={(e) => this.state.confirmationDialog.onConfirm(e)}
            onCancel={(e) => this.state.confirmationDialog.onCancel(e)}
          />
          <Modal
            isOpen={this.state.showExecutionModal}
            style={modalStyle}
            onRequestClose={this.closeExecutionModal.bind(this)}
            contentLabel="Replica Execution Options"
          >
            <ReplicaExecutionOptions
              onCancel={this.closeExecutionModal.bind(this)}
              onExecute={this.executeReplica.bind(this)}
            />
          </Modal>
        </div>
      )
    } else {
      return (<div className={s.root}>
        <div className={s.container}>
          <LoadingIcon />
        </div>
      </div>)
    }
  }
}

export default withStyles(ReplicaView, s);
