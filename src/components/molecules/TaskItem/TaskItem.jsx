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
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { Collapse } from 'react-collapse'

import { StatusIcon, Arrow, StatusPill, CopyValue, ProgressBar, CopyButton } from 'components'

import NotificationActions from '../../../actions/NotificationActions'
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
const ArrowStyled = styled(Arrow) `
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
const Row = styled.div`
  display: flex;
  margin-bottom: 24px;
  &:last-child {
    margin-bottom: 0;
  }
`
const RowData = styled.div`
  ${props => props.width ? css`width: ${props.width};` : ''}
  &:first-child {
    padding-left: 24px;
    ${props => css`width: calc(${props.width} - 24px);`}
  }
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
const ExceptionText = styled.div`
  cursor: pointer;
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
`
const ProgressUpdateDate = styled.div`
  min-width: ${props => props.width || 'auto'};
  & > span {margin-left: 24px;}
`
const ProgressUpdateValue = styled.div`
  width: 100%;
  margin-right: 32px;
`

class TaskItem extends React.Component {
  static propTypes = {
    columnWidths: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired,
    open: PropTypes.bool,
    onDependsOnClick: PropTypes.func,
  }

  getLastMessage() {
    let message
    if (this.props.item.progress_updates.length) {
      message = this.props.item.progress_updates[0].message
    } else {
      message = '-'
    }

    return message
  }

  getMessageProgress(message) {
    let match = message.match(/.*progress.*?(100|\d{1,2})%/)
    return match && match[1]
  }

  handleExceptionTextClick(exceptionText) {
    let succesful = DomUtils.copyTextToClipboard(exceptionText)

    if (succesful) {
      NotificationActions.notify('The message has been copied to clipboard.')
    }
  }

  renderHeader() {
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
          {this.props.item.created_at ?
            DateUtils.getLocalTime(this.props.item.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
        </HeaderData>
        <ArrowStyled primary orientation={this.props.open ? 'up' : 'down'} opacity={this.props.open ? 1 : 0} />
      </Header>
    )
  }

  renderDependsOnValue() {
    if (this.props.item.depends_on && this.props.item.depends_on[0]) {
      return (
        <Value
          width="calc(100% - 16px)"
          primaryOnHover
          textEllipsis
          onClick={e => { e.stopPropagation(); this.props.onDependsOnClick(this.props.item.depends_on[0]) }}
          onMouseDown={e => { e.stopPropagation() }}
          onMouseUp={e => { e.stopPropagation() }}
        >{this.props.item.depends_on[0]}</Value>)
    }

    return <Value>N/A</Value>
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
            <ProgressUpdate key={i}>
              <ProgressUpdateDate width={this.props.columnWidths[0]}>
                <span>{DateUtils.getLocalTime(update.created_at).format('YYYY-MM-DD HH:mm:ss')}</span>
              </ProgressUpdateDate>
              <ProgressUpdateValue>
                {update.message}
                {messageProgress && <ProgressBar style={{ margin: '8px 0' }} progress={Number(messageProgress)} />}
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
    return (
      <Collapse isOpened={this.props.open} springConfig={{ stiffness: 100, damping: 20 }}>
        <Body>
          <Row>
            <RowData width={this.props.columnWidths[0]}>
              <Label>Status</Label>
              <StatusPill small status={this.props.item.status} />
            </RowData>
            <RowData width={`${parseInt(this.props.columnWidths[1], 10) + parseInt(this.props.columnWidths[2], 10)}%`}>
              <Label>ID</Label>
              <CopyValue value={this.props.item.id} width="auto" />
            </RowData>
            <RowData width={this.props.columnWidths[3]}>
              <Label>Depends on</Label>
              {this.renderDependsOnValue()}
            </RowData>
          </Row>
          <Row>
            <RowData width="100%">
              <Label>Exception Details</Label>
              {this.renderExceptionDetails()}
            </RowData>
          </Row>
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
