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

import Switch from '../../atoms/Switch'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

import migrationImage from './images/migration.js'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
`
const Image = styled.div`
  width: 96px;
  height: 96px;
  #stroke {
    transition: all ${StyleProps.animations.swift};
    stroke: ${props => props.type === 'replica' ? Palette.alert : Palette.primary};
  }
`
const Row = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 52px;
`
const Column = styled.div`
  width: ${props => props.middle ? 192 : 304}px;
  text-align: ${props => props.left ? 'right' : 'left'};
  display: flex;
  flex-direction: column;
  ${props => props.middle ? 'align-items: center;' : ''}
`
const Title = styled.div`
  font-size: 23px;
  font-weight: ${StyleProps.fontWeights.light};
  margin-bottom: 17px;
`
const Message = styled.div`
  color: ${Palette.grayscale[4]};
  transition: all ${StyleProps.animations.swift};
  opacity: ${props => props.selected ? 1 : 0.6};
`

type Props = {
  selected: 'replica' | 'migration',
  onChange: (checked: ?boolean) => void,
}
class WizardType extends React.Component<Props> {
  render() {
    return (
      <Wrapper>
        <Image type={this.props.selected} dangerouslySetInnerHTML={{ __html: migrationImage }} />
        <Row>
          <Column left>
            <Title>Coriolis Migration</Title>
            <Message selected={this.props.selected === 'migration'}>A Coriolis Migration is a full instance migration between two cloud endpoints.</Message>
          </Column>
          <Column middle>
            <Switch big onChange={this.props.onChange} checked={this.props.selected === 'replica'} />
          </Column>
          <Column>
            <Title>Coriolis Replica</Title>
            <Message selected={this.props.selected === 'replica'}>The Coriolis Replica is obtained by copying (replicating) incrementally the virtual machines data from the source environment to the target, without interfering with any running workload. A migration replica can then be finalized by automatically applying the required changes to adapt it to the target environment (migration phase).</Message>
          </Column>
        </Row>
      </Wrapper>
    )
  }
}

export default WizardType
