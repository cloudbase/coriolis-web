/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tooltip from '.'

describe('Tooltip', () => {
  it('renders', async () => {
    render(
      <div>
        <div>
          <div className="tooltip-anchor" data-tip="Tooltip text">Tooltip</div>
        </div>
        <Tooltip />
      </div>,
    )
    expect(document.querySelector('.reactTooltip')).toBeFalsy()

    userEvent.hover(document.querySelector('.tooltip-anchor')!)
    expect(document.querySelector('.reactTooltip')).toBeTruthy()
    expect(document.querySelector('.reactTooltip')!.textContent).toContain('Tooltip text')
  })
})
