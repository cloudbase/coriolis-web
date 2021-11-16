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

/* eslint-disable react/jsx-props-no-spreading */

import React from 'react'
import { storiesOf } from '@storybook/react'
import DetailsContentHeader from '.'

const item = {
  origin_endpoint_id: 'openstack',
  destination_endpoint_id: 'azure',
  instances: ['The instance title'],
  executions: [{ status: 'COMPLETED', created_at: new Date() }],
}
const props: any = {}
storiesOf('DetailsContentHeader', module)
  .add('default', () => (
    <DetailsContentHeader
      item={item}
      {...props}
    />
  ))
  .add('action button', () => (
    <DetailsContentHeader
      item={item}
      {...props}

    />
  ))
  .add('running', () => (
    <DetailsContentHeader
      item={{ ...item, executions: [{ ...item.executions[0], status: 'RUNNING' }] }}
      {...props}

    />
  ))
  .add('description', () => (
    <DetailsContentHeader
      item={{ ...item, executions: null, description: 'Description text' }}
      {...props}
    />
  ))
  .add('alert pill', () => (
    <DetailsContentHeader
      item={item}
      alertInfoPill
      {...props}

    />
  ))
