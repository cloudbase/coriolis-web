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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import DropdownLink from '../DropdownLink/DropdownLink'

import { ThemePalette } from '../../../Theme'

const Wrapper = styled.div<any>``
const Dropdowns = styled.div<any>``
const DropdownLinkStyled = styled(DropdownLink)`
  margin-right: 32px;
  position: relative;

  &:after {
    position: absolute;
    content: '';
    width: 1px;
    height: 18px;
    background: ${ThemePalette.grayscale[4]};
    right: -16px;
    top: -1px;
  }
`

type Props = {
  items: (DropdownLink['props'] & { key: string })[]
}
@observer
class DropdownFilterGroup extends React.Component<Props> {
  renderDropdowns() {
    return (
      <Dropdowns>
        {
          // eslint-disable-next-line react/jsx-props-no-spreading
          this.props.items.map(config => <DropdownLinkStyled data-test-id={`dfGroup-dropdown-${config.key}`} {...config} />)
}
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
