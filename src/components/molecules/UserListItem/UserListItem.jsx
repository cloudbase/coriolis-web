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

import type { User } from '../../../types/User'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import userImage from './images/user.svg'

const Content = styled.div`
  display: flex;
  align-items: center;
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

  &:last-child ${Content} {
    border-bottom: 1px solid ${Palette.grayscale[1]};
  }
`
const Image = styled.div`
  min-width: 48px;
  height: 48px;
  background: url('${userImage}') no-repeat center;
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
const Subtitle = styled.div`
  color: ${Palette.grayscale[4]};
  margin-top: 3px;
`
const ItemLabel = styled.div`
  color: ${Palette.grayscale[4]};
`
const ItemValue = styled.div`
  color: ${Palette.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const bodyWidth = 620
const Body = styled.div`
  ${StyleProps.exactWidth(`${bodyWidth}px`)}
  display: flex;
`
const Data = styled.div`
  ${props => StyleProps.exactWidth(`${Math.floor(bodyWidth / (100 / props.percentage)) - 68}px`)}
  margin: 0 32px;

  &:last-child {
    margin-right: 0;
  }
`

type Props = {
  item: User,
  onClick: () => void,
  getProjectName: (projectId: ?string) => string,
}
@observer
class EndpointListItem extends React.Component<Props> {
  render() {
    return (
      <Wrapper>
        <Content onClick={this.props.onClick}>
          <Image />
          <Title>
            <TitleLabel>{this.props.item.name}</TitleLabel>
            <Subtitle>{this.props.item.description}</Subtitle>
          </Title>
          <Body>
            <Data percentage={45}>
              <ItemLabel>Email</ItemLabel>
              <ItemValue>
                {this.props.item.email || '-'}
              </ItemValue>
            </Data>
            <Data percentage={35}>
              <ItemLabel>Primary Project</ItemLabel>
              <ItemValue>
                {this.props.getProjectName(this.props.item.project_id)}
              </ItemValue>
            </Data>
            <Data percentage={20}>
              <ItemLabel>Enabled</ItemLabel>
              <ItemValue>
                {this.props.item.enabled ? 'Yes' : 'No'}
              </ItemValue>
            </Data>
          </Body>
        </Content>
      </Wrapper>
    )
  }
}

export default EndpointListItem
