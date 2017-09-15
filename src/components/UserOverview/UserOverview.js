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
import s from './UserOverview.scss';
import Moment from 'react-moment';
import UserStore from '../../stores/UserStore';
import Modal from 'react-modal';
import EditProfile from '../EditProfile';

const title = 'User Overview';

class UserOverview extends Reflux.Component {
  constructor(props) {
    super(props)
    this.store = UserStore

    this.state = {
      showModal: false
    }
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  componentWillMount() {
    super.componentWillMount.call(this)
    this.context.onSetTitle(title);
  }

  handleChangeNotifications() {

  }

  closeModal() {
    this.setState({ showModal: false })
  }

  openModal() {
    this.setState({ showModal: true })
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
        top: "20%",
        marginLeft: "-288px"
      }
    }

    let item = this.state.currentUser
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.columnLeft}>
            <div className={s.formGroup}>
              <div className={s.title}>
                Name
              </div>
              <div className={s.value}>
                {item.name}
              </div>
            </div>
            <div className={s.formGroup}>
              <div className={s.title}>
                Member Since
              </div>
              <div className={s.value}>
                <Moment format="MM/DD/YYYY HH:MM" date={item.created} />
              </div>
            </div>
            <div className={s.formGroup}>
              <button className="gray" onClick={(e) => this.openModal(e)}>Edit Profile</button>
            </div>
            {/* <div className={s.formGroup}>
              <div className={s.title}>
                Project Membership (4)
              </div>
              <div className={s.value}>
                My_Project, PRO-1, Coriolis-test, lala-land
                <br /> <br />
                <button className="gray">Edit Project Membership</button>
              </div>
            </div>*/}
          </div>
          <div className={s.columnRight}>
            <div className={s.formGroup}>
              <div className={s.title}>
                Email
              </div>
              <div className={s.value}>
                {item.email}
              </div>
            </div>
           {/* <div className={s.formGroup}>
              <div className={s.title}>
                Email Notifications
              </div>
              <div className={s.value}>
                <label className={s.notificationsSwitch}>
                  <input
                    type="checkbox"
                    checked={this.state.currentUser.settings.notifications}
                    className="ios-switch migrationType tinyswitch"
                    onChange={(e) => this.handleChangeNotifications(e)}
                  />
                  <div><div></div></div>
                </label> Receive notifications
              </div>
            </div>*/}
            {/* <div className={s.formGroup}>
              <button className="wire">Edit Login Methods</button>
            </div>*/}
          </div>
        </div>
        <Modal
          isOpen={this.state.showModal}
          contentLabel="Edit Profile"
          style={modalStyle}
          onRequestClose={this.closeModal.bind(this)}
        >
          <EditProfile
            closeHandle={(e) => this.closeModal(e)}
            user={this.state.currentUser}
          />
        </Modal>
      </div>
    );
  }

}

export default withStyles(UserOverview, s);
