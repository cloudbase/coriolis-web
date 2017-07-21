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
import s from './WizardMigrationType.scss';


const title = 'Migration Type';

class WizardMigrationType extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  static propTypes = {
    migrationType: PropTypes.string,
    setWizardState: PropTypes.func,
    data: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.state = {
      migrationType: this.props.migrationType,
      valid: true,
      nextStep: "WizardSource"
    }
  }


  componentWillMount() {
    this.props.setWizardState(this.state)
    this.context.onSetTitle(title)
  }

  handleChangeMigrationNotes(event) {
    if (event.target.value.trim() != "") {
      this.setState({ notes: event.target.value, valid: true }, this.updateWizard)
    } else {
      this.setState({ notes: "", valid: false }, this.updateWizard)
    }
  }

  handleChangeMigrationType() {
    if (this.state.migrationType == 'replica') {
      this.setState({
        migrationType: 'migration',
      }, this.updateWizard)
    } else {
      this.setState({
        migrationType: 'replica',
      }, this.updateWizard)
    }
  }

  updateWizard() {
    this.props.setWizardState(this.state)
    this.context.onSetTitle(this.state.migrationType == 'replica' ? "Replica" : "Migration")
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.migrationIcon + " " + this.state.migrationType}></div>
          <label className={s.migrationSwitch}>
            <input
              type="checkbox"
              checked={this.state.migrationType == 'replica'}
              className={"ios-switch migrationType bigswitch"}
              onChange={(e) => this.handleChangeMigrationType(e)}
            />
            <div><div></div></div>
          </label>
          <div className={s.containerLeft + " " + (this.state.migrationType != 'replica' ? s.selected : "")}>
            <h3>Coriolis Migration</h3>
            <p>A Coriolis® Migration is a full instance migration between two cloud endpoints.</p>
          </div>
          <div className={s.containerRight + " " + (this.state.migrationType == 'replica' ? s.selected : "")}>
            <h3>Coriolis Replica</h3>
            <p>The Coriolis Replica is obtained by copying (replicating) incrementally the virtual machines data from
              the source environment to the target, without interfering with any running workload. A migration replica
              can then be finalized by automatically applying the required changes to adapt it to the target
              environment (migration phase).</p>
          </div>
        </div>
      </div>
    );
  }

}

export default withStyles(WizardMigrationType, s);
