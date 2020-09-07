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

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import StatusPill from '../../atoms/StatusPill'
import StatusImage from '../../atoms/StatusImage'
import CopyValue from '../../atoms/CopyValue'
import Button from '../../atoms/Button'
import Timeline from '../../molecules/Timeline'
import Tasks from '../Tasks'

import type { Execution, ExecutionTasks } from '../../../@types/Execution'
import Palette from '../../styleUtils/Palette'
import DateUtils from '../../../utils/DateUtils'

import executionImage from './images/execution.svg'

const Wrapper = styled.div<any>``
const LoadingWrapper = styled.div<any>`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const LoadingText = styled.div<any>`
  margin-top: 38px;
  font-size: 18px;
`
const ExecutionInfo = styled.div<any>`
  background: ${Palette.grayscale[1]};
  padding: 24px 16px;
  display: flex;
  align-items: center;
  margin-top: 16px;
`
const ExecutionInfoNumber = styled.div<any>`
  font-size: 16px;
  padding-right: 24px;
`
const ExecutionInfoDate = styled.div<any>`
  color: ${Palette.grayscale[4]};
  margin-right: 16px;
`
const ExecutionInfoId = styled.div<any>`
  color: ${Palette.grayscale[4]};
  display: flex;
  margin-right: 16px;
  flex-grow: 1;
`
const NoExecutions = styled.div<any>`
  background: ${Palette.grayscale[7]};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 74px;
`
const ExecutionImage = styled.div<any>`
  width: 96px;
  height: 96px;
  background: url('${executionImage}');
  margin: 106px 0 43px 0;
`
const NoExecutionTitle = styled.div<any>`
  font-size: 18px;
  margin-bottom: 10px;
`
const NoExecutionText = styled.div<any>`
  color: ${Palette.grayscale[4]};
  margin-bottom: 48px;
