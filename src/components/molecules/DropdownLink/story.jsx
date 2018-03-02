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
import { storiesOf } from '@storybook/react'
import DropdownLink from '.'

class Wrapper extends React.Component {
  constructor() {
    super()
    this.state = {
      items: [
        { label: 'Item 1', value: 'item-1' },
        { label: 'Item 2', value: 'item-2' },
        { label: 'Item 3', value: 'item-3' },
      ],
      selectedItem: 'item-1',
    }
  }

  handleItemChange(selectedItem) {
    this.setState({ selectedItem })
  }

  render() {
    return (
      <div style={{ marginLeft: '100px' }}>
        <DropdownLink
          items={this.state.items}
          selectedItem={this.state.selectedItem}
          onChange={item => { this.handleItemChange(item.value) }}
        />
      </div>
    )
  }
}

storiesOf('DropdownLink', module)
  .add('default', () => (
    <Wrapper />
  ))
