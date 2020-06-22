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

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import type { Assessment } from '../../../@types/Assessment'

import assessmentImage from './images/assessment.svg'
import azureMigrateImage from './images/azure-migrate.svg'

const Content = styled.div<any>`
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
const Wrapper = styled.div<any>`
  display: flex;
  align-items: center;

  &:last-child ${Content} {
    border-bottom: 1px solid ${Palette.grayscale[1]};
  }
`
const Image = styled.div<any>`
  min-width: 48px;
  height: 48px;
  background: url('${(props: any) => props.image}') no-repeat center;
  margin-right: 16px;
`
const Title = styled.div<any>`
  flex-grow: 1;
  overflow: hidden;
  margin-right: 48px;
  min-width: 100px;
`
const TitleLabel = styled.div<any>`
  font-size: 16px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`
const AssessmentType = styled.div<any>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 46px;
  ${StyleProps.exactWidth('180px')}
`
const AssessmentImage = styled.div<any>`
  width: 48px;
  height: 32px;
  background: url('${azureMigrateImage}') center no-repeat;
  margin-right: 12px;
`
const AssessmentLabel = styled.div<any>`
  font-size: 15px;
  color: ${Palette.grayscale[4]};
  width: 64px;
`
const TotalVms = styled.div<any>`
  ${StyleProps.exactWidth('96px')}
  margin-right: 48px;
`
const Project = styled.div<any>`
  ${StyleProps.exactWidth('175px')}
  margin-right: 48px;
`
const ItemLabel = styled.div<any>`
  color: ${Palette.grayscale[4]};
`
const ItemValue = styled.div<any>`
  color: ${Palette.primary};
`

type Props = {
  item: Assessment,
  onClick: () => void,
}
@observer
class AssessmentListItem extends React.Component<Props> {
  render() {
    let status = this.props.item.properties.status.toUpperCase()
    let label = status
    if (status === 'CREATED' || status === 'RUNNING') {
      status = 'RUNNING'
      label = 'CREATING'
    } else if (status === 'COMPLETED') {
      label = 'READY'
    }

    return (
      <Wrapper>
        <Content onClick={this.props.onClick}>
          <Image image={assessmentImage} />
          <Title>
            <TitleLabel>{this.props.item.name}</TitleLabel>
            <StatusPill status={status} label={label} />
          </Title>
          <AssessmentType>
            <AssessmentImage />
            <AssessmentLabel>Azure Migrate</AssessmentLabel>
          </AssessmentType>
          <Project>
            <ItemLabel>Project</ItemLabel>
            <ItemValue>
              {this.props.item.project.name}
            </ItemValue>
          </Project>
          <TotalVms>
            <ItemLabel>Instances</ItemLabel>
            <ItemValue>
              {this.props.item.properties.numberOfMachines}
            </ItemValue>
          </TotalVms>
        </Content>
      </Wrapper>
    )
  }
}

export default AssessmentListItem
