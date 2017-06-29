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
import s from './Project.scss';
import UserStore from '../../stores/UserStore';
import Header from '../Header';
import ConfirmationDialog from '../ConfirmationDialog';
import LoadingIcon from '../LoadingIcon';
import Location from '../../core/Location';

class Project extends Reflux.Component {
  title = ""
  constructor(props) {
    super(props)
    this.store = UserStore

    this.state = {
      connection: {
        name: null,
        cloudName: null,
        id: null
      }
    }
  }

  static propTypes = {
    type: PropTypes.string,

  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  componentWillMount() {
    super.componentWillMount.call(this)
  }

  componentDidMount() {
    this.context.onSetTitle(this.title);
  }

  deleteProject() {

  }

  goBack() {
    Location.push("/projects")
  }

  render() {
    let item = null
    if (this.state.currentUser && this.state.currentUser.projects) {
      this.state.currentUser.projects.forEach(project => {
        if (project.id == this.props.projectId) {
          item = project
        }
      })
    }
    if (item) {
      return (
        <div className={s.root}>
          <Header linkUrl="/projects"/>
          <div className={s.projectHead + " detailViewHead"}>
            <div className={s.container}>
              <div className="backBtn" onClick={(e) => this.goBack(e)}></div>
              <div className={s.connectionTypeImg + " icon project-large"}></div>
              <div className={s.connectionInfo}>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
              </div>
            </div>
          </div>
          <div className={s.container}>
            <div className={s.sidebar}>

            </div>
            <div className={s.content}>
              {React.cloneElement(this.props.children, {
                projects: this.state.currentUser ? this.state.currentUser.projects : null,
                projectId: this.props.projectId })}
            </div>
          </div>
          {/*<ConfirmationDialog
            visible={this.state.confirmationDialog.visible}
            message={this.state.confirmationDialog.message}
            onConfirm={(e) => this.state.confirmationDialog.onConfirm(e)}
            onCancel={(e) => this.state.confirmationDialog.onCancel(e)}
          />*/}
        </div>
      );
    } else {
      return (
        <div className={s.root}>
          <LoadingIcon />
        </div>
      );
    }

  }

}

export default withStyles(Project, s);
