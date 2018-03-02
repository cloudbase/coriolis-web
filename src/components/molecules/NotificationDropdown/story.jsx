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
import NotificationDropdown from '.'

storiesOf('NotificationDropdown', module)
  .add('default', () => (
    <div style={{ marginLeft: '200px' }}><NotificationDropdown /></div>
  ))
  .add('white', () => (
    <div style={{ marginLeft: '200px' }}><NotificationDropdown white /></div>
  ))
  .add('notification types', () => (
    <div style={{ marginLeft: '200px' }}>
      <NotificationDropdown
        items={[
          {
            id: new Date().getTime(),
            message: 'A full VM migration between two clouds',
            level: 'success',
            options: { persistInfo: { title: 'Migration' } },
          },
          {
            id: new Date().getTime(),
            message: 'Incrementally replicate virtual machines',
            level: 'error',
            options: { persistInfo: { title: 'Replica' } },
          },
          {
            id: new Date().getTime(),
            message: 'A conection to a public or private cloud',
            level: 'info',
            options: { persistInfo: { title: 'Endpoint' } },
          },
        ]}
      />
    </div>
  ))
