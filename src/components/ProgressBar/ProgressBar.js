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
import s from './ProgressBar.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';


class ProgressBar extends Component {

  static propTypes = {
    progress: PropTypes.number
  }

  static defaultProps = {
    progress: 0
  }

  render() {
    let progressBarStyle = {
      width: this.props.progress + "%"
    }
    return <div className={s.root}>
      <div className={s.outer}>
        <div className={s.inner + " " + (this.props.progress == 100 ? s.completed : "")} style={progressBarStyle} />
      </div>
    </div>
  }

}

export default withStyles(ProgressBar, s);
