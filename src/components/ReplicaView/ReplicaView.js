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
  }

  executeReplica() {
    this.setState({ isBeingExecuted: true })
    let item = this.state.replicas.filter(replica => replica.id == this.props.replicaId)[0]
    MigrationActions.executeReplica(item, () => {
      this.setState({ isBeingExecuted: false })
    }, () => {
      this.setState({ isBeingExecuted: false })
    })
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
        MigrationActions.executeReplica(item)
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
                    onClick={(e) => this.executeReplica(e)}
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
