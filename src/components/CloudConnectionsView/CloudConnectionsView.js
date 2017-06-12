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
import s from './CloudConnectionsView.scss';
import Header from '../Header';
import ConnectionsActions from '../../actions/ConnectionsActions';
import Location from '../../core/Location';
import Link from '../Link';
import Dropdown from '../NewDropdown';
import LoadingIcon from '../LoadingIcon';
import Modal from 'react-modal';
import AddCloudConnection from '../AddCloudConnection';
import ConfirmationDialog from '../ConfirmationDialog'


class CloudConnectionsView extends Component {
  title = ""

  static propTypes = {
    connection: PropTypes.object,
    connectionId: PropTypes.string
  }

  static defaultProps = {
    connection: null
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props)
    this.state = {
      connection: {
        name: null,
        type: null,
        id: null
      },
      confirmationDialog: {
        visible: false,
        message: "Are you sure?",
        onConfirm: null,
        onCancel: null
      },
      showModal: false
    }
  }

  componentWillReceiveProps(newProps, oldProps) {
    if (newProps.connections) {
      let connection = newProps.connections.filter((connection => connection.id == this.props.connectionId))[0]

      this.setState({ connection: connection })
    }
  }

  componentDidMount() {
    this.context.onSetTitle(this.title);
  }

  onConnectionsActionsChange(option) {
    switch (option.value) {
      case "delete":
        ConnectionsActions.deleteConnection(this.state.connection)
        Location.push('/cloud-endpoints')
        break
      default:
        break
    }
  }

  showEditConnectionModal() {
    this.setState({ showModal: true })
  }

  deleteConnection() {
    this.setState({
      confirmationDialog: {
        visible: true,
        onConfirm: () => {
          this.setState({ confirmationDialog: { visible: false }})
          ConnectionsActions.deleteConnection(this.state.connection)
        },
        onCancel: () => {
          this.setState({ confirmationDialog: { visible: false }})
        }
      }
    })

  }

  closeModal() {
    this.setState({ showModal: false })
  }

  render() {
    let item = this.state.connection
    let title = "Edit Connection"

    let modalStyle = {
      content: {
        padding: "0px",
        borderRadius: "4px",
        bottom: "auto",
        width: "576px",
        height: "auto",
        left: "50%",
        top: "3%",
        marginLeft: "-288px"
      }
    }

    if (item) {
      return (
        <div className={s.root}>
          <Header title={title} linkUrl="/cloud-endpoints"/>
          <div className={s.connectionHead}>
            <div className={s.container}>
              <div className={s.connectionTypeImg + " icon small-cloud " + (item && item.type)}></div>
              <div className={s.connectionInfo}>
                <h2>{item.name}</h2>
              </div>
              <div className={s.connectionActions}>
                <button onClick={(e) => this.showEditConnectionModal(e)}>Edit</button>
                <button onClick={(e) => this.deleteConnection(e)} className="gray">Delete</button>
              </div>
            </div>
          </div>
          <div className={s.container}>
            <div className={s.sidebar}>
              <Link
                to={"/cloud-endpoints/" + item.id + "/"}
                className={this.props.type == 'detail' ? "active" : ""}
              >Overview</Link>
              <Link
                to={"/cloud-endpoints/auth/" + item.id + "/"}
                className={this.props.type == 'auth' ? "active" : ""}
              >Authentication</Link>
            </div>
            <div className={s.content}>
              {React.cloneElement(this.props.children, { connection: item })}
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
              connection={item}
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
    } else {
      return (
        <div className={s.root}>
          <Header title={title} linkUrl="/cloud-endpoints"/>
          <div className={s.container}>
            <LoadingIcon />
          </div>
        </div>)
    }

  }

}

export default withStyles(CloudConnectionsView, s);
