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
import { observer } from 'mobx-react'
import { createGlobalStyle } from 'styled-components'
import ReactTooltip from 'react-tooltip'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const GlobalStyle = createGlobalStyle`
  .reactTooltip {
    color: ${Palette.grayscale[4]} !important;
    background: ${Palette.grayscale[1]} !important;
    max-width: 192px;
    padding: 8px !important;
    box-shadow: 0 0 9px 1px rgba(32, 34, 52, 0.1);
    margin-left: 12px !important;
    opacity: 1 !important;
    z-index: 999999 !important;
    transition: opacity ${StyleProps.animations.swift} !important;
    &:after {
      border-right-color: ${Palette.grayscale[1]} !important;
      border-right-width: 8px !important;
      left: -8px !important;
      border-top-width: 8px !important;
      border-bottom-width: 8px !important;
      margin-top: -8px !important;
    }
  }
`

@observer
class Tooltip extends React.Component<{}> {
  intervalId: number | undefined

  componentDidMount() {
    if (this.intervalId) {
      return
    }
    this.intervalId = setInterval(() => {
      ReactTooltip.rebuild()
    }, 1000)
  }

  render() {
    return (
      <>
        <GlobalStyle />
        <ReactTooltip place="right" effect="solid" className="reactTooltip" />
      </>
    )
  }
}

export default Tooltip
