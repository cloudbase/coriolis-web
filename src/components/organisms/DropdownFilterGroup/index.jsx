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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import DropdownLink from '../../molecules/DropdownLink'

import Palette from '../../styleUtils/Palette'

const Wrapper = styled.div``
const Dropdowns = styled.div``
const DropdownLinkStyled = styled(DropdownLink)`
  margin-right: 32px;
  position: relative;

  &:after {
    position: absolute;
    content: '';
    width: 1px;
    height: 18px;
    background: ${Palette.grayscale[4]};
    right: -16px;
    top: -1px;
  }
`

type Props = {
  items: React.ElementProps<typeof DropdownLink>[]
}
@observer
class DropdownFilterGroup extends React.Component<Props> {
  renderDropdowns() {
    return (
      <Dropdowns>
        {this.props.items.map(config => <DropdownLinkStyled {...config} />)}
      </Dropdowns>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderDropdowns()}
      </Wrapper>
    )
  }
}

export default DropdownFilterGroup
