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

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`
const Header = styled.div`
  display: flex;
  padding-bottom: 8px;
`
const HeaderData = styled.div`
  width: ${props => props.width};
  color: ${Palette.grayscale[3]};
  font-size: 10px;
  font-weight: ${StyleProps.fontWeights.medium};
  text-transform: uppercase;
`
const Body = styled.div`
  display: flex;
  flex-direction: column;
`
const Row = styled.div`
  display: flex;
  padding: 6px 0;
  border-top: 1px solid ${Palette.grayscale[2]};

  &:last-child {
    border-bottom: 1px solid ${Palette.grayscale[2]};
  }
`
const RowData = styled.div`
  width: ${props => props.width};
  color: ${Palette.grayscale[4]};
  ${props => props.customStyle}
`

class Table extends React.Component {
  static propTypes = {
    header: PropTypes.array.isRequired,
    items: PropTypes.array.isRequired,
    columnsStyle: PropTypes.array,
    className: PropTypes.string,
  }

  renderHeader() {
    let dataWidth = `${100 / this.props.header.length}%`
    return (
      <Header>
        {this.props.header.map(headerItem => {
          return (
            <HeaderData width={dataWidth} key={headerItem}>{headerItem}</HeaderData>
          )
        })}
      </Header>
    )
  }

  renderItems() {
    let dataWidth = `${100 / this.props.items.length}%`
    return (
      <Body>
        {this.props.items.map((row, i) => {
          return (
            <Row key={i}>
              {row.map((data, j) => {
                let columnStyle = ''

                if (this.props.columnsStyle) {
                  columnStyle = this.props.columnsStyle[j] || ''
                }

                return (
                  <RowData customStyle={columnStyle} width={dataWidth} key={`${i}-${j}`}>
                    {data}
                  </RowData>
                )
              })}
            </Row>
          )
        })}
      </Body>
    )
  }

  render() {
    return (
      <Wrapper className={this.props.className}>
        {this.renderHeader()}
        {this.renderItems()}
      </Wrapper>
    )
  }
}

export default Table
