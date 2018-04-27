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

// @flow

import React from 'react'
import { shallow } from 'enzyme'
import WizardBreadcrumbs from '.'
import TW from '../../../utils/TestWrapper'
import { wizardConfig } from '../../../config'

const wrap = props => new TW(shallow(<WizardBreadcrumbs {...props} />), 'wBreadCrumbs')

describe('WizardBreadcrumbs Component', () => {
  it('renders correct number of crumbs for replica', () => {
    let wrapper = wrap({ selected: wizardConfig.pages[2], wizardType: 'replica' })
    let pages = wizardConfig.pages.filter(p => !p.excludeFrom || p.excludeFrom !== 'replica')
    expect(wrapper.find('name-', true).length).toBe(pages.length)
  })

  it('renders correct number of crumbs for migration', () => {
    let wrapper = wrap({ selected: wizardConfig.pages[2], wizardType: 'migration' })
    let pages = wizardConfig.pages.filter(p => !p.excludeFrom || p.excludeFrom !== 'migration')
    expect(wrapper.find('name-', true).length).toBe(pages.length)
  })

  it('has correct page selected', () => {
    let pages = wizardConfig.pages.filter(p => !p.excludeFrom || p.excludeFrom !== 'migration')
    let wrapper = wrap({ selected: pages[2], wizardType: 'migration' })
    expect(wrapper.findText(`name-${pages[2].id}`)).toBe(pages[2].breadcrumb)
  })
})
