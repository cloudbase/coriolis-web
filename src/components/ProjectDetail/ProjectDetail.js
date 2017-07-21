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
import s from './ProjectDetail.scss';
import LoadingIcon from '../LoadingIcon';

const title = 'connection details';

class CloudConnectionDetail extends Component {
  static propTypes = {
    projects: PropTypes.array,
    projectId: PropTypes.string
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props)
    this.state = {
      project: null
    }
  }

  componentWillMount() {
    this.context.onSetTitle(title);
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(props) {
    let project = null
    if (props.projects) {
      props.projects.forEach(item => {
        if (item.id == props.projectId) {
          project = item
        }
      })
    }

    this.setState({ project: project })
  }

  render() {
    let item = this.state.project
    if (item) {
      return (
        <div className={s.root}>
          <div className={s.container}>
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
                Description
              </div>
              <div className={s.value}>
                {item.description == "" ? "-" : item.description}
              </div>
            </div>
            <div className={s.formGroup}>
              <div className={s.title}>
                Enabled
              </div>
              <div className={s.value}>
                {item.enabled ? "Yes" : "No"}
              </div>
            </div>
            <div className={s.formGroup}>
              <div className={s.title}>
                Is Domain
              </div>
              <div className={s.value}>
                {item.is_domain ? "Yes" : "No"}
              </div>
            </div>
          </div>
          <div className={s.buttons}>
            <div className={s.leftSide}>
              <button onClick={(e) => this.showEditConnectionModal(e)} className="gray" disabled>Edit Project</button>
            </div>
            <div className={s.rightSide}>
              <button onClick={(e) => this.deleteProject(e)} className="wire">Delete</button>
            </div>
          </div>
        </div>
      )
    } else {
      return (<div className={s.root}>
        <div className={s.container}>
          <LoadingIcon />
        </div>
      </div>)
    }
  }

}

export default withStyles(CloudConnectionDetail, s);
