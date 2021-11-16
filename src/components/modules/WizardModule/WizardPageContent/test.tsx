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
import TW from '@src/utils/TestWrapper'
import WizardPageContent from '.'

const wrap = (props: any) => new TW(shallow(
  <WizardPageContent
    wizardData={{}}
    onContentRef={() => { }}
    {...props}
  />
), 'wpContent')

describe('WizardPageContent Component', () => {
  it('renders wizard type page', () => {
    const wrapper = wrap({
      page: { id: 'type', title: 'Wizard Type' },
      type: 'replica',
    })
    expect(wrapper.findText('header')).toBe('Wizard Type Replica')
    expect(wrapper.shallow.find('WizardType').prop('selected')).toBe('replica')
  })
})



