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
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'
import { Collapse } from 'react-collapse'

import type { Task } from '../../../types/Task'
import StatusIcon from '../../atoms/StatusIcon'
import Arrow from '../../atoms/Arrow'
import StatusPill from '../../atoms/StatusPill'
import CopyValue from '../../atoms/CopyValue'
import ProgressBar from '../../atoms/ProgressBar'
import CopyButton from '../../atoms/CopyButton'
import notificationStore from '../../../stores/NotificationStore'
import DomUtils from '../../../utils/DomUtils'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import DateUtils from '../../../utils/DateUtils'

const Wrapper = styled.div`
  cursor: pointer;
  border-bottom: 1px solid white;
  transition: all ${StyleProps.animations.swift};
  ${props => props.open ? `background: ${Palette.grayscale[0]};` : ''}
  &:hover {
    background: ${Palette.grayscale[0]};
  }
`
const ArrowStyled = styled(Arrow)`
  position: absolute;
  left: -24px;
`
const Header = styled.div`
  display: flex;
  padding: 8px;
  position: relative;
  &:hover ${ArrowStyled} {
    opacity: 1;
  }
`
const HeaderData = styled.div`
  display: block;
  ${props => props.capitalize ? 'text-transform: capitalize;' : ''}
  width: ${props => props.width};
  color: ${props => props.black ? Palette.black : Palette.grayscale[4]};
  padding-right: 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
`
const Title = styled.div`
  display: flex;
`
const TitleText = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`
const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px 8px;
`
const Columns = styled.div`
  display: flex;
`
const Column = styled.div`
  display: flex;
  flex-direction: column;
`
const Row = styled.div`
  display: flex;
  margin-bottom: 24px;
`
const RowData = styled.div`
  ${props => props.width ? css`min-width: ${props.width};` : ''}
  ${props => !props.skipPaddingLeft ? css`
    &:first-child {
      padding-left: 24px;
      ${props => css`min-width: calc(${props.width} + 21px);`}
    }
  ` : ''}
`
const Label = styled.div`
  text-transform: uppercase;
  font-size: 10px;
  font-weight: ${StyleProps.fontWeights.medium};
  color: ${Palette.grayscale[5]};
  margin-bottom: 4px;
`
const Value = styled.div`
  ${props => props.width ? css`width: ${props.width};` : ''}
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  ${props => props.primary ? css`color: ${Palette.primary};` : ''}
  &:hover {
    ${props => props.primaryOnHover ? css`color: ${Palette.primary};` : ''}
  }
`
const DependsOnIds = styled.div`
  display: flex;
  flex-direction: column;
`
const ExceptionText = styled.div`
  cursor: pointer;
  text-overflow: ellipsis;
  overflow: hidden;
  &:hover > span {
    opacity: 1;
  }
  > span {
    background-position-y: 4px;
    margin-left: 4px;
  }
`
const ProgressUpdates = styled.div`
  color: ${Palette.black};
`
const ProgressUpdate = styled.div`
  display: flex;
  color: ${props => props.secondary ? Palette.grayscale[5] : 'inherit'};
`
const ProgressUpdateDate = styled.div`
  min-width: ${props => props.width || 'auto'};
  & > span {margin-left: 24px;}
`
const ProgressUpdateValue = styled.div`
  width: 100%;
  margin-right: 32px;
`

type Props = {
  columnWidths: string[],
  item: Task,
  open: boolean,
  onDependsOnClick: (id: string) => void,
}
@observer
class TaskItem extends React.Component<Props> {
  getLastMessage() {
    let message
    if (this.props.item.progress_updates.length) {
      message = this.props.item.progress_updates[0].message
    } else {
      message = '-'
    }

    return message
  }

  getMessageProgress(message: string) {
    let match = message.match(/.*progress.*?(100|\d{1,2})%/)
    return match && match[1]
  }

  handleExceptionTextClick(exceptionText: string) {
    let succesful = DomUtils.copyTextToClipboard(exceptionText)

    if (succesful) {
      notificationStore.alert('The message has been copied to clipboard.')
    }
  }

  renderHeader() {
    let date = this.props.item.updated_at ? this.props.item.updated_at : this.props.item.created_at

    return (
      <Header>
        <HeaderData capitalize width={this.props.columnWidths[0]} black>
          <Title>
            <StatusIcon status={this.props.item.status} style={{ marginRight: '8px' }} />
            <TitleText>{this.props.item.task_type.replace(/_/g, ' ').toLowerCase()}</TitleText>
          </Title>
        </HeaderData>
        <HeaderData width={this.props.columnWidths[1]}>
          {this.props.item.instance}
        </HeaderData>
        <HeaderData width={this.props.columnWidths[2]}>
          {this.getLastMessage()}
        </HeaderData>
        <HeaderData width={this.props.columnWidths[3]}>
          {date ? DateUtils.getLocalTime(date).format('YYYY-MM-DD HH:mm:ss') : '-'}
        </HeaderData>
        <ArrowStyled primary orientation={this.props.open ? 'up' : 'down'} opacity={this.props.open ? 1 : 0} thick />
      </Header>
    )
  }

