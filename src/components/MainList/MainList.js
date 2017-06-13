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
import Config from '../Config';
import Moment from 'react-moment';
import s from './ConnectionsList.scss';
import AddCloudConnection from '../AddCloudConnection';
import Modal from 'react-modal';
import ConnectionsStore from '../../stores/ConnectionsStore';
import ConnectionsActions from '../../actions/ConnectionsActions';
import TextTruncate from 'react-text-truncate';
import UserIcon from '../UserIcon';
import FilteredTable from '../FilteredTable'


const title = 'Cloud Connections';
const connectionTypes = [
  { label: "All", type: "all" },
  { label: "Amazon", type: "amazon" },
  { label: "Azure", type: "azure" },
  { label: "Openstack", type: "openstack" },
  { label: "VMware", type: "vmware_vsphere" }
]

class MainList extends Reflux.Component {
  constructor(props) {
    super(props)
    this.store = ConnectionsStore

    this.state = {
      showModal: false,
      queryText: '',
      filterType: 'all',
      searchMin: true,
      connections: null
    }
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  componentWillMount() {
    super.componentWillMount.call(this)

    this.context.onSetTitle(title);
    if (this.state.connections == null) {
      ConnectionsActions.loadConnections()
    }
  }

  connectionsSelected() {
    let count = 0,
        total = 0
    if (this.state.connections) {
      this.state.connections.forEach((item) => {
        if (item.selected) count++
      })
      total = this.state.connections.length
    }

    return `${count} of ${total} connection(s) selected`;
  }

  connectionDetail(e, item) {
    Location.push('/cloud-endpoints/' + item.id + "/")
  }

  checkItem(e, itemRef) {
    let items = this.state.connections
    items.forEach((item) => {
      if (item == itemRef) {
        item.selected = !item.selected
      }
    })
    this.setState({ connections: items })
  }

  filterFn(item, queryText, filterType) {
    return (
      item.name.toLowerCase().indexOf(queryText.toLowerCase()) != -1 &&
      (filterType == "all" || filterType == item.type)
    )
  }

  searchItem(queryText) {
    this.setState({ queryText: queryText.target.value })
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
        let selectedConnections = this.state.connections.filter((connection) => connection.selected)
        selectedConnections.forEach(connection => {
          ConnectionsActions.deleteConnection(connection)
        })
        break;
    }
  }

  renderSearch(items) {
    let output = null
    if (items && items.length) {
      output = items.map((item, index) => (
        <div className="item" key={"vm_" + index}>
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
          <span className="cell cell-icon" onClick={(e) => this.connectionDetail(e, item)}>
              <span className="details">
                {item.name}
                <span className={s.description}>{item.description == "" ? "N/A" : item.description}</span>
              </span>
            </span>
          <span className="cell">
              <div className={s.cloudImage + " icon small-cloud " + item.type}></div>
            </span>
          <span className={"cell " + s.composite}>
              <span className={s.label}>Created</span>
              <span className={s.value}>
                <Moment fromNow ago date={item.created_at}/> ago
              </span>
            </span>
          <span className={"cell " + s.composite}>
              <span className={s.label}>URL</span>
              <span className={s.value}>
                <TextTruncate line={1} truncateText="..." text={item.connection_info.secret_ref}/>
              </span>
            </span>
        </div>
      ), this)
    }
    return output
  }

  onProjectChange(project) {
    this.setState({ currentProject: project.value })
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
                <button onClick={(e) => this.showNewConnectionModal(e)}>New Connection</button>
                <UserIcon />
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
              <div className={s.bulkActions}>
                <div className={s.connectionsCount}>
                  {this.connectionsSelected()}
                </div>
                <Dropdown
                  options={Config.connectionsActions}
                  placeholder="Select"
                  onChange={(e) => this.bulkActions(e)}
                />
              </div>
            </div>
          </div>
          <div className={s.pageContent}>
            <FilteredTable
              items={this.state.connections}
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
      </div>
    );
  }

}

export default withStyles(MainList, s);
