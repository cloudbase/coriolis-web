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
import DropdownInput from '../DropdownInput'

const items = [{
  label: 'Name',
  value: 'name',
}, {
  label: 'ID',
  value: 'id',
}]
type Props = {
  disabled?: boolean,
  required?: boolean,
  highlight?: boolean,
}
type State = {
  selectedItem: string,
  inputValue: string
}
class Wrapper extends React.Component<Props, State> {
  state = {
    selectedItem: 'id',
    inputValue: '',
  }

  render() {
    return (
      <div style={{ marginLeft: '128px', background: 'white', padding: '42px' }}>
        <DropdownInput
          items={items}
          selectedItem={this.state.selectedItem}
          onItemChange={item => { this.setState({ selectedItem: item.value }) }}
          inputValue={this.state.inputValue}
          onInputChange={inputValue => { this.setState({ inputValue }) }}
          placeholder={this.state.selectedItem === 'id' ? 'The ID' : 'The Name'}
          disabled={this.props.disabled}
          highlight={this.props.highlight}
          required={this.props.required}
        />
      </div>
    )
  }
}

storiesOf('DropdownInput', module)
  .add('default', () => (
    <Wrapper />
  ))
  .add('disabled', () => (
    <Wrapper disabled />
  ))
  .add('required highlighted', () => (
    <Wrapper required highlight />
  ))