  renderDependsOnValue() {
    const { depends_on: dependsOn } = this.props.item
    if (!dependsOn || !dependsOn.length || !dependsOn.find(Boolean)) {
      return <Value>N/A</Value>
    }

    return (
      <DependsOnIds>
        {dependsOn.map(id => id ? (
          <Value
            key={id}
            width="140px"
            primaryOnHover
            textEllipsis
            onClick={e => { e.stopPropagation(); this.props.onDependsOnClick(id) }}
            onMouseDown={e => { e.stopPropagation() }}
            onMouseUp={e => { e.stopPropagation() }}
          >{id}</Value>
        ) : null)}
      </DependsOnIds>
    )
  }

  renderProgressUpdates() {
    let naValue = <Value style={{ marginLeft: '24px' }}>N/A</Value>
    if (!this.props.item.progress_updates.length) {
      return naValue
    }

    return (
      <ProgressUpdates>
        {this.props.item.progress_updates.map((update, i) => {
          if (!update) {
            return <Value>N/A</Value>
          }
          let messageProgress = this.getMessageProgress(update.message)

          return (
            <ProgressUpdate key={i} secondary={i < this.props.item.progress_updates.length - 1 || this.props.item.status !== 'RUNNING'}>
              <ProgressUpdateDate width={this.props.columnWidths[0]}>
                <span>{DateUtils.getLocalTime(update.created_at).format('YYYY-MM-DD HH:mm:ss')}</span>
              </ProgressUpdateDate>
              <ProgressUpdateValue data-test-id={`taskItem-progressUpdateMessage-${i}`}>
                {update.message}
                {messageProgress && <ProgressBar style={{ margin: '8px 0' }} progress={Number(messageProgress)} data-test-id={`taskItem-progressBar-${i}`} />}
              </ProgressUpdateValue>
            </ProgressUpdate>
          )
        })}
      </ProgressUpdates>
    )
  }

  renderExceptionDetails() {
    let exceptionsText = (this.props.item.exception_details && this.props.item.exception_details.length
      && this.props.item.exception_details)

    let valueField
    if (!exceptionsText) {
      valueField = <Value>N/A</Value>
    } else {
      valueField = (
        <ExceptionText
          onClick={(e) => { e.stopPropagation(); this.handleExceptionTextClick(exceptionsText) }}
          onMouseDown={e => { e.stopPropagation() }}
          onMouseUp={e => { e.stopPropagation() }}
        >{exceptionsText}<CopyButton /></ExceptionText>)
    }

    return valueField
  }

  renderBody() {
    let { columnWidths } = this.props
    return (
      <Collapse isOpened={this.props.open} springConfig={{ stiffness: 100, damping: 20 }}>
        <Body>
          <Columns>
            <Column style={{
              minWidth: `calc(${columnWidths[0]} + ${columnWidths[1]} + ${columnWidths[2]} - 16px)`,
              paddingRight: '16px',
            }}
            >
              <Row>
                <RowData width={columnWidths[0]}>
                  <Label>Status</Label>
                  <StatusPill small status={this.props.item.status} />
                </RowData>
                <RowData width={`calc(${columnWidths[1]} + ${columnWidths[2]})`}>
                  <Label>ID</Label>
                  <CopyValue value={this.props.item.id} width="auto" />
                </RowData>
              </Row>
              <Row>
                <RowData style={{ width: 'calc(100% - 24px)' }}>
                  <Label>Exception Details</Label>
                  {this.renderExceptionDetails()}
                </RowData>
              </Row>
            </Column>
            <Column style={{ minWidth: columnWidths[3] }}>
              <RowData skipPaddingLeft>
                <Label>Depends on</Label>
                {this.renderDependsOnValue()}
              </RowData>
            </Column>
          </Columns>
          <Row style={{ marginBottom: 0 }}>
            <RowData width="100%">
              <Label>Progress Updates</Label>
            </RowData>
          </Row>
          {this.renderProgressUpdates()}
        </Body>
      </Collapse>
    )
  }

  render() {
    return (
      <Wrapper {...this.props}>
        {this.renderHeader()}
        {this.renderBody()}
      </Wrapper>
    )
  }
}

export default TaskItem
