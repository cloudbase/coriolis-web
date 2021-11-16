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
import { Link } from 'react-router-dom'

import StatusPill from '../../../ui/StatusComponents/StatusPill/StatusPill'
import ActionDropdown from '../../../ui/Dropdowns/ActionDropdown/ActionDropdown'
import type { Action as DropdownAction } from '../../../ui/Dropdowns/ActionDropdown/ActionDropdown'

import { ThemePalette, ThemeProps } from '../../../Theme'

import backArrowImage from './images/back-arrow.svg'

const Wrapper = styled.div<any>`
  background: ${ThemePalette.grayscale[0]};
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -72px;
`
const BackButton = styled(Link)`
  ${ThemeProps.exactSize('33px')}
  background: url('${backArrowImage}') no-repeat center;
  cursor: pointer;
  margin-right: 32px;
`
const TypeImage = styled.div<any>`
  min-width: 64px;
  height: 64px;
  background: url('${props => props.image}') no-repeat center;
  margin-right: 64px;
`
const Title = styled.div<any>`
  display: flex;
  align-items: center;
  ${ThemeProps.exactWidth(ThemeProps.contentWidth)}
`
const Text = styled.div<any>`
  font-size: 30px;
  font-weight: ${ThemeProps.fontWeights.light};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Status = styled.div<any>`
  flex-grow: 1;
  text-overflow: ellipsis;
  overflow: hidden;
`
const StatusPills = styled.div<any>`
  display: flex;
  margin-top: 5px;
  & > div {
    margin-right: 16px;
  }
`
const Description = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
  margin-top: 3px;
`
const MockButton = styled.div<any>`
  ${ThemeProps.exactWidth(`${ThemeProps.inputSizes.regular.width}px`)}
`

type Props = {
  dropdownActions?: DropdownAction[],
  backLink: string,
  typeImage?: string,
  alertInfoPill?: boolean,
  primaryInfoPill?: boolean,
  statusPill?: string,
  statusLabel?: string,
  itemTitle?: string | null
  itemType?: string
  itemDescription?: string
  largeDropdownActionItems?: boolean
}
@observer
class DetailsContentHeader extends React.Component<Props> {
  renderStatusPill() {
    if (!this.props.statusPill) {
      return null
    }
    let statusLabel = this.props.statusPill
    if (this.props.statusLabel) {
      statusLabel = this.props.statusLabel
    }
    return (
      <StatusPills>
        <StatusPill
          status="INFO"
          label={this.props.itemType}
          alert={this.props.alertInfoPill}
          primary={this.props.primaryInfoPill}
        />
        <StatusPill
          status={this.props.statusPill}
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
        largeItems={this.props.largeDropdownActionItems}
        style={{ marginLeft: '32px' }}
        data-test-id="dcHeader-actionButton"
      />
    )
  }

  renderDescription() {
    if (!this.props.itemDescription) {
      return null
    }

    return (
      <Description>{this.props.itemDescription}</Description>
    )
  }

  render() {
    return (
      <Wrapper>
        <BackButton to={this.props.backLink} data-test-id="dcHeader-backButton" />
        <TypeImage image={this.props.typeImage} />
        <Title>
          <Status>
            <Text title={this.props.itemTitle}>{this.props.itemTitle}</Text>
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
