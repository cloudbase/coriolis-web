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
import s from './ProjectList.scss';
import UserStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';
import TextTruncate from 'react-text-truncate';
import UserIcon from '../UserIcon';
import NotificationIcon from '../NotificationIcon';
import ProjectsDropdown from '../ProjectsDropdown';
import MainList from '../MainList';

const title = 'Projects';

const projectActions = null
/* {
  delete_action: {
    label: "Delete",
    action: (item) => {
      console.log("Delete project action needed here")
    },
    confirm: true
  }
}
*/
class ProjectList extends Reflux.Component {
  filters = [
    {
      field: "enabled",
      options: [
        { value: null, label: "All"},
        { value: true, label: "Enabled"},
        { value: false, label: "Disabled"}
      ]
    },
    {
      field: "is_domain",
      options: [
        { value: null, label: "All"},
        { value: true, label: "Is Domain"},
        { value: false, label: "Is Not Domain"}
      ]
    }
  ]

  constructor(props) {
    super(props)

    this.store = UserStore

    this.state = {
      currentUser: {
        projects: null
      }
    }

    this.renderItem = this.renderItem.bind(this)
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  componentWillMount() {
    super.componentWillMount.call(this)

    this.context.onSetTitle(title);
    UserActions.getScopedProjects()
  }

  projectDetail(item) {
    Location.push('/project/details/' + item.id + "/")
  }

  switchProject(project) {
    UserActions.switchProject(project.id)
  }

  renderItem(item) {
    let projectId = Reflux.GlobalState.userStore.currentUser.project.id
    return (
      <div className={"item"} key={"project_" + item.id}>
        <span className="cell cell-icon" onClick={() => this.projectDetail(item)}>
          <div className={"icon project"}></div>
          <span className="details">
            <TextTruncate line={1} truncateText="..." text={item.name} />
            <span className={s.description}>{item.description == "" ? "N/A" : item.description}</span>
          </span>
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
        <span className={"cell "}>
          <button
            className="wire gray"
            disabled={item.id == projectId}
            onClick={(e) => this.switchProject(item)}
          >{item.id == projectId ? "Current" : "Switch"}</button>
        </span>
      </div>
    )
  }

  render() {
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
          </div>
          <MainList
            items={this.state.currentUser.projects}
            actions={projectActions}
            itemName="project"
            renderItem={this.renderItem}
            filters={this.filters}
          />
        </div>
      </div>
    );
  }

}

export default withStyles(ProjectList, s);
