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
import { css } from 'styled-components'
import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import Table from './Table'

let items = [
  ['item-1', 'item-2', 'item-3', 'item-4', 'item-5'],
  ['item-6', 'item-7', 'item-8', 'item-9', 'item-10'],
]
let header = ['Header 1', 'Header 2', 'Header 3', 'Header 4', 'Header 5']

storiesOf('Table', module)
  .add('default', () => (
    <div style={{ width: '300px' }}>
      <Table
        header={header}
        items={items}
      />
    </div>
  ))
  .add('styled column', () => (
    <div style={{ width: '300px' }}>
      <Table
        header={header}
        items={items}
        columnsStyle={[
          css`font-weight: ${StyleProps.fontWeights.medium};`,
          css`color: ${Palette.alert};`,
        ]}
      />
    </div>
  ))
