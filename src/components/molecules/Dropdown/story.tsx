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

/* eslint-disable max-classes-per-file */

import React from 'react'
import { storiesOf } from '@storybook/react'
import Dropdown from '.'

const items = [
  { label: 'Item 1', value: 'item-1' },
  { label: 'Item 2 - contains a very long label that doesn\'t really fit', value: 'item-2' },
  { label: 'containsaverylonglabelwhichalsodoesntcontainwhitespaces', value: 'item-2a' },
  { label: 'Item 3', value: 'item-3' },
  { label: 'Item 3', value: 'item-3-duplicated' },
]

class Wrapper extends React.Component<any, any> {
  state = {
    selectedItem: null,
  }

  handleChange(selectedItem: any) {
    this.setState({ selectedItem })
  }

  render() {
    return (
      <Dropdown
        items={items}
        selectedItem={this.state.selectedItem}
        onChange={item => { this.handleChange(item) }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...this.props}
      />
    )
  }
}

type Props = {
  items: any[],
}
type State = {
  selectedItems: string[],
}

/* eslint react/no-multi-comp: off */
class MultipleSelectionWrapper extends React.Component<Props, State> {
  state = {
    selectedItems: [],
  }

  render() {
    return (
      <Dropdown
        multipleSelection
        selectedItems={this.state.selectedItems}
        onChange={item => {
          console.log('state', this.state)
          const itemIndex = this.state.selectedItems.findIndex(i => i === item.value)
          if (itemIndex > -1) {
            this.setState(prevState => ({
              selectedItems: prevState.selectedItems.filter(i => i !== item.value),
            }))
          } else {
            this.setState(prevState => ({
              selectedItems: [...prevState.selectedItems, item.value],
            }))
          }
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...this.props}
      />
    )
  }
}

storiesOf('Dropdown', module)
  .add('default', () => (
    <Wrapper />
  ))
  .add('required', () => (
    <Wrapper required />
  ))
  .add('disabled', () => (
    <Wrapper disabled />
  ))
  .add('long list', () => (
    <Wrapper
      items={[
        { label: 'Item 1', value: 'item-1' },
        { label: 'Item 2', value: 'item-2' },
        { label: 'Item 3', value: 'item-3' },
        { label: 'Item 4', value: 'item-4' },
        { separator: true },
        { label: 'Item 1', value: 'item-1' },
        { label: 'Item 2', value: 'item-2' },
        { label: 'Item 3', value: 'item-3' },
        { label: 'Item 4', value: 'item-4' },
        { label: 'Item 1', value: 'item-1' },
        { label: 'Item 2', value: 'item-2' },
        { label: 'Item 3', value: 'item-3' },
        { label: 'Item 4', value: 'item-4' },
        { label: 'Item - contains a very long label that doesn\'t really fit', value: 'item-1' },
        { label: 'Item - contains a very long label that doesn\'t really fit', value: 'item-1' },
        { label: 'containsaverylonglabelwhichalsodoesntcontainwhitespaces', value: 'item-2' },
        { label: 'containsaverylonglabelwhichalsodoesntcontainwhitespaces', value: 'item-2' },
        { label: 'Item 3', value: 'item-3' },
        { label: 'Item 4', value: 'item-4' },
        { label: 'Item 1', value: 'item-1' },
        { label: 'Item 2', value: 'item-2' },
        { label: 'Item 3', value: 'item-3' },
        { label: 'Item 4', value: 'item-4' },
      ]}
    />
  ))
  .add('multiple selection', () => (
    <MultipleSelectionWrapper
      items={[
        { value: 'owner' },
        { value: 'admin' },
        { value: 'member_1', label: 'member' },
        { value: 'member_2', label: 'member' },
      ]}
    />
  ))
  .add('subtitle label', () => (
    <Wrapper items={[
      {
        label: 'Item 1',
        value: 'item-1',
        subtitleLabel: 'Pool is in UNALLOCATED status instead of being ALLOCATED.',
        disabled: true,
      },
      { label: 'Item 2', value: 'item-2' },
      { label: 'Item 3', value: 'item-3' },
      { label: 'Item 4', value: 'item-4' },
      { separator: true },
      { label: 'Item 1', value: 'item-1' },
    ]}
    />
  ))
