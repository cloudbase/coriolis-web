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
import styled from 'styled-components'

import Palette from '../../../styleUtils/Palette'
import StyleProps from '../../../styleUtils/StyleProps'
import generic64Image from './generic-64.svg'
import generic128Image from './generic-128.svg'
import generic128DisabledImage from './generic-128-disabled.svg'

const Wrapper = styled.div`
  text-align: center;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: -1px;
`
const Logo = styled.div`
  ${props => StyleProps.exactWidth(`${props.width}px`)}
  ${props => StyleProps.exactHeight(`${props.height}px`)}
  background: url(${props => props.image}) center no-repeat;
`

type Props = {
  name: string,
  size: { w: number, h: number },
  disabled: ?boolean,
  white: ?boolean,
}
class Generic extends React.Component<Props> {
  render32Generic(white: ?boolean) {
    return (
      <Wrapper style={{
        fontSize: '14px',
        color: white ? 'white' : Palette.grayscale[4],
      }}
      >
        {this.props.name}
      </Wrapper>
    )
  }

  render42Generic() {
    return (
      <Wrapper style={{
        fontSize: '18px',
        color: Palette.grayscale[4],
      }}
      >
        {this.props.name}
      </Wrapper>
    )
  }

  render64Generic() {
    return (
      <Wrapper style={{
        fontSize: '22px',
        color: Palette.black,
        textAlign: 'left',
      }}
      >
        <Logo width={49} height={43} image={generic64Image} style={{ marginRight: '9px' }} />
        {this.props.name}
      </Wrapper>
    )
  }

  render128Generic(disabled: ?boolean) {
    return (
      <Wrapper style={{
        fontSize: '22px',
        color: disabled ? Palette.grayscale[3] : Palette.black,
        textAlign: 'left',
        flexDirection: 'column',
      }}
      >
        <Logo
          width={80}
          height={70}
          image={disabled ? generic128DisabledImage : generic128Image}
          style={{ marginBottom: '4px' }}
        />
        {this.props.name}
      </Wrapper>
    )
  }

  render() {
    switch (this.props.size.h) {
      case 32:
        return this.render32Generic(this.props.white)
      case 42:
        return this.render42Generic()
      case 64:
        return this.render64Generic()
      case 128:
        return this.render128Generic(this.props.disabled)
      default:
        return null
    }
  }
}

export default Generic
