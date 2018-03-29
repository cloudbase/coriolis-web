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
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Palette from '../../styleUtils/Palette'

import searchImage from './images/search.js'
import filterImage from './images/filter.js'

const Wrapper = styled.div`
display: inline-block;
`
const Icon = styled.div`
  width: 16px;
  height: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`

type Props = {
  className: string,
  primary: boolean,
  useFilterIcon: boolean,
}
@observer
class SearchButton extends React.Component<Props> {
  render() {
    return (
      <Wrapper className={this.props.className} {...this.props}>
        <Icon dangerouslySetInnerHTML={{
          __html: this.props.useFilterIcon ?
            filterImage(Palette.grayscale[3]) :
            searchImage(this.props.primary ? Palette.primary : Palette.grayscale[4]),
        }}
        />
      </Wrapper>
    )
  }
}

export default SearchButton
