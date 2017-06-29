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
import SearchBox from '../SearchBox';
import s from './ProjectList.scss';
import AddCloudConnection from '../AddCloudConnection';
import Modal from 'react-modal';
import UserStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';
import TextTruncate from 'react-text-truncate';
import UserIcon from '../UserIcon';
import FilteredTable from '../FilteredTable';
import NotificationIcon from '../NotificationIcon';
import ConfirmationDialog from '../ConfirmationDialog'
import ProjectsDropdown from '../ProjectsDropdown';


const title = 'Projects';
const connectionTypes = [
  { label: "All", type: "all" }
]

const connectionActions = [
  { label: "Delete", value: "delete" }
]

class ProjectList extends Reflux.Component {
  constructor(props) {
    super(props)

    this.store = UserStore

    this.state = {
      showModal: false,
      queryText: '',
      filterType: 'all',
      searchMin: true,
      projects: null,
      confirmationDialog: {
        visible: false,
        message: "Are you sure?",
        onConfirm: null,
        onCancel: null
      }
    }
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  componentWillMount() {
    super.componentWillMount.call(this)

    this.context.onSetTitle(title);
    UserActions.getScopedProjects()
  }

  projectsSelected() {
    let count = this.projectsSelectedCount(),
        total = 0
    if (this.state.currentUser.projects) {
      total = this.state.currentUser.projects.length
    }

    return `${count} of ${total} project(s) selected`;
  }

  projectsSelectedCount() {
    let count = 0
    if (this.state.currentUser.projects) {
      this.state.currentUser.projects.forEach((item) => {
        if (item.selected) count++
      })
    }
    return count
  }

  projectDetail(e, item) {
    Location.push('/project/details/' + item.id + "/")
  }

  checkItem(e, itemRef) {
    let items = this.state.currentUser.projects
    items.forEach((item) => {
      if (item == itemRef) {
        item.selected = !item.selected
      }
    })
    this.setState({ projects: items })
  }

  filterFn(item, queryText, filterType) {
    return (
      item.name.toLowerCase().indexOf(queryText.toLowerCase()) != -1 &&
      (filterType == "all" || filterType == item.type)
    )
  }

  searchItem(queryText) {
    this.setState({ queryText: queryText })
  }

  filterType(e, type) {
    this.setState({ filterType: type })
  }

  closeModal() {
    this.setState({ showModal: false })
  }

  bulkActions(action) {
    switch (action.value) {
      case "delete":
        this.setState({
          confirmationDialog: {
            visible: true,
            onConfirm: () => {
              this.setState({ confirmationDialog: { visible: false }})
              let selectedProjects = this.state.currentUser.projects.filter((connection) => connection.selected)
              selectedProjects.forEach(project => {
                // TODO: Delete project action here
              })
            },
            onCancel: () => {
              this.setState({ confirmationDialog: { visible: false }})
            }
          }
        })

        break;
    }
  }

  renderSearch(items) {
    let output = null
    if (items && items.length) {
      output = items.map((item, index) => (
        <div className={"item " + (item.selected ? " selected" : "")} key={"vm_" + index}>
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
          <span className="cell cell-icon" onClick={(e) => this.projectDetail(e, item)}>
            <div className={"icon project"}></div>
            <span className="details">
              {/*{item.name ? item.name : "N/A"}*/}
              <TextTruncate line={1} truncateText="..." text={item.name} />
              <span className={s.description}>{item.description == "" ? "N/A" : item.description}</span>
            </span>
          </span>
          <span className="cell">
              <div className={s.cloudImage + " icon small-cloud " + item.type}></div>
            </span>
          <span className={"cell " + s.composite}>
              <span className={s.label}>Is Domain</span>
              <span className={s.value}>
                {item.is_domain ? "Yes" : "No"}
              </span>
            </span>
          <span className={"cell " + s.composite}>
              <span className={s.label}>Enabled</span>
              <span className={s.value}>
                {item.enabled ? "Yes" : "No"}
              </span>
            </span>
        </div>
      ), this)
    }
    return output
  }
  
  currentInstance(migration) {
    let instance = "N/A"
    migration.vms.forEach((item) => {
      if (item.selected) {
        instance = item.name
      }
    })
    return instance
  }

  showNewConnectionModal() {
    this.setState({ showModal: true })
  }

  render() {
    let itemStates = connectionTypes.map((state, index) => (
        <a
          className={this.state.filterType == state.type || (this.state.filterType == null && state.type == "all") ?
            "selected" : ""}
          onClick={(e) => this.filterType(e, state.type)} key={"status_" + index}
        >{state.label}</a>
      ), this)

    let modalStyle = {
      content: {
        padding: "0px",
        borderRadius: "4px",
        bottom: "auto",
        width: "576px",
        height: "auto",
        left: "50%",
        top: "70px",
        marginLeft: "-288px"
      }
    }

    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.pageHeader}>
            <div className={s.top}>
              <h1>{title}</h1>
              <div className={s.topActions}>
                <ProjectsDropdown />
                <button disabled onClick={(e) => this.showNewConnectionModal(e)}>New</button>
                <UserIcon />
                <NotificationIcon />
              </div>
            </div>
            <div className="filters">
              <div className="category-filter">
                {itemStates}
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
              <div className={s.bulkActions + (this.projectsSelectedCount() === 0 ? " invisible": "")}>
                <div className={s.projectsCount}>
                  {this.projectsSelected()}
                </div>
                <Dropdown
                  options={connectionActions}
                  placeholder="More Actions"
                  onChange={(e) => this.bulkActions(e)}
                />
              </div>
            </div>
          </div>
          <div className={s.pageContent}>
            <FilteredTable
              items={this.state.currentUser.projects}
              filterFn={this.filterFn}
              queryText={this.state.queryText}
              filterType={this.state.filterType}
              renderSearch={(e) => this.renderSearch(e)}
            ></FilteredTable>
          </div>
          <div className={s.pageFooter}>

          </div>
        </div>
        <Modal
          isOpen={this.state.showModal}
          contentLabel="Add new cloud connection"
          style={modalStyle}
        >
          <AddCloudConnection
            closeHandle={(e) => this.closeModal(e)}
            addHandle={(e) => this.closeModal(e)}
          />
        </Modal>
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

export default withStyles(ProjectList, s);
