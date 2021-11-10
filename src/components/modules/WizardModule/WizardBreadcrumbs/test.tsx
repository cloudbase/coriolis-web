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
import WizardBreadcrumbs from '.'
import TW from '../../../utils/TestWrapper'
import { wizardPages } from '../../../../constants'

const wrap = props => new TW(
  shallow(<WizardBreadcrumbs pages={wizardPages} destinationProvider="oci" sourceProvider="vmware_vsphere" {...props} />),
  'wBreadCrumbs'
)

describe('WizardBreadcrumbs Component', () => {
  it('has correct page selected', () => {
    let wrapper = wrap({ selected: wizardPages[3] })
    expect(wrapper.findText(`name-${wizardPages[3].id}`)).toBe(wizardPages[3].breadcrumb)
  })
})



