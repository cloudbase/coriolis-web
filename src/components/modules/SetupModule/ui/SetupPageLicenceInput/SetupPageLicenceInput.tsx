/*
Copyright (C) 2021  Cloudbase Solutions SRL
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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'
import { SetupPageLicenceType } from '@src/@types/InitialSetup'
import { ThemePalette, ThemeProps } from '@src/components/Theme'
import licenceImage from './resources/licenceImage.svg'
import trialLicenceImage from './resources/trialLicenceImage.svg'

const Wrapper = styled.div`
  display: flex;
`
const getLicenceTypeBackground = (type: SetupPageLicenceType) => (type === 'paid' ? '#bdc2d0' : '#f1d5dc')

const ButtonInput = styled.div<{
  selected?: boolean,
  type: SetupPageLicenceType
}>`
  background: ${props => getLicenceTypeBackground(props.type)};
  border-radius: 4px;
  color: ${ThemePalette.black};
  border: 2px solid ${props => (props.selected ? ThemePalette.primary : getLicenceTypeBackground(props.type))};
  padding: 5px;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  margin-right: 16px;
  width: 100px;
  transition: all ${ThemeProps.animations.swift};
`
const Image = css`
  height: 48px;
`
const LicenceImage = styled.img`
  ${Image}
`
const TrialLicenceImage = styled.img`
  ${Image}
`
const Label = styled.div``
type Props = {
  licenceType: SetupPageLicenceType
  onLicenceTypeChange: (type: SetupPageLicenceType) => void
  style?: React.CSSProperties
}

@observer
class SetupPageLicenceInput extends React.Component<Props> {
  render() {
    return (
      <Wrapper style={this.props.style}>
        <ButtonInput
          selected={this.props.licenceType === 'trial'}
          onClick={() => { this.props.onLicenceTypeChange('trial') }}
          type="trial"
        >
          <TrialLicenceImage src={trialLicenceImage} />
          <Label>Trial Licence</Label>
        </ButtonInput>
        <ButtonInput
          selected={this.props.licenceType === 'paid'}
          onClick={() => { this.props.onLicenceTypeChange('paid') }}
          type="paid"
        >
          <LicenceImage src={licenceImage} />
          <Label>Paid Licence</Label>
        </ButtonInput>
      </Wrapper>
    )
  }
}

export default SetupPageLicenceInput
