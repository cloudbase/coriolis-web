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
import Timeline from '.'

let items = [
  { id: 'item-1', status: 'ERROR', created_at: new Date() },
  { id: 'item-2', status: 'COMPLETED', created_at: new Date() },
  { id: 'item-3', status: 'RUNNING', created_at: new Date() },
]

class Wrapper extends React.Component {
  constructor() {
    super()
    this.state = { selectedItem: items[2] }
  }

  handleItemClick(selectedItem) {
    this.setState({ selectedItem })
  }

  handlePreviousClick() {
    let selectedIndex = items.findIndex(e => e.id === this.state.selectedItem.id)

    if (selectedIndex === 0) {
      return
    }

    this.setState({ selectedItem: items[selectedIndex - 1] })
  }

  handleNextClick() {
    let selectedIndex = items.findIndex(e => e.id === this.state.selectedItem.id)

    if (selectedIndex >= items.length - 1) {
      return
    }

    this.setState({ selectedItem: items[selectedIndex + 1] })
  }

  render() {
    return (
      <Timeline
        {...this.props}
        onPreviousClick={() => { this.handlePreviousClick() }}
        onNextClick={() => { this.handleNextClick() }}
        onItemClick={item => { this.handleItemClick(item) }}
        selectedItem={this.state.selectedItem}
        items={items}
      />
    )
  }
}

storiesOf('Timeline', module)
  .add('default', () => (
    <div style={{ width: '800px' }}>
      <Timeline />
    </div>
  ))
  .add('with items', () => (
    <div style={{ width: '800px' }}>
      <Wrapper />
    </div>
  ))