`

type Props = {
  executions: Execution[],
  executionsTasks: ExecutionTasks[],
  loading: boolean,
  tasksLoading: boolean,
  onChange: (executionId: string) => void,
  onCancelExecutionClick: (execution: Execution | null, force?: boolean) => void,
  onDeleteExecutionClick?: (execution: Execution | null) => void,
  onExecuteClick?: () => void,
}
type State = {
  selectedExecution: Execution | null,
}
@observer
class Executions extends React.Component<Props, State> {
  state: State = {
    selectedExecution: null,
  }

  UNSAFE_componentWillMount() {
    this.setSelectedExecution(this.props)
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    this.setSelectedExecution(props)
  }

  setSelectedExecution(props: Props) {
    const lastExecution = this.getLastExecution(props)
    let selectExecution: Execution | null | undefined = null

    if (props.executions && this.props.executions) {
      if (this.props.executions.length !== props.executions.length
        && lastExecution && lastExecution.status === 'RUNNING') {
        selectExecution = lastExecution
      }

      if (this.props.executions.length > props.executions.length) {
        const isSelectedAvailable = props.executions.find(e => this.state.selectedExecution
          && e.id === this.state.selectedExecution.id)
        if (!isSelectedAvailable) {
          const lastIndex = this.props.executions
            ? this.props.executions
              .findIndex(e => this.state.selectedExecution
              && e.id === this.state.selectedExecution.id) : -1
          if (props.executions.length) {
            if (props.executions.length - 1 >= lastIndex) {
              selectExecution = props.executions[lastIndex]
            } else {
              selectExecution = props.executions[lastIndex - 1]
            }
          }
        }
      }
    }
    const currentSelectedExecution = this.state.selectedExecution
    if (!currentSelectedExecution) {
      this.setState({
        selectedExecution: lastExecution || null,
      }, () => {
        this.handleChange(lastExecution)
      })
    } else if (selectExecution) {
      this.setState({
        selectedExecution: selectExecution,
      }, () => {
        this.handleChange(selectExecution)
      })
    } else if (this.hasExecutions(props)) {
      selectExecution = (props.executions
        .find(e => e.id === currentSelectedExecution.id)) || lastExecution
      this.setState({
        selectedExecution: selectExecution || null,
      }, () => {
        this.handleChange(selectExecution)
      })
    } else {
      this.setState({ selectedExecution: null })
    }
  }

  getLastExecution(props: Props) {
    if (this.hasExecutions(props)) {
      return props.executions[props.executions.length - 1]
    }
    return null
  }

  hasExecutions(props: Props) {
    return Boolean(props.executions.length)
  }

  handleChange(execution?: Execution | null) {
    if (!execution) {
      return
    }

    this.props.onChange(execution.id)
  }

  handlePreviousExecutionClick() {
    const currentSelectedExecution = this.state.selectedExecution
    if (!this.props.executions.length || !currentSelectedExecution) {
      return
    }

    const selectedIndex = this.props
      .executions.findIndex(e => e.id === currentSelectedExecution.id)

    if (selectedIndex === 0) {
      return
    }

    this.setState({
      selectedExecution: this.props.executions[selectedIndex - 1],
    }, () => {
      this.handleChange(this.props.executions[selectedIndex - 1])
    })
  }

  handleNextExecutionClick() {
    const currentSelectedExecution = this.state.selectedExecution
    if (!this.props.executions.length || !currentSelectedExecution) {
      return
    }
    const selectedIndex = this.props.executions
      .findIndex(e => e.id === currentSelectedExecution.id)

    if (selectedIndex >= this.props.executions.length - 1) {
      return
    }

    this.setState({ selectedExecution: this.props.executions[selectedIndex + 1] }, () => {
      this.handleChange(this.props.executions[selectedIndex + 1])
    })
  }

  handleTimelineItemClick(item: Execution) {
    this.setState({ selectedExecution: item }, () => {
      this.handleChange(item)
    })
  }

  handleCancelExecutionClick() {
    this.props.onCancelExecutionClick(this.state.selectedExecution)
  }

  handleForceCancelExecutionClick() {
    this.props.onCancelExecutionClick(this.state.selectedExecution, true)
  }

  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>Loading executions...</LoadingText>
      </LoadingWrapper>
    )
  }

  renderTimeline() {
    if (this.props.loading) {
      return null
    }

    return (
      <Timeline
        items={this.props.executions}
        selectedItem={this.state.selectedExecution}
        onPreviousClick={() => { this.handlePreviousExecutionClick() }}
        onNextClick={() => { this.handleNextExecutionClick() }}
        onItemClick={item => { this.handleTimelineItemClick(item) }}
        data-test-id="executions-timeline"
      />
    )
  }

  renderExecutionInfoButton() {
    if (!this.state.selectedExecution) {
      return null
    }

    if (this.state.selectedExecution.status === 'RUNNING') {
      return (
        <Button
          secondary
          hollow
          onClick={() => { this.handleCancelExecutionClick() }}
        >Cancel Execution
        </Button>
      )
    }

    if (this.state.selectedExecution.status === 'CANCELLING') {
      return (
        <Button
          secondary
          hollow
          onClick={() => { this.handleForceCancelExecutionClick() }}
        >Force Cancel Execution
        </Button>
      )
    }

    const onDeleteExecutionClick = this.props.onDeleteExecutionClick
    if (!onDeleteExecutionClick) {
      return null
    }
    return (
      <Button
        alert
        hollow
        onClick={() => { onDeleteExecutionClick(this.state.selectedExecution) }}
      >Delete Execution
      </Button>
    )
  }

  renderExecutionInfo() {
    if (!this.state.selectedExecution || this.props.loading) {
      return null
    }

    return (
      <ExecutionInfo>
        <ExecutionInfoNumber data-test-id="executions-number">Execution #{this.state.selectedExecution.number}</ExecutionInfoNumber>
        <StatusPill style={{ marginRight: '16px' }} small status={this.state.selectedExecution.status} />
        <ExecutionInfoDate>
          {DateUtils.getLocalTime(this.state.selectedExecution.created_at).format('DD MMMM YYYY HH:mm')}
        </ExecutionInfoDate>
        <ExecutionInfoId>
          ID:&nbsp;<CopyValue
            width="186px"
            value={this.state.selectedExecution ? this.state.selectedExecution.id : ''}
          />
        </ExecutionInfoId>
        {this.renderExecutionInfoButton()}
      </ExecutionInfo>
    )
  }

  renderTasks() {
    if (this.props.loading || this.props.executions.length === 0) {
      return null
    }

    return (
      <Tasks
        loading={this.props.tasksLoading}
        items={this.props.executionsTasks
          .find(e => e.id === this.state.selectedExecution?.id)?.tasks || []}
      />
    )
  }

  renderNoExecution() {
    if (this.hasExecutions(this.props) || this.props.loading) {
      return null
    }

    return (
      <NoExecutions>
        <ExecutionImage />
        <NoExecutionTitle data-test-id="executions-noExTitle">It looks like there are no executions in this replica.</NoExecutionTitle>
        <NoExecutionText>This replica has not been executed yet.</NoExecutionText>
        <Button onClick={this.props.onExecuteClick} data-test-id="executions-executeButton">Execute Now</Button>
      </NoExecutions>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderLoading()}
        {this.renderTimeline()}
        {this.renderExecutionInfo()}
        {this.renderTasks()}
        {this.renderNoExecution()}
      </Wrapper>
    )
  }
}

export default Executions
