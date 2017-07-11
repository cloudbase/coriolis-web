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
import Dropdown from '../NewDropdown';
import UserIcon from '../UserIcon';
import NotificationIcon from '../NotificationIcon';
import SearchBox from '../SearchBox';
import Moment from 'react-moment';
import s from './MigrationList.scss';
import MigrationStore from '../../stores/MigrationStore';
import ProjectStore from '../../stores/MigrationStore';
import MigrationActions from '../../actions/MigrationActions';
import FilteredTable from '../FilteredTable';
import TextTruncate from 'react-text-truncate';
import LoadingIcon from "../LoadingIcon/LoadingIcon";
import ConfirmationDialog from '../ConfirmationDialog'
import ProjectsDropdown from '../ProjectsDropdown';

const title = 'Migrations';
const migrationTypes = [
  { label: "Replicas", type: "replica" },
  { label: "Migrations", type: "migration" },
  { label: "All", type: "all" }
]
const statusTypes = [
  { label: "Running", type: "RUNNING" },
  { label: "Error", type: "ERROR" },
  { label: "Completed", type: "COMPLETED" },
  { label: "All", type: "all" }
]
const migrationActions = [
  { label: "Execute", value: "execute" },
  { label: "Cancel", value: "cancel" },
  { label: "Delete", value: "delete" }
]

