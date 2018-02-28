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
import styled, { injectGlobal } from 'styled-components'

import reloadImage from './images/reload.svg'

const Wrapper = styled.div`
  width: 16px;
  height: 16px;
  background: url('${reloadImage}') no-repeat center;
  cursor: pointer;
`

injectGlobal`
  .reload-animation {
    transform: rotate(360deg);
    transition: transform 1s cubic-bezier(0, 1.4, 1, 1);
  }
`

type Props = {
  onClick: () => void,
}
class ReloadButton extends React.Component<Props> {
  wrapper: HTMLElement
  timeout: ?TimeoutID

  onClick() {
    if (this.timeout) {
      return
    }

    if (this.props.onClick) {
      this.props.onClick()
    }

    if (!this.wrapper) {
      return
    }

    this.wrapper.className += ' reload-animation'
    this.timeout = setTimeout(() => {
      this.wrapper.className = this.wrapper.className.substr(0, this.wrapper.className.indexOf(' reload-animation'))
      this.timeout = null
    }, 1000)
  }

  render() {
    return (
      <Wrapper innerRef={div => { this.wrapper = div }} {...this.props} onClick={() => { this.onClick() }} />
    )
  }
}

export default ReloadButton
