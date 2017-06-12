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
import s from './CloudConnectionAuth.scss';
import ConnectionsStore from '../../stores/ConnectionsStore';
import {defaultLabels} from '../../config'
import LoadingIcon from "../LoadingIcon/LoadingIcon";


const title = 'connection details';

class CloudConnectionAuth extends Component {
  static propTypes = {
    connection: PropTypes.object
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props)

    let fields = this.processProps(props)
    this.state = { fields: fields }
  }

  processProps(props) {
    let fields = []
    if (props.connection.credentials) {
      for (var fieldName in props.connection.credentials) {
        let value = props.connection.credentials[fieldName]
        if (value.value) { // if dropdown
          value = value.value
        }
        if (value === true) value = "Yes"
        if (value === false) value = "No"

        fields.push({
          fieldName: defaultLabels[fieldName] ? defaultLabels[fieldName] : fieldName,
          fieldValue: value
        })
      }
    }
    return fields
  }

  componentWillReceiveProps(newProps, oldProps) {

  }

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  renderFields() {
    if (this.state.fields.length) {
      return this.state.fields.map((field, index) => (
          <div className={s.formGroup} key={"formGroup_" + index}>
            <div className={s.title}>
              {field.fieldName}
            </div>
            <div className={s.value}>
              {field.fieldValue ? field.fieldValue : "-"}
            </div>
          </div>
        )
      )
    } else {
      return <LoadingIcon/>
    }
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          {this.renderFields()}
        </div>
        <button className="wire">Change Authentication</button>
      </div>
    );
  }

}

export default withStyles(CloudConnectionAuth, s);