class MigrationList extends Reflux.Component {
  constructor(props) {
    super(props)
    this.store = MigrationStore;

    this.state = {
      title: props.type == "migrations" ? "Migrations" : "Replicas",
      queryText: '',
      filterType: props.type == "migrations" ? "migration" : "replica",
      filterStatus: "all",
      currentProject: "My Project",
      searchMin: true,
      filteredData: [],
      selectedAll: {
        migration: false,
        replica: false
      },
      confirmationDialog: {
        visible: false,
        message: "Are you sure?",
        onConfirm: null,
        onCancel: null
      }
    }
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillReceiveProps(newProps, oldProps) {
    this.setState({
      title: newProps.type == "migrations" ? "Migrations" : "Replicas",
      filterType: newProps.type == "migrations" ? "migration" : "replica"
    })
  }

  componentWillMount() {
    super.componentWillMount.call(this)

    this.context.onSetTitle(this.state.title);

    MigrationActions.loadMigrations()

    this.projects = [
      { label: "My Project", value: "Project1" },
      { label: "Project 2", value: "Project2" }
    ]
  }

  componentDidMount() {
    this.setState({ filteredData: this.state.migrations }) // eslint-disable-line react/no-did-mount-set-state
  }

  newMigration() {
    Location.push('/migrations/new')
  }

  migrationsSelected() {
    let count = 0
    let total = 0
    if (this.state.migrations) {
      count = this.migrationsSelectedCount()
      if (this.state.filterType == "all") {
        total = this.state.migrations.length
      } else {
        this.state.migrations.forEach(item => {
          if (item.type == this.state.filterType) {
            total++
          }
        })
      }
    }
    let term = "migration"
    if (this.state.filterType == "replica") term = "replica"

    return `${count} of ${total} ${term}(s) selected`;
  }

  migrationsSelectedCount() {
    let count = 0
    if (this.state.migrations) {
      this.state.migrations.forEach((item) => {
        if (item.selected) {
          if (this.state.filterType == "all") {
            count++
          } else {
            if (item.type == this.state.filterType && item.selected) {
              count++
            }
          }
        }
      })
    }
    return count
  }

  migrationDetail(e, item) {
    if (item.type == "migration") {
      Location.push('/migration/' + item.id + "/")
    } else {
      Location.push('/replica/' + item.id + "/")
    }

  }

  checkItem(e, itemRef) {
    let items = this.state.migrations

    items.forEach((item) => {
      if (item == itemRef) {
        item.selected = !item.selected
      }
    })
    let selectedAll = this.state.selectedAll
    selectedAll[this.state.filterType] = false
    this.setState({ migrations: items, selectedAll: selectedAll })
  }

  checkAll(e) {
    let items = this.state.migrations
    let selectedAll = this.state.selectedAll

    items.forEach((item) => {
      if (item.type == this.state.filterType) {
        item.selected = !selectedAll[this.state.filterType]
      }
    })
    selectedAll[this.state.filterType] = !selectedAll[this.state.filterType]
    this.setState({ migrations: items, selectedAll: selectedAll })
  }

  searchItem(queryText) {
    if (queryText.target) {
      this.setState({queryText: queryText.target.value })
    } else {
      this.setState({queryText: queryText })
    }
  }

  filterType(e, type) {
    this.setState({ filterType: type }, () => {
      this.searchItem({ target: { value: this.state.queryText } })
    })
  }

  filterStatus(e, status) {
    this.setState({ filterStatus: status }, () => {
      this.searchItem({ target: { value: this.state.queryText } })
    })
  }

  filterFn(item, queryText, filterType, filterStatus) {
    return (
      item.name.toLowerCase().indexOf(queryText.toLowerCase()) != -1 &&
      (filterType == "all" || filterType == item.type) &&
      (filterStatus == "all" || filterStatus == item.status)
    )
  }

  renderSearch(items) {
    if (items) {
      let output = items.map((item, index) => {
        let count = 0

        if (item.type == 'replica' && item.executions.length) {
          item.tasks = item.executions[item.executions.length - 1].tasks
        }
        if (!item.tasks) {
          item.tasks = []
        }
        item.tasks.forEach((task) => {
          if (task.status != "COMPLETED") count++
        })


        let tasksRemaining = count + " out of " + item.tasks.length

        return (
          <div className={"item " + (item.selected ? "selected" : "")} key={"vm_" + index}>
            <div className="checkbox-container">
              <input
                id={"vm_check_" + index}
                type="checkbox"
                checked={item.selected}
                onChange={(e) => this.checkItem(e, item)}
                className="checkbox-normal"
              />
              <label htmlFor={"vm_check_" + index}></label>
            </div>
            <span className="cell cell-icon" onClick={(e) => this.migrationDetail(e, item)}>
              <div className={"icon " + item.type}></div>
              <span className="details">
                {/*{item.name ? item.name : "N/A"}*/}
                <TextTruncate line={1} truncateText="..." text={item.name} />
                <span className={s.migrationStatus + " status-pill " + item.status}>{item.status}</span>
              </span>
            </span>
            <span className="cell" onClick={(e) => this.migrationDetail(e, item)}>
              <div className={s.cloudImage + " icon small-cloud " + item.origin_endpoint_type}></div>
              <span className={s.chevronRight}></span>
              <div className={s.cloudImage + " icon small-cloud " + item.destination_endpoint_type}></div>
            </span>
            <span className={"cell " + s.composite} onClick={(e) => this.migrationDetail(e, item)}>
              <span className={s.label}>Created</span>
              <span className={s.value}>
                <Moment format="MMM Do YYYY HH:ss" date={item.created_at} />
              </span>
            </span>
            {/*<span className={"cell " + s.composite} onClick={(e) => this.migrationDetail(e, item)}>
              <span className={s.label}>Notes</span>
              <TextTruncate line={2} truncateText="..." text={item.notes} />
            </span>*/}
            <span className={"cell " + s.composite} onClick={(e) => this.migrationDetail(e, item)}>
              <span className={s.label}>Tasks remaining</span>
              <span className={s.value}>{tasksRemaining}</span>
            </span>
            {/*<span className={"cell " + s.composite}>
              <span className={s.label}>Current instance</span>
              <span className={s.value}>{this.currentInstance(item)}</span>
            </span>*/}
          </div>
        )
      })
      return output
    } else {
      return (<div className="no-results">Your search returned no results</div>)
    }
  }

  onProjectChange(project) {
    // TODO: Move setstate from here
    //this.setState({ currentProject: project.value })
  }

  onMigrationActionChange(option) {
    switch (option.value) {
      case "delete":
        let deletedItems = [] // we put here the items for deletion
        this.state.migrations.forEach((item) => {
          if (item.selected) {
            if (this.state.filterType == "all") {
              deletedItems.push(item)
            } else {
              if (item.type == this.state.filterType) {
                deletedItems.push(item)
              }
            }
          }
        })
        this.setState({
          confirmationDialog: {
            visible: true,
            onConfirm: () => {
              this.setState({ confirmationDialog: { visible: false }})
              deletedItems.forEach(item => {
                MigrationActions.deleteMigration(item)
              })
            },
            onCancel: () => {
              this.setState({ confirmationDialog: { visible: false }})
            }
          }
        })
        break
      case "execute":
        this.state.migrations.forEach((item) => {
          if (item.selected) {
            if (this.state.filterType == "all") {
              MigrationActions.executeReplica(item)
            } else {
              if (item.type == this.state.filterType) {
                MigrationActions.executeReplica(item)
              }
            }

          }
        })
        break
      case "cancel":
        this.state.migrations.forEach((item) => {
          if (item.selected) {
            if (this.state.filterType == "all") {
              MigrationActions.cancelMigration(item)
            } else {
              if (item.type == this.state.filterType) {
                MigrationActions.cancelMigration(item)
              }
            }
          }
        })
        break
      default:
        break
    }
  }

  currentInstance(migration) {
    let instance = "N/A"
    /*migration.vms.forEach((item) => {
      if (item.selected) {
        instance = item.name
      }
    })*/
    return instance
  }

  refreshList() {
    MigrationActions.loadMigrations()
  }

  render() {
    let _this = this
    let itemStates = statusTypes.map((state, index) => (
        <a
          className={_this.state.filterStatus == state.type || (_this.state.filterStatus == null && state.type == "all") ?
            "selected" : ""}
          onClick={(e) => _this.filterStatus(e, state.type)} key={"status_" + index}
        >{state.label}</a>
      )
    )
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.pageHeader}>
            <div className={s.top}>
              <h1>Coriolis {this.state.title}</h1>
              <div className={s.topActions}>
                {/*<Dropdown
                  options={this.projects}
                  onChange={(e) => this.onProjectChange(e)}
                  placeholder="Select"
                  value={this.state.currentProject}
                />*/}
                <ProjectsDropdown />
                <button onClick={this.newMigration}>New</button>
                <UserIcon />
                <NotificationIcon />
              </div>
            </div>
            <div className="filters">
              <div className="checkbox-container">
                <input
                  id={"vm_check_all"}
                  type="checkbox"
                  checked={this.state.selectedAll[this.state.filterType]}
                  onChange={(e) => this.checkAll()}
                  className="checkbox-normal"
                />
                <label htmlFor={"vm_check_all"}></label>
              </div>
              <div className="category-filter">
                {itemStates}
              </div>
              <div className={s.refreshBtn}>
                <div className="icon refresh" onClick={this.refreshList}></div>
              </div>
              <div className="name-filter">
                <SearchBox
                  placeholder="Search"
                  value={this.state.queryText}
                  onChange={(e) => this.searchItem(e)}
                  minimize={true} // eslint-disable-line react/jsx-boolean-value
                  onClick={(e) => this.toggleSearch(e)}
                  className={"searchBox " + (this.state.searchMin ? "minimize" : "")}
                />
              </div>
              <div className={s.bulkActions + (this.migrationsSelectedCount() === 0 ? " invisible": "")}>
                <div className={s.migrationsCount}>
                  {this.migrationsSelected()}
                </div>
                <Dropdown
                  options={migrationActions}
                  onChange={(e) => this.onMigrationActionChange(e)}
                  placeholder="More Actions"
                />
              </div>
            </div>
          </div>
          <div className={s.pageContent}>
            <FilteredTable
              items={this.state.migrations}
              filterFn={this.filterFn}
              queryText={this.state.queryText}
              filterType={this.state.filterType}
              filterStatus={this.state.filterStatus}
              renderSearch={(e) => this.renderSearch(e)}
            ></FilteredTable>
          </div>
        </div>
        <ConfirmationDialog
          visible={this.state.confirmationDialog.visible}
          message={this.state.confirmationDialog.message}
          onConfirm={(e) => this.state.confirmationDialog.onConfirm(e)}
          onCancel={(e) => this.state.confirmationDialog.onCancel(e)}
        />
      </div>
    );
  }

}

export default withStyles(MigrationList, s);
