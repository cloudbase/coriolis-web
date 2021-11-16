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

import Switch from '@src/components/ui/Switch/Switch'

import { ThemePalette, ThemeProps } from '@src/components/Theme'

import migrationImage from './images/migration'

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
`
const Image = styled.div<any>`
  width: 96px;
  height: 96px;
  #stroke {
    transition: all ${ThemeProps.animations.swift};
    stroke: ${props => (props.type === 'replica' ? ThemePalette.alert : ThemePalette.primary)};
  }
`
const Row = styled.div<any>`
  display: flex;
  justify-content: center;
  margin-top: 52px;
`
const Column = styled.div<any>`
  width: ${props => props.width};
  text-align: ${props => (props.alignRight ? 'right' : 'left')};
  display: flex;
  flex-direction: column;
  ${props => (props.alignCenter ? 'align-items: center;' : '')}
`
const Title = styled.div<any>`
  font-size: 23px;
  font-weight: ${ThemeProps.fontWeights.light};
  margin-bottom: 17px;
`
const Message = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
  transition: all ${ThemeProps.animations.swift};
  opacity: ${props => (props.selected ? 1 : 0.6)};
`

type Props = {
  selected: 'replica' | 'migration',
  onChange: (checked: boolean | null) => void,
}
@observer
class WizardType extends React.Component<Props> {
  render() {
    return (
      <Wrapper>
        <Image type={this.props.selected} dangerouslySetInnerHTML={{ __html: migrationImage }} />
        <Row>
          <Column alignRight width="50%">
            <Title>Coriolis Migration</Title>
            <Message selected={this.props.selected === 'migration'}>A Coriolis Migration is a full instance migration between two cloud endpoints.</Message>
          </Column>
          <Column alignCenter width="192px">
            <Switch
              big
              onChange={this.props.onChange}
              checked={this.props.selected === 'replica'}
              data-test-id="wType-switch"
            />
          </Column>
          <Column width="50%">
            <Title>Coriolis Replica</Title>
            <Message selected={this.props.selected === 'replica'}>The Coriolis Replica is obtained by copying (replicating) incrementally the virtual machines data from the source environment to the target, without interfering with any running workload. A migration replica can then be finalized by automatically applying the required changes to adapt it to the target environment (migration phase).</Message>
          </Column>
        </Row>
      </Wrapper>
    )
  }
}

export default WizardType
