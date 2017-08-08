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
import s from './ReplicaDetail.scss';
import Moment from 'react-moment';
import Helper from "../Helper";
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
    replica: PropTypes.object,
    replicaId: PropTypes.string
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

  deleteMigration() {
    this.setState({
      confirmationDialog: {
        visible: true,
        onConfirm: () => {
          this.setState({ confirmationDialog: { visible: false } })
          let item = this.state.migrations.filter(migration => migration.id == this.props.replicaId)[0]
          MigrationActions.deleteMigration(item)
          Location.push('/cloud-endpoints')
        },
        onCancel: () => {
          this.setState({ confirmationDialog: { visible: false } })
        }
      }
    })
  }

  render() {
    let item = this.props.replica
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

      let createdAt = Helper.getTimeObject(item.created_at)

      output = (
        <div className={s.root}>
          <div className={s.container}>
            <div className={s.columnLeft}>
              <div className={s.formGroup}>
                <div className={s.title}>
                  Source
                </div>
                <div className={s.value}>
                  <EndpointLink connectionId={item.origin_endpoint_id} />
                </div>
                <div className={s.cloudImg + " icon large-cloud " + item.origin_endpoint_type + " dim"}></div>
                <div className="arrow large"></div>
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
                  Notes
                </div>
                <div className={s.value}>
                  {item.notes}
                </div>
              </div>
            </div>
            <div className={s.columnRight}>
              <div className={s.formGroup}>
                <div className={s.title}>
                  Target
                </div>
                <div className={s.value}>
                  <EndpointLink connectionId={item.destination_endpoint_id} />
                </div>
                <div className={s.cloudImg + " icon large-cloud " + item.destination_endpoint_type + " dim"}></div>
              </div>
              <div className={s.formGroup}>
                <div className={s.title}>
                  Created
                </div>
                <div className={s.value}>
                  <Moment format="MM/DD/YYYY HH:mm" date={createdAt} />
                </div>
              </div>
              <div className={s.formGroup}>
                <div className={s.titleIp}>
                  Id
                </div>
                <div className={s.value}>
                  <a>{item.id}</a>
                </div>
              </div>
            </div>
          </div>
          <MigrationNetworks migration={item} />
          <div className={s.container + " " + s.buttons}>
            { item.type == "replica" && <button
              onClick={(e) => this.createMigrationFromReplica(e, item)}
              disabled={disabled} className={disabled ? "disabled" : ""}
            >
              Migrate Replica
            </button>}
            <button className="wire red" onClick={(e) => this.deleteMigration(e)}>Delete</button>
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
