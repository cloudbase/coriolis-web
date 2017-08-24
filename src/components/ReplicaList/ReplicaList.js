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
import Location from '../../core/Location';
import UserIcon from '../UserIcon';
import NotificationIcon from '../NotificationIcon';
import Moment from 'react-moment';
import s from './ReplicaList.scss';
import MigrationStore from '../../stores/MigrationStore';
import MigrationActions from '../../actions/MigrationActions';
import TextTruncate from 'react-text-truncate';
import ProjectsDropdown from '../ProjectsDropdown';
import MainList from '../MainList';
import Helper from '../Helper';

const title = 'Coriolis Replicas';

const filters = [
  {
    field: "status",
    options: [
      { value: null, label: "All" },
      { value: "RUNNING", label: "Running" },
      { value: "ERROR", label: "Error" },
      { value: "COMPLETED", label: "Completed" }
    ]
  }
]

const replicaActions = {
  execute_action: {
    label: "Execute",
    action: (item) => {
      MigrationActions.executeReplica(item)
    },
    confirm: false
  },
  delete_action: {
    label: "Delete",
    action: (item) => {
      MigrationActions.deleteReplica(item)
    },
    confirm: true
  }
}

class ReplicaList extends Reflux.Component {
  constructor(props) {
    super(props)
    this.store = MigrationStore;

    this.state = {
      replicas: null
    }

    this.renderItem = this.renderItem.bind(this)
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    super.componentWillMount.call(this)

    this.context.onSetTitle(title);

    MigrationActions.loadReplicas()
  }

  newMigration() {
    Location.push('/replicas/new')
  }

  replicaDetail(e, item) {
    Location.push('/replica/' + item.id + "/")
  }

  renderItem(item) {
    let count = 0

    if (item.executions.length) {
      item.tasks = item.executions[item.executions.length - 1].tasks
    }
    if (!item.tasks) {
      item.tasks = []
    }
    item.tasks.forEach((task) => {
      if (task.status != "COMPLETED") count++
    })

    let tasksRemaining = count + " out of " + item.tasks.length

    if (count == 0) {
      tasksRemaining = "-"
    }

    let lastExecution = null
    if (item.executions.length) {
      lastExecution = Helper.getTimeObject(item.executions[item.executions.length - 1].created_at)
    }

    return (
      <div className={"item " + (item.selected ? "selected" : "")} key={"replica_" + item.id}>
        <span className="cell cell-icon" onClick={(e) => this.replicaDetail(e, item)}>
          <div className={"icon " + item.type}></div>
          <span className="details">
            <TextTruncate line={1} truncateText="..." text={item.name} />
            <span className={s.migrationStatus + " status-pill " + item.status}>{item.status}</span>
          </span>
        </span>
        <span className="cell" onClick={(e) => this.replicaDetail(e, item)}>
          <div className={s.cloudImage + " icon small-cloud " + item.origin_endpoint_type}></div>
          <span className={s.chevronRight}></span>
          <div className={s.cloudImage + " icon small-cloud " + item.destination_endpoint_type}></div>
        </span>
        <span className={"cell " + s.composite} onClick={(e) => this.replicaDetail(e, item)}>
          <span className={s.label}>Last execution</span>
          <span className={s.value}>
            {lastExecution ? <Moment format="MMM Do YYYY HH:mm" date={lastExecution} /> : "-"}
          </span>
        </span>
        <span className={"cell " + s.composite} onClick={(e) => this.replicaDetail(e, item)}>
          <span className={s.label}>Tasks remaining</span>
          <span className={s.value}>{tasksRemaining}</span>
        </span>
      </div>
    )
  }

  currentInstance() {
    return "N/A"
  }

  refreshList() {
    MigrationActions.loadReplicas()
  }

  render() {
    if ((this.state.replicas && this.state.replicas.length) || this.state.replicas == null) {
      return (
        <div className={s.root}>
          <div className={s.container}>
            <div className={s.pageHeader}>
              <div className={s.top}>
                <h1>{title}</h1>
                <div className={s.topActions}>
                  <ProjectsDropdown />
                  <button onClick={this.newMigration}>New</button>
                  <UserIcon />
                  <NotificationIcon />
                </div>
              </div>
            </div>
            <MainList
              items={this.state.replicas}
              actions={replicaActions}
              itemName="replica"
              renderItem={this.renderItem}
              filters={filters}
              refresh={this.refreshList}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className={s.root}>
          <div className={s.container}>
            <div className={s.pageHeader}>
              <div className={s.top}>
                <h1>{title}</h1>
                <div className={s.topActions}>
                  <ProjectsDropdown />
                  <button onClick={this.newMigration}>New</button>
                  <UserIcon />
                  <NotificationIcon />
                </div>
              </div>

              <div className="noResultsLarge">
                <span className="icon"></span>
                <h3>It seems that you don't have any Replica's in this project</h3>
                <p>The Coriolis Replica is obtained by replicating incrementally the<br />
                  virtual machines data from the source cloud endpoint to the target.
                </p>
                <button onClick={(e) => this.newMigration(e)}>Create a Replica</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default withStyles(ReplicaList, s);
