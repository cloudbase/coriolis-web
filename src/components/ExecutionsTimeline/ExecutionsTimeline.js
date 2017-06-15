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
import s from './ExecutionsTimeline.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Moment from 'react-moment';
import s2 from '../Tasks/Tasks.scss';

const numberOfExecutions = 5;

class ExecutionsTimeline extends Component {

  static propTypes = {
    executions: PropTypes.array,
    currentExecution: PropTypes.object,
    handleChangeExecution: PropTypes.func,
  }

  static defaultProps = {
    executions: null,
    currentExecution: null,
  }

  constructor(props) {
    super(props)
    this.state = {
      visibleExecutions: []
    }
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(newProps) {
    let executions = this._getExecutions()
    let number = newProps.currentExecution.number - 1
    let visibleExecutions = []
    let count = 0
    for (let i = number - ((numberOfExecutions - 1) / 2); i <= number + ((numberOfExecutions - 1) / 2); i++) {
      visibleExecutions[count] = executions[i]
      count++
    }
    this.setState({
      visibleExecutions: visibleExecutions
    })
  }

  _getExecutions() {
    let executions = this.props.executions
    executions.sort((a, b) => {
      return a.number - b.number;
    })
    return executions
  }

  isNext() {
    let executions = this._getExecutions()
    let number = this.props.currentExecution.number - 1
    return executions[number + 1]
  }

  isPrev() {
    let executions = this._getExecutions()
    let number = this.props.currentExecution.number - 1
    return executions[number - 1]
  }

  handleNext() {
    let executions = this._getExecutions()
    let number = this.props.currentExecution.number - 1
    if (executions[number + 1]) {
      this.props.handleChangeExecution(executions[number + 1])
    }
  }

  handlePrev() {
    let executions = this._getExecutions()
    let number = this.props.currentExecution.number - 1
    if (executions[number - 1]) {
      this.props.handleChangeExecution(executions[number - 1])
    }
  }

  render() {
    let dotDistance = 100 / (numberOfExecutions + 1)
    let executions = this.state.visibleExecutions.map((execution, index) => {
      if (execution) {
        let style = { left: dotDistance * (index + 1) + "%"}
        return (
          <div
            className={s.executionDot + (index == (numberOfExecutions - 1) / 2 ? (" " + s.current) : "")}
            style={style}
            onClick={(e) => this.props.handleChangeExecution(execution)}
            key={"execution_" + index}
          >
            <div className={"taskIcon " + execution.status}></div>
            <Moment format="D MMM YYYY" date={execution.created_at} />
          </div>
        )
      } else {
        return null;
      }
    })
    return (
      <div className={s.root}>
        <div className={s.line}>
          { this.isPrev() && <div className={s.caretLeft + " icon chevron"} onClick={(e) => this.handlePrev()}></div>}
          <div className={s.progress}></div>
          { this.isNext() && <div className={s.caretRight + " icon chevron"} onClick={(e) => this.handleNext()}></div>}
        </div>
        {executions}
      </div>
    )
  }

}

export default withStyles(withStyles(ExecutionsTimeline, s2), s);
