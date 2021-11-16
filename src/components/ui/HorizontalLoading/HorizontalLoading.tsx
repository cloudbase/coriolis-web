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
import styled from 'styled-components'

import { ThemePalette } from '@src/components/Theme'

const Wrapper = styled.div<any>`
  position: relative;
  height: 2px;
  overflow: hidden;
`
const Loader = styled.div<any>`
  width: 8px;
  height: 2px;
  background: ${ThemePalette.primary};
  position: absolute;
  animation: move 1s linear infinite;
  @keyframes move {
    0% {left: -8px;}
    100% {left: 100%;}
  }
`
type Props = {
  style?: any,
  'data-test-id'?: string,
}

const HorizontalLoading = (props: Props) => (
  <Wrapper style={props.style} data-test-id={props['data-test-id'] || 'horizontalLoading'}>
    <Loader />
  </Wrapper>
)

export default HorizontalLoading
