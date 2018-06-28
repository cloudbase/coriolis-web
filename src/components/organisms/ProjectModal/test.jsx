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
import sinon from 'sinon'
import TW from '../../../utils/TestWrapper'
import type { Project } from '../../../types/Project'
import ProjectModal from '.'

type Props = {
  project?: ?Project,
  isNewProject?: boolean,
  loading: boolean,
  onRequestClose: () => void,
  onUpdateClick: (project: Project) => void,
}

const wrap = (props: Props) => new TW(shallow(<ProjectModal {...props} />), 'projectModal')

describe('ProjectModal Component', () => {
  it('doesn\'t dispatch click if project name is not filled', () => {
    let onUpdateClick = sinon.spy()
    let wrapper = wrap({
      isNewProject: true,
      loading: false,
      onRequestClose: () => { },
      onUpdateClick,
    })
    expect(wrapper.findText('updateButton', false, true)).toBe('New Project')
    wrapper.find('updateButton').click()
    expect(onUpdateClick.called).toBe(false)
    expect(wrapper.find('field-project_name').prop('highlight')).toBe(true)
  })

  it('dispatches click if project is filled', () => {
    let onUpdateClick = sinon.spy()
    let wrapper = wrap({
      isNewProject: false,
      project: { id: 'project', name: 'Project Name' },
      loading: false,
      onRequestClose: () => { },
      onUpdateClick,
    })
    expect(wrapper.findText('updateButton', false, true)).toBe('Update Project')
    wrapper.find('updateButton').click()
    expect(onUpdateClick.called).toBe(true)
  })

  it('has disabled fields on loading', () => {
    let wrapper = wrap({
      isNewProject: false,
      project: { id: 'project', name: 'Project Name' },
      loading: true,
      onRequestClose: () => { },
      onUpdateClick: () => { },
    })
    expect(wrapper.find('updateButton').prop('disabled')).toBe(true)
    expect(wrapper.find('field-project_name').prop('disabled')).toBe(true)
  })
})
