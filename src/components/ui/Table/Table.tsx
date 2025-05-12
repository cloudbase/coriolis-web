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

import * as React from "react";
import { observer } from "mobx-react";
import styled, { css } from "styled-components";

import { ThemePalette, ThemeProps } from "@src/components/Theme";

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  ${props =>
    props.secondary
      ? css`
          &:after {
            content: " ";
            height: 4px;
            background: ${ThemePalette.grayscale[1]};
            border-bottom-left-radius: ${ThemeProps.borderRadius};
            border-bottom-right-radius: ${ThemeProps.borderRadius};
          }
        `
      : ""}
`;
const Header = styled.div<any>`
  display: flex;
  border-bottom: 1px solid
    ${props =>
      props.secondary ? ThemePalette.grayscale[5] : ThemePalette.grayscale[2]};
  ${props =>
    props.secondary
      ? css`
          padding: 8px;
          background: ${ThemePalette.grayscale[1]};
          border-top-left-radius: ${ThemeProps.borderRadius};
          border-top-right-radius: ${ThemeProps.borderRadius};
        `
      : css`
          padding-bottom: 8px;
        `}
  ${props => props.customStyle}
`;
const TableData = (props: any) => css`
  width: 100%;
  max-width: ${props.width};
  padding-right: 32px;
  &:last-child {
    padding-right: 0;
  }
`;
const HeaderData = styled.div<any>`
  ${props => TableData(props)}
  color: ${props =>
    props.secondary ? ThemePalette.grayscale[5] : ThemePalette.grayscale[3]};
  font-size: 10px;
  font-weight: ${ThemeProps.fontWeights.medium};
  text-transform: uppercase;
  line-height: 16px;
`;
const Body = styled.div<any>`
  display: flex;
  flex-direction: column;
  max-height: 238px;
  overflow: auto;
  ${props => props.customStyle}
`;
const Row = styled.div<any>`
  display: flex;
  padding: ${props => (props.secondary ? "8px" : "8px 0")};
  ${props =>
    props.secondary ? `background: ${ThemePalette.grayscale[1]};` : ""}
  border-bottom: 1px solid ${props =>
    props.secondary ? "white" : ThemePalette.grayscale[2]};
  flex-shrink: 0;
  ${props =>
    props.secondary
      ? css`
          &:last-child {
            border-bottom: 0;
            padding-bottom: 4px;
          }
        `
      : ""}
`;
const RowData = styled.div<any>`
  ${props => TableData(props)}
  color: ${ThemePalette.grayscale[4]};
  ${props => props.customStyle};
  overflow: hidden;
  text-overflow: ellipsis;
`;
const NoItems = styled.div<any>`
  text-align: center;
  padding: 16px;
  margin-left: 24px;
  ${props =>
    props.secondary ? `background: ${ThemePalette.grayscale[1]};` : ""}
`;

type Props = {
  header: React.ReactNode[];
  items: Array<Array<React.ReactNode>>;
  columnsStyle?: any[];
  columnsWidths?: string[];
  className?: string;
  useSecondaryStyle?: boolean;
  noItemsLabel?: string;
  noItemsComponent?: React.ReactNode;
  noItemsStyle?: any;
  bodyStyle?: any;
  headerStyle?: any;
};
@observer
class Table extends React.Component<Props> {
  static defaultProps = {
    columnsWidths: [],
    noItemsLabel: "No items!",
  };

  renderHeader() {
    const dataWidth = `${100 / this.props.header.length}%`;
    return (
      <Header
        secondary={this.props.useSecondaryStyle}
        customStyle={this.props.headerStyle}
      >
        {this.props.header.map((headerItem, i) => (
          <HeaderData
            width={
              this.props.columnsWidths && this.props.columnsWidths.length > 0
                ? this.props.columnsWidths[i]
                : dataWidth
            }
            key={i}
            secondary={this.props.useSecondaryStyle}
          >
            {headerItem}
          </HeaderData>
        ))}
      </Header>
    );
  }

  renderNoItems() {
    if (this.props.items.length > 0) {
      return null;
    }

    return (
      <NoItems
        secondary={this.props.useSecondaryStyle}
        style={this.props.noItemsStyle}
      >
        {this.props.noItemsComponent || this.props.noItemsLabel}
      </NoItems>
    );
  }

  renderItems() {
    if (this.props.items.length === 0) {
      return null;
    }

    const dataWidth = `${100 / this.props.header.length}%`;
    return (
      <Body customStyle={this.props.bodyStyle}>
        {this.props.items.map((row, i) => (
          <Row key={i} secondary={this.props.useSecondaryStyle}>
            {row.constructor === Array
              ? row.map((data, j) => {
                  let columnStyle = "";

                  if (this.props.columnsStyle) {
                    columnStyle = this.props.columnsStyle[j] || "";
                  }

                  return (
                    <RowData
                      customStyle={columnStyle}
                      width={dataWidth}
                      key={`${i}-${j}`}
                    >
                      {data}
                    </RowData>
                  );
                })
              : row}
          </Row>
        ))}
      </Body>
    );
  }

  render() {
    return (
      <Wrapper
        className={this.props.className}
        secondary={this.props.useSecondaryStyle}
      >
        {this.renderHeader()}
        {this.renderItems()}
        {this.renderNoItems()}
      </Wrapper>
    );
  }
}

export default Table;
