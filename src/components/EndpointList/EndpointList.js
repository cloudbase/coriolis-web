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
import Moment from 'react-moment';
import s from './EndpointList.scss';
import AddCloudConnection from '../AddCloudConnection';
import Modal from 'react-modal';
import ConnectionsStore from '../../stores/ConnectionsStore';
import ConnectionsActions from '../../actions/ConnectionsActions';
import TextTruncate from 'react-text-truncate';
import UserIcon from '../UserIcon';
import EndpointUsage from '../EndpointUsage';
import NotificationIcon from '../NotificationIcon';
import ProjectsDropdown from '../ProjectsDropdown';
import MainList from '../MainList';
import Helper from '../Helper';


const title = 'Cloud Endpoints';
const connectionActions = {
  delete_action: {
    label: "Delete",
    action: (item) => {
      ConnectionsActions.deleteConnection(item)
    },
    confirm: true
  }
}

const filters = [
  {
    field: "type",
    options: [
      { value: null, label: "All" },
      { value: "opc", label: "Oracle Cloud" },
      { value: "oracle_vm", label: "Oracle VM Server" },
      { value: "openstack", label: "Openstack" },
      { value: "vmware_vsphere", label: "VMware" }
    ]
  }
]

class EndpointList extends Reflux.Component {

  constructor(props) {
    super(props)
    this.store = ConnectionsStore

    this.state = {
      showModal: false,
      connections: null
    }

    this.renderItem = this.renderItem.bind(this)
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

  connectionDetail(e, item) {
    Location.push('/cloud-endpoints/' + item.id + "/")
  }

  refresh() {
    ConnectionsActions.loadConnections()
  }

  showNewConnectionModal() {
    this.setState({ showModal: true })
  }

  closeModal() {
    this.setState({ showModal: false })
  }

  renderItem(item) {
    let createdAt = Helper.getTimeObject(item.created_at)
    return (
      <div className={"item " + (item.selected ? " selected" : "")} key={"vm_" + item.id}>
        <span className="cell cell-icon" onClick={(e) => this.connectionDetail(e, item)}>
          <div className={"icon endpoint"}></div>
          <span className="details">
            <TextTruncate line={1} truncateText="..." text={item.name} />
            <span className={s.description}>{item.description == "" ? "N/A" : item.description}</span>
          </span>
        </span>
        <span className="cell">
          <div className={s.cloudImage + " icon small-cloud " + item.type}></div>
        </span>
        <span className={"cell " + s.composite}>
          <span className={s.label}>Created</span>
          <span className={s.value}>
            <Moment fromNow ago date={createdAt} /> ago
          </span>
        </span>
        <span className={"cell " + s.composite}>
          <span className={s.label}>Usage</span>
          <span className={s.value}>
            <EndpointUsage connectionId={item.id} />
          </span>
        </span>
      </div>
    )
  }

  render() {
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
                <button onClick={(e) => this.showNewConnectionModal(e)}>New</button>
                <UserIcon />
                <NotificationIcon />
              </div>
            </div>
          </div>
          <MainList
            items={this.state.connections}
            actions={connectionActions}
            itemName="connection"
            renderItem={this.renderItem}
            filters={filters}
            refresh={this.refresh}
          />
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

export default withStyles(EndpointList, s);
