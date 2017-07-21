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

  isNext() {
    let executions = this._getExecutions()
    let number = this._currentExecutionPosition()
    return executions[number + 1]
  }

  isPrev() {
    let executions = this._getExecutions()
    let number = this._currentExecutionPosition()
    return executions[number - 1]
  }

  handleNext() {
    let executions = this._getExecutions()
    let number = this._currentExecutionPosition()
    if (executions[number + 1]) {
      this.props.handleChangeExecution(executions[number + 1])
    }
  }

  handlePrev() {
    let executions = this._getExecutions()
    let number = this._currentExecutionPosition()
    if (executions[number - 1]) {
      this.props.handleChangeExecution(executions[number - 1])
    }
  }

  _getExecutions(newProps = null) {
    let props = this.props
    if (newProps !== null) {
      props = newProps
    }
    let executions = props.executions
    executions.sort((a, b) => a.number - b.number)
    return executions
  }

  _currentExecutionPosition(newProps = null) {
    let props = this.props
    if (newProps !== null) {
      props = newProps
    }
    let number = 0
    let executions = this._getExecutions()

    for (let i in executions) {
      if (props.currentExecution.id === executions[i].id) {
        number = i
      }
    }
    return parseInt(number, 10)
  }

  render() {
    let dotDistance = 100 / (numberOfExecutions + 1)
    let number = this._currentExecutionPosition()

    let executionList = this._getExecutions()

    let executions = executionList.map((execution, index) => {
      let offset = (numberOfExecutions - 1) / 2
      let style
      if (index < (number - offset)) { // if before
        style = { left: "0%", transform: "scale(0)" }
      } else if (index > (number + offset)) { // if after
        style = { left: "100%", transform: "scale(0)" }
      } else { // in between
        style = { left: (dotDistance * (index - number + offset + 1)) + "%", transform: "scale(1)" }
      }
      return (
        <div
          className={s.executionDot + (index == number ? (" " + s.current) : "")}
          style={style}
          onClick={() => this.props.handleChangeExecution(execution)}
          key={"execution_" + index}
        >
          <div className={"taskIcon " + execution.status}></div>
          <Moment format="D MMM YYYY" date={execution.created_at} />
        </div>
      )
    })
    return (
      <div className={s.root}>
        <div className={s.line}>
          { this.isPrev() && <div className={s.caretLeft + " icon chevron"} onClick={() => this.handlePrev()}></div>}
          <div className={s.progress}></div>
          { this.isNext() && <div className={s.caretRight + " icon chevron"} onClick={() => this.handleNext()}></div>}
        </div>
        {executions}
      </div>
    )
  }

}

export default withStyles(withStyles(ExecutionsTimeline, s2), s);
