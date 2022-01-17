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
import Panel from '.'

const navigationItems = [
  { value: 'dest_options', label: 'Destination Options' },
  { value: 'network', label: 'Network Mapping' },
  { value: 'storage', label: 'Storage Mapping' },
]

storiesOf('Panel', module)
  .add('default', () => (
    <div style={{ width: '800px', height: '560px' }}>
      <Panel
        content={<div>Content</div>}
        navigationItems={navigationItems}
        selectedValue="network"
        onChange={item => console.log(item, 'clicked')}
        onReloadClick={() => { }}
        reloadLabel=""
      />
    </div>
  ))
