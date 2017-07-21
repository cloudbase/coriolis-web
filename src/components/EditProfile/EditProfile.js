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
import s from './EditProfile.scss';
import Dropdown from '../NewDropdown';
import NotificationActions from '../../actions/NotificationActions';
import UserActions from '../../actions/UserActions';

const title = 'Edit Profile';

class EditProfile extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  }
  static propTypes = {
    user: PropTypes.object,
    type: PropTypes.string,
    closeHandle: PropTypes.func
  }
  static defaultProps = {
    user: null,
    type: "edit"
  }

  constructor(props) {
    super(props)

    this.state = {
      firstName: props.user.firstName,
      lastName: props.user.lastName,
      email: props.user.email,
      primaryProject: null,
      requiredFields: [],
      formSubmitted: false
    }
  }

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  componentDidMount() {

  }

  handleChangeFirstName(e) {
    this.setState({ firstName: e.target.value })
  }

  handleChangeLastName(e) {
    this.setState({ lastName: e.target.value })
  }

  handleChangeEmail(e) {
    this.setState({ email: e.target.value })
  }

  handleSave() {
    UserActions.setUserInfo(this.props.user.id, {
      extra: {
        firstName: this.state.firstName,
        lastName: this.state.lastName
      },
      email: this.state.email
    })
    let valid = true

    for (let i in this.state.currentCloudData) {
      if (this.state.requiredFields.indexOf(i) > -1 && !this.state.currentCloudData[i]) {
        valid = false
      }
    }
    if (this.state.connectionName.trim().length == 0) {
      valid = false
    }
    if (!valid) {
      NotificationActions.notify("Please fill all required fields", "error")
      this.setState({ formSubmitted: true })
    } else {
      // TODO: Save action here
    }
  }

  isValid(field) {
    if (field.required && this.state.formSubmitted) {
      if (this.state.currentCloudData[field.name].length == 0) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  }

  handleCancel() {
    this.props.closeHandle();
  }

  render() {
    let projectOptions = []
    if (this.props.user) {
      projectOptions = this.props.user.projects.map(project => ({ label: project.name, id: project.id }))
    }

    return (
      <div className={s.root}>
        <div className={s.header}>
          <h3>{title}</h3>
        </div>
        <div className={s.container}>
          <div className={s.fields}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                placeholder="First Name"
                onChange={(e) => this.handleChangeFirstName(e)}
                value={this.state.firstName}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                placeholder="Last Name"
                onChange={(e) => this.handleChangeLastName(e)}
                value={this.state.lastName}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                placeholder="Email"
                onChange={(e) => this.handleChangeEmail(e)}
                value={this.state.email}
              />
            </div>
            <div className="form-group">
              <label>Main Project</label>
              <Dropdown
                options={projectOptions}
                placeholder="Switch Project"
                onChange={(e) => this.switchProject(e)}
                value={this.state.primaryProject}
              />
            </div>
          </div>
          <div className={s.buttons}>
            <button className={s.leftBtn + " gray"} onClick={(e) => this.handleCancel(e)}>Cancel</button>
            <button className={s.rightBtn} onClick={(e) => this.handleSave(e)}>Save</button>
          </div>
        </div>
      </div>
    );
  }

}

export default withStyles(EditProfile, s);
