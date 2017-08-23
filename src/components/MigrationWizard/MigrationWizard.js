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
/* eslint-disable no-shadow */
import React, { PropTypes } from 'react';
import Reflux from 'reflux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import WizardSource from '../WizardSource';
import WizardTarget from '../WizardTarget';
import { migrationSteps } from '../../config';
import WizardVms from '../WizardVms';
import WizardNetworks from '../WizardNetworks';
import WizardOptions from '../WizardOptions';
import WizardSchedule from '../WizardSchedule';
import WizardSummary from '../WizardSummary';
import Location from '../../core/Location';
import WizardMigrationType from '../WizardMigrationType';
import s from './MigrationWizard.scss';
import Header from '../Header';
import MigrationStore from '../../stores/MigrationStore';
import MigrationActions from '../../actions/MigrationActions';
import ConnectionStore from '../../stores/ConnectionsStore';
import ConnectionsActions from '../../actions/ConnectionsActions';
import WizardStore from '../../stores/WizardStore';
import WizardActions from '../../actions/WizardActions';

const title = 'New Migration';
class MigrationWizard extends Reflux.Component {

  static propTypes = {
    wizard_type: PropTypes.string
  }

  static defaultProps = {
    wizard_type: "migration"
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.stores = [MigrationStore, ConnectionStore, WizardStore]
    WizardActions.newState()
  }

  componentWillMount() {
    super.componentWillMount.call(this)
    this.context.onSetTitle(title);
    if (this.props.wizard_type == "replica") {
      WizardActions.updateWizardState({
        migrationType: "replica"
      })
    }
  }


  back() {
    if (typeof this.state.backCallback == "function") {
      this.state.backCallback((e) => this.initBackStep(e))
    } else {
      if (this.state.currentStep != "WizardMigrationType") {
        this.initBackStep()
      } else {
        if (this.props.wizard_type == "replica") {
          Location.push("/replicas")
        } else {
          Location.push("/migrations")
        }
      }
    }
  }

  initBackStep() {
    let backStep = this.state.breadcrumbs.pop()
    WizardActions.updateWizardState({
      nextStep: this.state.currentStep,
      currentStep: backStep,
      valid: true,
      backCallback: null,
      nextCallback: null
    })
  }

  next() {
    if (this.state.currentStep == "WizardSummary") {
      this.finish()
    } else if (this.state.valid) {
      // Callback to run before next step
      if (typeof this.state.nextCallback == "function") {
        this.state.nextCallback((e) => this.initNextStep(e))
      } else {
        this.initNextStep()
      }
    }
  }

  initNextStep() {
    let breadcrumb = this.state.breadcrumbs;
    breadcrumb.push(this.state.currentStep);

    WizardActions.updateWizardState({
      currentStep: this.state.nextStep,
      nextStep: null,
      backCallback: null,
      nextCallback: null,
      valid: false
    })
  }

  setWizardState(state, callback = null) {
    WizardActions.updateWizardState(state, callback)
  }

  finish() {
    let newMigration = this.state
    // TODO: Integrate tasks
    newMigration.tasks = {
      completed: 1,
      remaining: 12
    }
    newMigration.status = "PAUSED"
    newMigration.created = new Date()

    MigrationActions.addMigration(newMigration, () => {
      ConnectionsActions.resetSelections()
      WizardActions.newState()
      if (newMigration.migrationType == "replica") {
        Location.push('/replicas')
      } else {
        Location.push('/migrations')
      }
    });
  }

  render() {
    let step
    switch (this.state.currentStep) {
      case "WizardSource":
        step = (<WizardSource
          setWizardState={(e) => this.setWizardState(e)}
          cloud={this.state.sourceCloud}
          clouds={this.state.allClouds}
          type={this.state.migrationType}
        />)
        break
      case "WizardTarget":
        step = (<WizardTarget
          setWizardState={(e) => this.setWizardState(e)}
          cloud={this.state.targetCloud}
          clouds={this.state.allClouds}
          exclude={this.state.sourceCloud.credential.id}
          type={this.state.migrationType}
        />)
        break
      case "WizardVms":
        step = <WizardVms setWizardState={(e) => this.setWizardState(e)} data={this.state} />
        break;
      case "WizardNetworks":
        step = <WizardNetworks setWizardState={(e) => this.setWizardState(e)} data={this.state} />
        break;
      case "WizardMigrationType":
        step = (<WizardMigrationType
          setWizardState={(e) => this.setWizardState(e)}
          migrationType={this.state.migrationType}
          data={this.state}
        />)
        break
      case "WizardOptions":
        step = <WizardOptions setWizardState={(e) => this.setWizardState(e)} data={this.state} />
        break
      case "WizardSchedule":
        step = (<WizardSchedule
          setWizardState={(e) => this.setWizardState(e)}
          schedules={this.state.schedules}
          migrationType={this.state.migrationType}
        />)
        break
      case "WizardSummary":
        step = <WizardSummary setWizardState={(e) => this.setWizardState(e)} summary={this.state} />
        break
      default:
        break;
    }

    let progress = migrationSteps.map((cStep) => (
      <span
        className={cStep.component == this.state.currentStep ? s.selected : ""}
        key={cStep.name}
      >{cStep.name}</span>
    ), this)

    let title = "New Coriolis"
    if (this.state.migrationType != null) {
      if (this.state.migrationType == 'replica') {
        title = "New Coriolis Replica"
      } else {
        title = "New Coriolis Migration"
      }
    }

    let stepTitle = "New Migration"
    migrationSteps.forEach((step) => {
      if (step.component == this.state.currentStep) {
        stepTitle = step.title
      }
    }, this)

    return (
      <div className={s.root}>
        <Header title={title} />
        <h1 className={s.stepTitle}>{stepTitle}</h1>
        <div className={s.container}>
          {step}
          <div className={s.wizardControls}>
            <div className={s.buttons}>
              <button
                className={s.prev + " gray"}
                onClick={(e) => this.back(e)}
              >
                Back
              </button>
              <div className={s.cloudSelection}>
                {((_this) => {
                  let selectionSource = null;
                  if (_this.state.sourceCloud) {
                    selectionSource = (
                      <div className={s.cloudImage + " icon small-cloud " + _this.state.sourceCloud.name} />
                    )
                  }
                  return selectionSource
                })(this)}

                {((_this) => {
                  let connector = null
                  if (_this.state.sourceCloud) {
                    connector = (
                      <div className={"icon connector " + (_this.state.migrationType == null ? "" :
                      _this.state.migrationType == 'replica' ? 'replica' : 'migration')}
                      ></div>)
                  }
                  return connector
                })(this)}

                {((_this) => {
                  let selectionTarget = null;
                  if (_this.state.targetCloud) {
                    selectionTarget = (<div
                      className={s.cloudImage + " icon small-cloud " + _this.state.targetCloud.name}
                    ></div>)
                  }
                  return selectionTarget
                })(this)}
              </div>
              <button className={s.next + (!this.state.valid ? " disabled" : "")} onClick={(e) => this.next(e)}>
                {this.state.currentStep == "WizardSummary" ? "Finish" : "Next"}
              </button>
            </div>
            <div className={s.breadcrumbsWrapper}>
              <div className={s.breadcrumbs}>
                {progress}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default withStyles(MigrationWizard, s);
