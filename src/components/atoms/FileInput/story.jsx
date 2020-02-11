/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

// @flow

import React from 'react'
import { storiesOf } from '@storybook/react'
import FileInput from '.'

storiesOf('FileInput', module)
  .add('default', () => <FileInput />)
  .add('disabled loading', () => <FileInput disabledLoading />)
  .add('required', () => <FileInput required />)
  .add('disabled', () => <FileInput disabled />)
  .add('custom width', () => <FileInput required width={300} />)
  .add('highlight', () => <FileInput required highlight />)
