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
import styled from 'styled-components'
import { storiesOf } from '@storybook/react'
import StatusPill from '.'

const Wrapper = styled.div<any>`
  display: flex;
  flex-wrap: wrap;
`
const STATUSES = [
  'UNEXECUTED',
  'SCHEDULED',
  'UNSCHEDULED',
  'COMPLETED',
  'STARTING',
  'RUNNING',
  'PENDING',
  'CANCELLING',
  'CANCELLING_AFTER_COMPLETION',
  'CANCELED',
  'CANCELED_AFTER_COMPLETION',
  'CANCELED_FOR_DEBUGGING',
  'FORCE_CANCELED',
  'ERROR',
  'FAILED_TO_SCHEDULE',
  'DEADLOCKED',
  'STRANDED_AFTER_DEADLOCK',
  // Minion Pool statuses
  'INITIALIZED',
  'UNINITIALIZED',
  'UNINITIALIZING',
  'INITIALIZING',
  'DEALLOCATING',
  'DEALLOCATED',
  'ALLOCATING',
  'ALLOCATED',
  'RECONFIGURING',
]

const renderAllStatuses = (small?: boolean) => (
  <Wrapper>
    {STATUSES.map(status => (
      <span style={{ marginLeft: '16px', marginBottom: '16px' }} key={status}>
        {status}
        <StatusPill
          key={status}
          status={status}
          small={small || false}
        />
      </span>
    ))}
  </Wrapper>
)

storiesOf('StatusPill', module)
  .add('all statuses', () => renderAllStatuses())
  .add('all statuses small', () => renderAllStatuses(true))
  .add('paused', () => (
    <StatusPill status="PAUSED" />
  ))
  .add('info', () => (
    <StatusPill status="INFO" />
  ))
  .add('info secondary', () => (
    <StatusPill status="INFO" secondary />
  ))
  .add('info alert', () => (
    <StatusPill status="INFO" alert />
  ))
