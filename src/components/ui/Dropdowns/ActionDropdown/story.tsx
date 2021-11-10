/*
Copyright (C) 2019  Cloudbase Solutions SRL
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
import ActionDropdown from '../ActionDropdown'

import Palette from '../../../styleUtils/Palette'

const actions = [{
  label: 'Execute',
  color: Palette.primary,
  action: () => { console.log('execute clicked') },
  disabled: true,
}, {
  label: 'Edit',
  action: () => { console.log('Edit clicked') },
}, {
  label: 'Delete',
  color: Palette.alert,
  action: () => { console.log('Delete clicked') },
}]

storiesOf('ActionDropdown', module)
  .add('default', () => (
    <ActionDropdown actions={actions} />
  ))
