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
import Reflux from 'reflux';
import UserStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';
import Dropdown from '../NewDropdown';
import s from './ProjectsDropdown.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

class ProjectsDropdown extends Reflux.Component {

  constructor(props) {
    super(props)

    this.store = UserStore
  }

  componentWillMount() {
    super.componentWillMount.call(this)
  }

  switchProject(value) {
    UserActions.switchProject(value.value)
  }

  render() {
    let projects = this.state.currentUser.projects.map(project => {
      return { label: project.name, value: project.id }
    })

    let currentProject = null
    if (Reflux.GlobalState.userStore.currentUser.project) {
      currentProject = {
        label: Reflux.GlobalState.userStore.currentUser.project.name,
        value: Reflux.GlobalState.userStore.currentUser.project.id
      }
    }

    return <div className={s.root}>
      <Dropdown
        options={projects}
        placeholder="Switch Project"
        onChange={(e) => this.switchProject(e)}
        value={currentProject}
      />
    </div>
  }

}

export default withStyles(ProjectsDropdown, s);
