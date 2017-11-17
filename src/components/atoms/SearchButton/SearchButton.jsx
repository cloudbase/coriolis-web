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
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Palette from '../../styleUtils/Palette'

import searchImage from './images/search.js'

const Wrapper = styled.div`display: flex;`

const Icon = styled.div`
  width: 16px;
  height: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`

class SearchButton extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    primary: PropTypes.bool,
  }

  render() {
    return (
      <Wrapper className={this.props.className} {...this.props}>
        <Icon dangerouslySetInnerHTML={{
          __html: searchImage(this.props.primary ? Palette.primary : Palette.grayscale[4]),
        }}
        />
      </Wrapper>
    )
  }
}

export default SearchButton
