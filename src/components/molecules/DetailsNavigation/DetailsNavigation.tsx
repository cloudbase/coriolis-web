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
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div<any>`
  ${StyleProps.exactWidth('128px')}
  display: flex;
  flex-direction: column;
`
const Item = styled(Link)<any>`
  font-size: 16px;
  color: ${props => (props.selected ? Palette.primary : Palette.grayscale[4])};
  cursor: pointer;
  margin-bottom: 13px;
  text-decoration: none;
`
type ItemType = { label: string, value: string }
type Props = {
  items: ItemType[],
  selectedValue?: string,
  itemId?: string,
  itemType?: string,
  customHref?: (item: ItemType) => string | null,
}
@observer
class DetailsNavigation extends React.Component<Props> {
  renderItems() {
    return (
      this.props.items.map(item => (
        <Item
          data-test-id={`detailsNavigation-${item.value}`}
          selected={item.value === this.props.selectedValue}
          key={item.value || item.label}
          to={this.props.customHref ? this.props.customHref(item) : `/${this.props.itemType || ''}${(item.value && '/') || ''}${item.value}/${this.props.itemId || ''}`}
        >{item.label}
        </Item>
      ))
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderItems()}
      </Wrapper>
    )
  }
}

export default DetailsNavigation
