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
import { storiesOf, action } from '@storybook/react'
import Button from './Button'

storiesOf('Button', module)
  .add('primary', () => (
    <Button onClick={action('clicked')}>Hello</Button>
  ))
  .add('secondary', () => (
    <Button secondary onClick={action('clicked')}>Hello</Button>
  ))
  .add('alert', () => (
    <Button alert onClick={action('clicked')}>Hello</Button>
  ))
  .add('hollow primary', () => (
    <Button hollow onClick={action('clicked')}>Hello</Button>
  ))
  .add('hollow secondary', () => (
    <Button hollow secondary onClick={action('clicked')}>Hello</Button>
  ))
  .add('hollow alert', () => (
    <Button hollow alert onClick={action('clicked')}>Hello</Button>
  ))
