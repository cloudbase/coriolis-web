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
import StatusPill from './StatusPill'

storiesOf('StatusPill', module)
  .add('completed', () => (
    <StatusPill status="COMPLETED" />
  ))
  .add('completed small', () => (
    <StatusPill status="COMPLETED" small />
  ))
  .add('running', () => (
    <StatusPill status="RUNNING" />
  ))
  .add('error', () => (
    <StatusPill status="ERROR" />
  ))
  .add('canceled', () => (
    <StatusPill status="CANCELED" />
  ))
  .add('paused', () => (
    <StatusPill status="PAUSED" />
  ))
  .add('info primary', () => (
    <StatusPill status="INFO" />
  ))
  .add('info secondary', () => (
    <StatusPill status="INFO" secondary />
  ))
  .add('info alert', () => (
    <StatusPill status="INFO" alert />
  ))
