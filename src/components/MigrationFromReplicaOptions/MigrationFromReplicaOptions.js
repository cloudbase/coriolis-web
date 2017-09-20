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
/* eslint-disable dot-notation */

import React, { PropTypes } from 'react';
import Reflux from 'reflux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MigrationFromReplicaOptions.scss';
import Dropdown from '../NewDropdown';
import Helper from "../Helper";

class MigrationFromReplicaOptions extends Reflux.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onMigrate: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      fields: [
        {
          field: 'clone_disks',
          type: 'boolean'
        },
        {
          field: 'force',
          type: 'boolean'
        },
        {
          field: 'skip_os_morphing',
          type: 'boolean'
        }
      ]
    }
  }

  componentWillMount() {
    super.componentWillMount.call(this)
  }

  componentWillUnmount() {
    super.componentWillMount.call(this)
  }

  fieldChange(e, field) {
    let fields = this.state.fields.concat([]);
    fields.find(f => f.field === field).value = e.value === 'true'
    this.setState({ fields: fields })
  }

  render() {
    let booleanOptions = [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]

    let fields = this.state.fields.map((f, i) => {
      if (f.type !== 'boolean') {
        return null
      }

      return (
        <div className="form-group" key={i}>
          <label>{Helper.convertCloudFieldLabel(f.field)}</label>
          <Dropdown
            options={booleanOptions}
            onChange={(e) => { this.fieldChange(e, f.field) }}
            placeholder="Choose a value"
            value={f.value ? booleanOptions[0] : booleanOptions[1]}
          />
        </div>
      )
    })
    let modalBody = (
      <div className={s.container}>
        <div className={s.formContainer}>
          {fields}
        </div>
        <div className={s.buttons}>
          <button className="gray" onClick={() => this.props.onCancel()}>Cancel</button>
          <button onClick={() => this.props.onMigrate(this.state.fields)}>Migrate</button>
        </div>
      </div>
    )

    return (
      <div className={s.root}>
        <div className={s.header}>
          <h3>Create Migration from Replica</h3>
        </div>
        <div className={s.images}>
          <div className={s.replicaImage} />
          <div className={s.arrowImage} />
          <div className={s.migrationImage} />
        </div>
        {modalBody}
      </div>
    )
  }
}

export default withStyles(MigrationFromReplicaOptions, s)
