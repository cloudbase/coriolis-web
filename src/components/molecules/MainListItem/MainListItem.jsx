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

// @flow

import React from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'

import Checkbox from '../../atoms/Checkbox'
import StatusPill from '../../atoms/StatusPill'
import EndpointLogos from '../../atoms/EndpointLogos'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import DateUtils from '../../../utils/DateUtils'
import type { MainItem } from '../../../types/MainItem'
import type { Execution } from '../../../types/Execution'

import arrowImage from './images/arrow.svg'

const CheckboxStyled = styled(Checkbox)`
  opacity: ${props => props.checked ? 1 : 0};
  transition: all ${StyleProps.animations.swift};
`
const Content = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;
  border-top: 1px solid ${Palette.grayscale[1]};
  padding: 8px 16px;
  cursor: pointer;
  flex-grow: 1;
  transition: all ${StyleProps.animations.swift};
  min-width: 785px;

  &:hover {
    background: ${Palette.grayscale[1]};
  }
`
const Wrapper = styled.div`
  display: flex;
  align-items: center;

  &:hover ${CheckboxStyled} {
    opacity: 1;
  }

  &:last-child ${Content} {
    border-bottom: 1px solid ${Palette.grayscale[1]};
  }
`

const Image = styled.div`
  min-width: 48px;
  height: 48px;
  background: url('${props => props.image}') no-repeat center;
  margin-right: 16px;
`
const Title = styled.div`
  flex-grow: 1;
  overflow: hidden;
  margin-right: 48px;
  min-width: 100px;
`
const TitleLabel = styled.div`
  font-size: 16px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`
const EndpointsImages = styled.div`
  display: flex;
  align-items: center;
  margin-right: 48px;
`
const EndpointImageArrow = styled.div`
  width: 16px;
  height: 16px;
  margin: 0 16px;
  background: url('${arrowImage}') center no-repeat;
`
const LastExecution = styled.div`
  min-width: 175px;
  margin-right: 25px;
`
const ItemLabel = styled.div`
  color: ${Palette.grayscale[4]};
`
const ItemValue = styled.div`
  color: ${Palette.primary};
`

const TasksRemaining = styled.div`
  min-width: 114px;
`

type Props = {
  item: MainItem,
  onClick: () => void,
  selected: boolean,
  useTasksRemaining?: boolean,
  image: string,
  endpointType: (endpointId: string) => string,
  onSelectedChange: (value: boolean) => void,
}
@observer
class MainListItem extends React.Component<Props> {
  getLastExecution(): ?Execution | ?MainItem {
    if (this.props.item.executions && this.props.item.executions.length) {
      return this.props.item.executions[this.props.item.executions.length - 1]
    }

    if (typeof this.props.item.executions === 'undefined') {
      return this.props.item
    }

    return null
  }

  getStatus() {
    let lastExecution = this.getLastExecution()
    if (lastExecution) {
      return lastExecution.status
    }

    return null
  }

  getTasksRemaining() {
    let lastExecution = this.getLastExecution()

    if (!lastExecution || !lastExecution.tasks || lastExecution.tasks.length === 0) {
      return '-'
    }

    let unfinished = lastExecution.tasks.filter(task => task.status !== 'COMPLETED').length

    if (unfinished === 0) {
      return '-'
    }

    let total = lastExecution.tasks.length

    return `${unfinished} of ${total}`
  }

  getTotalExecutions() {
    return (this.props.item.executions && this.props.item.executions.length) || '-'
  }

  renderLastExecution() {
    let lastExecution = this.getLastExecution()
    let label = 'Last Execution'
    let time = '-'

    if (this.props.item.executions === undefined) {
      label = 'Created'
      time = DateUtils.getLocalTime(lastExecution && lastExecution.created_at).format('DD MMMM YYYY, HH:mm')
    } else if (lastExecution && (lastExecution.created_at || lastExecution.updated_at)) {
      time = DateUtils.getLocalTime(lastExecution.updated_at || lastExecution.created_at).format('DD MMMM YYYY, HH:mm')
    }

    return (
      <LastExecution>
        <ItemLabel>
          {label}
        </ItemLabel>
        <ItemValue>
          {time}
        </ItemValue>
      </LastExecution>
    )
  }

  render() {
    let sourceType = this.props.endpointType(this.props.item.origin_endpoint_id)
    let destinationType = this.props.endpointType(this.props.item.destination_endpoint_id)
    let endpointImages = (
      <EndpointsImages>
        <EndpointLogos data-test-id="mainListItem-sourceLogo" height={32} endpoint={sourceType} />
        <EndpointImageArrow />
        <EndpointLogos data-test-id="mainListItem-destLogo" height={32} endpoint={destinationType} />
      </EndpointsImages>
    )
    const status = this.getStatus()
    return (
      <Wrapper>
        <CheckboxStyled
          data-test-id="mainListItem-checkbox"
          checked={this.props.selected}
          onChange={this.props.onSelectedChange}
        />
        <Content onClick={this.props.onClick} data-test-id="mainListItem-content">
          <Image image={this.props.image} />
          <Title>
            <TitleLabel>{this.props.item.instances[0]}</TitleLabel>
            {status ? <StatusPill data-test-id={`mainListItem-statusPill-${status}`} status={status} /> : null}
          </Title>
          {endpointImages}
          {this.renderLastExecution()}
          <TasksRemaining>
            <ItemLabel>{this.props.useTasksRemaining ? 'Tasks Remaining' : 'Total Executions'}</ItemLabel>
            <ItemValue>{this.props.useTasksRemaining ? this.getTasksRemaining() : this.getTotalExecutions()}</ItemValue>
          </TasksRemaining>
        </Content>
      </Wrapper>
    )
  }
}

export default MainListItem
