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
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import type { MainItem } from '../../../types/MainItem'
import type { Execution } from '../../../types/Execution'
import StatusPill from '../../atoms/StatusPill'
import ActionDropdown from '../../molecules/ActionDropdown'
import type { Action as DropdownAction } from '../../molecules/ActionDropdown'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import backArrowImage from './images/back-arrow.svg'

const Wrapper = styled.div`
  background: ${Palette.grayscale[0]};
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -72px;
`
const BackButton = styled(Link)`
  ${StyleProps.exactSize('33px')}
  background: url('${backArrowImage}') no-repeat center;
  cursor: pointer;
  margin-right: 32px;
`
const TypeImage = styled.div`
  min-width: 64px;
  height: 64px;
  background: url('${props => props.image}') no-repeat center;
  margin-right: 64px;
`
const Title = styled.div`
  display: flex;
  align-items: center;
  ${StyleProps.exactWidth(StyleProps.contentWidth)}
`
const Text = styled.div`
  font-size: 30px;
  font-weight: ${StyleProps.fontWeights.light};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Status = styled.div`
  flex-grow: 1;
  text-overflow: ellipsis;
  overflow: hidden;
`
const StatusPills = styled.div`
  display: flex;
  margin-top: 5px;
  & > div {
    margin-right: 16px;
  }
`
const Description = styled.div`
  color: ${Palette.grayscale[4]};
  margin-top: 3px;
`
const MockButton = styled.div`
  ${StyleProps.exactWidth(`${StyleProps.inputSizes.regular.width}px`)}
`

type Props = {
  dropdownActions?: DropdownAction[],
  backLink: string,
  typeImage?: string,
  statusLabel?: string,
  item: ?any,
  alertInfoPill?: boolean,
  primaryInfoPill?: boolean,
}
@observer
class DetailsContentHeader extends React.Component<Props> {
  getLastExecution(): ?MainItem | ?Execution {
    if (this.props.item && this.props.item.executions && this.props.item.executions.length) {
      return this.props.item.executions[this.props.item.executions.length - 1]
    } else if (this.props.item && typeof this.props.item.executions === 'undefined') {
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

  renderStatusPill() {
    if (!this.getStatus()) {
      return null
    }
    let statusLabel = this.getStatus()
    if (this.props.statusLabel) {
      statusLabel = this.props.statusLabel
    }
    return (
      <StatusPills>
        <StatusPill
          status="INFO"
          label={this.props.item ? this.props.item.type && this.props.item.type.toUpperCase() : ''}
          alert={this.props.alertInfoPill}
          primary={this.props.primaryInfoPill}
          data-test-id="dcHeader-infoPill"
        />
        <StatusPill
          data-test-id={`dcHeader-statusPill-${statusLabel || ''}`}
          status={this.getStatus()}
          label={statusLabel || ''}
        />
      </StatusPills>
    )
  }

  renderButton() {
    if (!this.props.dropdownActions) {
      return <MockButton />
    }

    return (
      <ActionDropdown
        actions={this.props.dropdownActions}
        style={{ marginLeft: '32px' }}
        data-test-id="dcHeader-actionButton"
      />
    )
  }

  renderDescription() {
    if (!this.props.item || !this.props.item.description) {
      return null
    }

    return (
      <Description data-test-id="dcHeader-description">{this.props.item.description}</Description>
    )
  }

  render() {
    let title = this.props.item ? (this.props.item.instances && this.props.item.instances[0]) || this.props.item.name : ''

    return (
      <Wrapper>
        <BackButton to={this.props.backLink} data-test-id="dcHeader-backButton" />
        <TypeImage image={this.props.typeImage} />
        <Title>
          <Status>
            <Text data-test-id="dcHeader-title">{title}</Text>
            {this.renderStatusPill()}
            {this.renderDescription()}
          </Status>
          {this.renderButton()}
        </Title>
      </Wrapper>
    )
  }
}

export default DetailsContentHeader
