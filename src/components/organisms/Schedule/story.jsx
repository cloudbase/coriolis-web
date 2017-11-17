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
import styled from 'styled-components'

import Schedule from './Schedule'

const Wrapper = styled.div`
  padding: 32px;
  background: white;
`

storiesOf('Schedule', module)
  .add('no schedules', () => (
    <Wrapper><Schedule /></Wrapper>
  ))
  .add('no schedules secondary', () => (
    <Wrapper><Schedule secondaryEmpty /></Wrapper>
  ))
  .add('enabled/disabled schedules', () => (
    <Wrapper><Schedule
      schedules={[{}, { enabled: true }]}
    /></Wrapper>
  ))
  .add('some date values schedules', () => (
    <Wrapper><Schedule
      schedules={[
        { schedule: { dom: 2, dow: 3, month: 2, hour: 13, minute: 29 }, expiration_date: new Date() },
        { enabled: true, schedule: { dom: 2, dow: 3, month: 2, hour: 13, minute: 29 }, expiration_date: new Date() }]}
    /></Wrapper>
  ))
