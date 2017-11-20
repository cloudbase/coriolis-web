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
import { shallow } from 'enzyme'
import sinon from 'sinon'
import ReplicaMigrationOptions from './ReplicaMigrationOptions'

const wrap = props => shallow(<ReplicaMigrationOptions {...props} />)

it('dispatches cancel click', () => {
  let onCancelClick = sinon.spy()
  let wrapper = wrap({ onCancelClick })
  wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('Cancel') > -1).simulate('click')
  expect(onCancelClick.calledOnce).toBe(true)
})

it('dispatches migrate click', () => {
  let onMigrateClick = sinon.spy()
  let wrapper = wrap({ onMigrateClick })
  wrapper.findWhere(w => w.name() === 'Button' && w.html().indexOf('Migrate') > -1).simulate('click')
  expect(onMigrateClick.args[0][0][0].name).toBe('clone_disks')
  expect(onMigrateClick.args[0][0][0].value).toBe(true)
})
