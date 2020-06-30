/*
Copyright (C) 2018  Cloudbase Solutions SRL
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
import ScheduleItem from '.'

const colWidths = ['6%', '18%', '10%', '18%', '10%', '10%', '23%', '5%']

const Wrapper = (props: any) => (
  <div style={{ width: '924px' }}>
    <ScheduleItem
      onChange={() => { }}
      onDeleteClick={() => { }}
      onSaveSchedule={() => { }}
      onShowOptionsClick={() => { }}
      unsavedSchedules={[]}
      timezone="local"
      colWidths={colWidths}
      item={{
        id: 'schedule-1',
        enabled: props.enabled,
        schedule: {
          hour: 1, minute: 1, dow: 2, dom: 3, month: 5,
        },
        expiration_date: new Date(2018, 3, 25, 4, 0, 0),
        shutdown_instances: props.shutdown_instances,
      }}
    />
  </div>
)

storiesOf('ScheduleItem', module)
  .add('default', () => (
    <Wrapper enabled={false} shutdown_instances={false} />
  ))
  .add('enabled with shutdown_instances', () => (
    <Wrapper enabled shutdown_instances />
  ))
