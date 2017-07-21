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
import s from './MigrationView.scss';
import Header from '../Header';
import Link from '../Link';
import MigrationStore from '../../stores/MigrationStore';
import MigrationActions from '../../actions/MigrationActions';
import LoadingIcon from '../LoadingIcon';
import TextTruncate from 'react-text-truncate';
import Location from '../../core/Location';
import ConfirmationDialog from '../ConfirmationDialog'

const title = "Coriolis: View Migration"

// TODO: Create ReplicaView
class MigrationView extends Reflux.Component {

  static propTypes = {
    type: PropTypes.string
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props)
    this.store = MigrationStore

    this.state = {
      migration: null,
      confirmationDialog: {
        visible: false,
        message: "Are you sure?",
        onConfirm: null,
        onCancel: null
      }
    }
  }

  componentWillMount() {
    super.componentWillMount.call(this)
    MigrationActions.setMigration(this.props.migrationId)
  }

  componentDidMount() {
    this.context.onSetTitle(title);
  }

  goBack() {
    Location.push('/migrations')
  }

  deleteMigration() {
    let item = this.state.migrations.filter(migration => migration.id == this.props.migrationId)[0]
    this.setState({
      confirmationDialog: {
        visible: true,
        onConfirm: () => {
          this.setState({ confirmationDialog: { visible: false } })
          MigrationActions.deleteMigration(item)
          Location.push('/migrations')
        },
        onCancel: () => {
          this.setState({ confirmationDialog: { visible: false } })
        }
      }
    })
  }

  cancelMigration() {
    let item = this.state.migrations.filter(migration => migration.id == this.props.migrationId)[0]
    MigrationActions.cancelMigration(item)
  }

  currentMigration(migrationId) {
    if (this.state.migrations) {
      return this.state.migrations.filter(migration => migration.id == migrationId)[0]
    } else {
      return null
    }
  }

  render() {
    let item = this.currentMigration(this.props.migrationId)
    let buttons = null

    if (item) {
      if (item.status == "RUNNING") {
        buttons = <button className="gray" onClick={(e) => (this.cancelMigration(e))}>Cancel</button>
      } else {
        buttons = <button className="gray" onClick={(e) => this.deleteMigration(e)}>Delete</button>
      }

      let itemStatus = item.status
      if (item.type === 'replica' && item.executions.length) {
        itemStatus = item.executions[item.executions.length - 1].status
      }

      return (
        <div className={s.root}>
          <Header title={title} linkUrl={item.type == "migration" ? "/migrations" : "/replicas"} />
          <div className={s.migrationHead}>
            <div className={s.container}>
              <div className="backBtn" onClick={(e) => this.goBack(e)}></div>
              <div className={s.migrationTypeImg + ' icon ' + item.type + "-large"}></div>
              <div className={s.migrationInfo}>
                <h2>
                  <TextTruncate line={1} truncateText="..." text={item.name} />
                </h2>
                <div className={s.migrationStats}>
                  <span className={s.migrationType + " " + item.type}>{item.type}</span>
                  <span className={s.migrationStatus + " " + itemStatus + " status-pill"}>{itemStatus}</span>
                </div>
              </div>
              <div className={s.migrationActions}>
                {buttons}
              </div>
            </div>
          </div>
          <div className={s.container}>
            {item ? (
              <div className={s.sidebar}>
                <Link
                  to={"/" + item.type + "/" + item.id + "/"}
                  className={this.props.type == 'detail' ? "active" : ""}
                >{item.type == 'replica' ? "Replica" : "Migration"}</Link>
                <Link
                  to={"/" + item.type + "/" + (item.type == 'migration' ? 'tasks' : 'executions') + "/" + item.id + "/"}
                  className={this.props.type == 'tasks' ? "active" : ""}
                >{item.type == 'replica' ? "Executions" : "Tasks"}</Link>
                { item.type == "replica" && <Link
                  to={"/" + item.type + "/schedule/" + item.id + "/"}
                  className={this.props.type == 'schedule' ? "active" : ""}
                >Schedule</Link>}
              </div>
            ) : ""}

            <div className={s.content}>
              {React.cloneElement(this.props.children, { migration: item })}
            </div>
          </div>
          <ConfirmationDialog
            visible={this.state.confirmationDialog.visible}
            message={this.state.confirmationDialog.message}
            onConfirm={(e) => this.state.confirmationDialog.onConfirm(e)}
            onCancel={(e) => this.state.confirmationDialog.onCancel(e)}
          />
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

export default withStyles(MigrationView, s);
