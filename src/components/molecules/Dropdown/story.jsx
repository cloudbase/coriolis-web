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
import Dropdown from './Dropdown'

const items = [
  { label: 'Item 1', value: 'item-1' },
  { label: 'Item 2', value: 'item-2' },
  { label: 'Item 3', value: 'item-3' },
]

class Wrapper extends React.Component {
  constructor() {
    super()
    this.state = {
      selectedItem: null,
    }
  }

  handleChange(selectedItem) {
    this.setState({ selectedItem })
  }

  render() {
    return (
      <Dropdown
        {...this.props}
        items={items}
        selectedItem={this.state.selectedItem}
        onChange={item => { this.handleChange(item) }}
      />
    )
  }
}

storiesOf('Dropdown', module)
  .add('default', () => (
    <Wrapper />
  ))
  .add('disabled', () => (
    <Wrapper disabled />
  ))
