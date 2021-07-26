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
import styled from 'styled-components'
import taiPasswordStrength from 'tai-password-strength'
import { ThemePalette, ThemeProps } from '@src/components/Theme'

const Wrapper = styled.div`
  display: flex;
  margin-left: -2px;
`
type Status = 'VERY_WEAK' | 'WEAK' | 'REASONABLE' | 'STRONG' | 'VERY_STRONG'
const colorForStatus = (status: Status) => {
  switch (status) {
    case 'WEAK':
      return ThemePalette.alert
    case 'REASONABLE':
      return ThemePalette.warning
    case 'STRONG':
      return '#758400'
    case 'VERY_STRONG':
      return 'green'
    default:
      return 'gray'
  }
}
const Bar = styled.div<{ status: Status }>`
  height: 4px;
  flex-grow: 1;
  background: ${props => colorForStatus(props.status)};
  border: 1px solid rgba(255,255,255,0.2);
  margin-left: 2px;
  transition: all ${ThemeProps.animations.swift};
`
type Props = {
  value: string
  style?: React.CSSProperties
}

@observer
class SetupPagePasswordStrength extends React.Component<Props> {
  render() {
    const strengthTester = new taiPasswordStrength.PasswordStrength()
    strengthTester.addCommonPasswords(taiPasswordStrength.commonPasswords)
    strengthTester.addTrigraphMap(taiPasswordStrength.trigraphs)
    let strengthCode: Status = strengthTester.check(this.props.value).strengthCode
    const STRENGTH_CODES: Status[] = ['VERY_WEAK', 'WEAK', 'REASONABLE', 'STRONG', 'VERY_STRONG']
    let strengthCodeIndex = STRENGTH_CODES.indexOf(strengthCode)
    if (strengthCode === 'VERY_WEAK') {
      strengthCode = 'WEAK'
      strengthCodeIndex = 1
    }
    return (
      <Wrapper style={this.props.style}>
        <Bar status={strengthCode} />
        <Bar status={strengthCodeIndex > 1 ? strengthCode : STRENGTH_CODES[0]} />
        <Bar status={strengthCodeIndex > 2 ? strengthCode : STRENGTH_CODES[0]} />
        <Bar status={strengthCodeIndex > 3 ? strengthCode : STRENGTH_CODES[0]} />
      </Wrapper>
    )
  }
}

export default SetupPagePasswordStrength
