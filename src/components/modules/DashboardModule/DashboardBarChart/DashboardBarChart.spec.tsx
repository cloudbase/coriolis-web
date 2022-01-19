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
import TestUtils from '@tests/TestUtils'
import { ThemePalette } from '@src/components/Theme'
import userEvent from '@testing-library/user-event'
import DashboardBarChart from '.'

const DATA: DashboardBarChart['props']['data'] = [
  {
    label: 'label 1',
    values: [10, 15],
    data: 'data 1',
  },
  {
    label: 'label 2',
    values: [20, 25],
    data: 'data 2',
  },
]

describe('DashboardBarChart', () => {
  it('renders all data correctly', () => {
    render(<DashboardBarChart data={DATA} yNumTicks={3} />)

    // Y ticks

    const yTickEl = TestUtils.selectAll('DashboardBarChart__YTick')
    expect(yTickEl.length).toBe(3)
    expect(yTickEl[0].textContent).toBe('0')
    expect(yTickEl[1].textContent).toBe('20')
    expect(yTickEl[2].textContent).toBe('40')

    // Bars

    const barsEl = TestUtils.selectAll('DashboardBarChart__Bar-')
    expect(barsEl.length).toBe(DATA.length)
    expect(barsEl[0].textContent).toBe('label 1')
    expect(barsEl[1].textContent).toBe('label 2')
  })

  it.each`
    barIndex | stackedBarIndex | expectedHeight                    | expectedColor
    ${0}     | ${0}            | ${(DATA[0].values[1] / 45) * 100} | ${ThemePalette.alert}
    ${0}     | ${1}            | ${(DATA[0].values[0] / 45) * 100} | ${ThemePalette.primary}
    ${1}     | ${0}            | ${(DATA[1].values[1] / 45) * 100} | ${ThemePalette.alert}
    ${1}     | ${1}            | ${(DATA[1].values[0] / 45) * 100} | ${ThemePalette.primary}
  `('renders bar index $barIndex, stacked bar index $stackedBarIndex with height $expectedHeight and color $expectedColor', ({
    barIndex, stackedBarIndex, expectedHeight, expectedColor,
  }) => {
    render(<DashboardBarChart data={DATA} yNumTicks={3} colors={[ThemePalette.alert, ThemePalette.primary]} />)

    const stackedBarEl = TestUtils.selectAll('DashboardBarChart__StackedBar-', TestUtils.selectAll('DashboardBarChart__Bar-')[barIndex])[stackedBarIndex]
    const style = window.getComputedStyle(stackedBarEl)

    expect(parseFloat(style.height)).toBeCloseTo(expectedHeight)
    expect(TestUtils.rgbToHex(style.background)).toBe(expectedColor)
  })

  it.each`
  barIndex | stackedBarIndex | expectedData
  ${0}     | ${0}            | ${DATA[0]}
  ${0}     | ${1}            | ${DATA[0]}
  ${1}     | ${0}            | ${DATA[1]}
  ${1}     | ${1}            | ${DATA[1]}
`('fires mouse position with correct data on bar mouse enter, bar index $barIndex, stacked bar index $stackedBarIndex', ({ barIndex, stackedBarIndex, expectedData }) => {
    const onBarMouseEnter = jest.fn()
    render(<DashboardBarChart data={DATA} yNumTicks={3} onBarMouseEnter={onBarMouseEnter} />)
    userEvent.hover(TestUtils.selectAll('DashboardBarChart__StackedBar-', TestUtils.selectAll('DashboardBarChart__Bar-')[barIndex])[stackedBarIndex])
    expect(onBarMouseEnter).toHaveBeenCalledWith({ x: 48, y: 65 }, expectedData)
  })
})
