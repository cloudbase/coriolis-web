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
/* eslint-disable */

import React, { Component, PropTypes } from 'react';
import s from './TextBox.scss';

class TextBox extends Component {

  static propTypes = {
    maxLines: PropTypes.number,
  };

  static defaultProps = {
    maxLines: 1,
  };

  componentDidMount() {

  }

  render() {
    return (
      <div className={s.root}>
        {
          this.props.maxLines > 1 ?
            <textarea
              {...this.props}
              className={s.input}
              ref="input"
              key="input"
              rows={this.props.maxLines}
            /> :
            <input
              {...this.props}
              className={s.input}
              ref="input"
              key="input"
            />
        }
      </div>
    );
  }

}

export default TextBox;
