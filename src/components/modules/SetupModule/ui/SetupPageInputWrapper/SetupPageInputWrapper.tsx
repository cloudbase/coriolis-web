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

const Wrapper = styled.div`
  margin-top: 16px;
`
const Label = styled.div`
  text-transform: uppercase;
  font-size: 9px;
`
const Input = styled.div``
type Props = {
  label: string
  style?: React.CSSProperties
}

@observer
class SetupPageInputWrapper extends React.Component<Props> {
  render() {
    return (
      <Wrapper>
        <Label>{this.props.label}</Label>
        <Input>{this.props.children}</Input>
      </Wrapper>
    )
  }
}

export default SetupPageInputWrapper
