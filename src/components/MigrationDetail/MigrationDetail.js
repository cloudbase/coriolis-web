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
import s from './MigrationDetail.scss';
import Moment from 'react-moment';
import Helper from "../Helper"
import NotificationActions from '../../actions/NotificationActions'
import Location from '../../core/Location';
import EndpointLink from '../EndpointLink';
import ConfirmationDialog from '../ConfirmationDialog'
import MigrationActions from '../../actions/MigrationActions';
import MigrationNetworks from '../MigrationNetworks';

const title = 'Migration details';

class MigrationDetail extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  static propTypes = {
    migration: PropTypes.object,
    migrationId: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {
      confirmationDialog: {
        visible: false,
        message: "Are you sure?",
        onConfirm: null,
        onCancel: null
      }
    }
  }

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  createMigrationFromReplica(e, replica) {
    MigrationActions.createMigrationFromReplica(replica)
  }

  deleteMigration(e, migration) {
    this.setState({
      confirmationDialog: {
        visible: true,
        onConfirm: () => {
          this.setState({ confirmationDialog: { visible: false } })
          MigrationActions.deleteMigration(migration, () => { Location.push('/migrations') })
        },
        onCancel: () => {
          this.setState({ confirmationDialog: { visible: false } })
        }
      }
    })
  }

  copyIdClick(item) {
    let succesful = Helper.copyTextToClipboard(item.id)

    if (succesful) {
      NotificationActions.notify('The ID has been copied to clipboard.')
    } else {
      NotificationActions.notify('The ID couldn\'t be copied', 'error')
    }
  }

  render() {
    let item = this.props.migration
    let output = null
    if (item) {
      let disabled = false
      if (item.type == "replica") {
        disabled = item.executions && item.executions.length &&
          item.executions[item.executions.length - 1].status != "COMPLETED"
        if (item.executions.length == 0) {
          disabled = true
        }
      }

      output = (
        <div className={s.root}>
          <div className={s.container}>
            <div className={s.formGroup}>
              <div className={s.title}>
                Source
              </div>
              <div className={s.value}>
                <EndpointLink connectionId={item.origin_endpoint_id} />
              </div>
            </div>
            <div className={s.formGroup}>
              <div className={s.title}>
                Target
              </div>
              <div className={s.value}>
                <EndpointLink connectionId={item.destination_endpoint_id} />
              </div>
            </div>
            <div className={s.formGroup + ' ' + s.logos}>
              <div className={`horizontal-provider-logo ${item.origin_endpoint_type}`}></div>
              <div className="arrow"></div>
              <div className={`horizontal-provider-logo ${item.destination_endpoint_type}`}></div>
            </div>
            <div className={s.formGroup}>
              <div className={s.title}>
                Id
              </div>
              <div className={s.value + ' ' + s.idValue}
                onClick={() => this.copyIdClick(item)}
                onMouseDown={e => e.stopPropagation()}
                onMouseUp={e => e.stopPropagation()}
              >
                <span className={s.idLabel}>{item.id}</span>
                <span className="copyButton"></span>
              </div>
            </div>
            <div className={s.formGroup}>
              <div className={s.title}>
                Type
              </div>
              <div className={s.value}>
                {item.migrationType == "replica" ? "Coriolis Replica" : "Coriolis Migration"}
              </div>
            </div>
            <div className={s.formGroup}>
              <div className={s.title}>
                Created
              </div>
              <div className={s.value}>
                <Moment format="MM/DD/YYYY HH:mm" date={item.created_at} />
              </div>
            </div>
            <div className={s.formGroup}>
              <div className={s.title}>
                Notes
              </div>
              <div className={s.value}>
                {item.notes}
              </div>
            </div>
          </div>
          <MigrationNetworks className={s.migrationNetworks} migration={item} />
          <div className={s.container + " " + s.buttons}>
            { item.type == "replica" && <button
              onClick={(e) => this.createMigrationFromReplica(e, item)}
              disabled={disabled} className={disabled ? "disabled" : ""}
            >
              Migrate Replica
            </button>}
            <button className="wire red" onClick={(e) => this.deleteMigration(e, item)}>Delete Migration</button>
          </div>
          <ConfirmationDialog
            visible={this.state.confirmationDialog.visible}
            message={this.state.confirmationDialog.message}
            onConfirm={(e) => this.state.confirmationDialog.onConfirm(e)}
            onCancel={(e) => this.state.confirmationDialog.onCancel(e)}
          />
        </div>
      )
    }
    return output
  }
}

export default withStyles(MigrationDetail, s);
