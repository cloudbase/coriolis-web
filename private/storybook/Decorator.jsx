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
import PropTypes from 'prop-types'
import Palette from '../../src/components/styleUtils/Palette'

const Wrapper = styled.div`
  background: ${Palette.grayscale[7]};
  padding: 32px;
`

const Decorator = ({ children }) => <Wrapper>{children}</Wrapper>

Decorator.propTypes = {
  children: PropTypes.node,
}

export default Decorator
