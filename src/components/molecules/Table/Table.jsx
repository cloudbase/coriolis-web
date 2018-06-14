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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  ${props => props.secondary ? css`
    &:after {
      content: ' ';
      height: 4px;
      background: ${Palette.grayscale[1]};
      border-bottom-left-radius: ${StyleProps.borderRadius};
      border-bottom-right-radius: ${StyleProps.borderRadius};
    }
  ` : ''}
`
const Header = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.secondary ? Palette.grayscale[5] : Palette.grayscale[2]};
  ${props => props.secondary ? css`
    padding: 8px;
    background: ${Palette.grayscale[1]};
    border-top-left-radius: ${StyleProps.borderRadius};
    border-top-right-radius: ${StyleProps.borderRadius};
  ` : css`
    padding-bottom: 8px;
  `}
  ${props => props.customStyle}
`
const TableData = props => css`
  width: 100%;
  max-width: ${props.width};
  padding-right: 32px;
  &:last-child {
    padding-right: 0;
  }
`
const HeaderData = styled.div`
  ${props => TableData(props)}
  color: ${props => props.secondary ? Palette.grayscale[5] : Palette.grayscale[3]};
  font-size: 10px;
  font-weight: ${StyleProps.fontWeights.medium};
  text-transform: uppercase;
  line-height: 16px;
`
const Body = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 238px;
  overflow: auto;
  ${props => props.customStyle}
`
const Row = styled.div`
  display: flex;
  padding: ${props => props.secondary ? '8px' : '8px 0'};
  ${props => props.secondary ? `background: ${Palette.grayscale[1]};` : ''}
  border-bottom: 1px solid ${props => props.secondary ? 'white' : Palette.grayscale[2]};
  flex-shrink: 0;
  ${props => props.secondary ? css`
    &:last-child {
      border-bottom: 0;
      padding-bottom: 4px;
    }
  ` : ''}
`
const RowData = styled.div`
  ${props => TableData(props)}
  color: ${Palette.grayscale[4]};
  ${props => props.customStyle};
  overflow: hidden;
  text-overflow: ellipsis;
`
const NoItems = styled.div`
  text-align: center;
  padding: 16px;
  margin-left: 24px;
  ${props => props.secondary ? `background: ${Palette.grayscale[1]};` : ''}
`

type Props = {
  header: React.Node[],
  items: Array<Array<React.Node>>,
  columnsStyle?: mixed[],
  columnsWidths?: string[],
  className?: string,
  useSecondaryStyle?: boolean,
  noItemsLabel?: string,
  bodyStyle?: any,
  headerStyle?: any,
}
@observer
class Table extends React.Component<Props> {
  static defaultProps: $Shape<Props> = {
    columnsWidths: [],
    noItemsLabel: 'No items!',
  }

  renderHeader() {
    let dataWidth = `${100 / this.props.header.length}%`
    return (
      <Header secondary={this.props.useSecondaryStyle} customStyle={this.props.headerStyle}>
        {this.props.header.map((headerItem, i) => {
          return (
            <HeaderData
              width={this.props.columnsWidths && this.props.columnsWidths.length > 0 ? this.props.columnsWidths[i] : dataWidth}
              key={i}
              secondary={this.props.useSecondaryStyle}
              data-test-id={`table-header-${i}`}
            >{headerItem}</HeaderData>
          )
        })}
      </Header>
    )
  }

  renderNoItems() {
    if (this.props.items.length > 0) {
      return null
    }

    return <NoItems secondary={this.props.useSecondaryStyle} data-test-id="table-noItems">{this.props.noItemsLabel}</NoItems>
  }

  renderItems() {
    if (this.props.items.length === 0) {
      return null
    }

    let dataWidth = `${100 / this.props.header.length}%`
    return (
      <Body customStyle={this.props.bodyStyle}>
        {this.props.items.map((row, i) => {
          return (
            <Row key={i} secondary={this.props.useSecondaryStyle} data-test-id={`table-row-${i}`}>
              {
                row.constructor === Array ? row.map((data, j) => {
                  let columnStyle = ''

                  if (this.props.columnsStyle) {
                    columnStyle = this.props.columnsStyle[j] || ''
                  }

                  return (
                    <RowData customStyle={columnStyle} width={dataWidth} key={`${i}-${j}`} data-test-id={`table-data-${i}-${j}`}>
                      {data}
                    </RowData>
                  )
                }) : row}
            </Row>
          )
        })}
      </Body>
    )
  }

  render() {
    return (
      <Wrapper className={this.props.className} secondary={this.props.useSecondaryStyle}>
        {this.renderHeader()}
        {this.renderItems()}
        {this.renderNoItems()}
      </Wrapper>
    )
  }
}

export default Table
