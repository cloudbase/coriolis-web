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

import React from "react";
import { observer } from "mobx-react";
import styled from "styled-components";
import autobind from "autobind-decorator";

import SearchInput from "@src/components/ui/SearchInput";

import { ThemePalette } from "@src/components/Theme";

import filterImage from "./images/filter";

const border = "1px solid rgba(216, 219, 226, 0.4)";

const Wrapper = styled.div<any>`
  position: relative;
  margin-top: -1px;
`;
const Button = styled.div<any>`
  width: 16px;
  height: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const List = styled.div<any>`
  position: absolute;
  top: 24px;
  right: -7px;
  z-index: 9999;
  padding: 8px;
  background: ${ThemePalette.grayscale[1]};
  border-radius: 4px;
  border: ${border};
  box-shadow: 0 0 4px 0 rgba(32, 34, 52, 0.13);
`;
const Tip = styled.div<any>`
  position: absolute;
  top: -6px;
  right: 8px;
  width: 10px;
  height: 10px;
  background: ${ThemePalette.grayscale[1]};
  border-top: ${border};
  border-left: ${border};
  border-bottom: 1px solid transparent;
  border-right: 1px solid transparent;
  transform: rotate(45deg);
`;
const ListItems = styled.div<any>`
  width: 199px;
  height: 32px;
`;

type Props = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};
type State = {
  showDropdownList: boolean;
};
@observer
class DropdownFilter extends React.Component<Props, State> {
  static defaultProps = {
    searchPlaceholder: "Filter",
  };

  state: State = {
    showDropdownList: false,
  };

  itemMouseDown: boolean | undefined;

  componentDidMount() {
    window.addEventListener("mousedown", this.handlePageClick, false);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.handlePageClick, false);
  }

  @autobind
  handlePageClick() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false });
    }
  }

  handleButtonClick() {
    this.setState(prevState => ({
      showDropdownList: !prevState.showDropdownList,
    }));
  }

  handleCloseClick() {
    this.setState({ showDropdownList: false });
  }

  renderList() {
    if (!this.state.showDropdownList) {
      return null;
    }

    return (
      <List
        onMouseDown={() => {
          this.itemMouseDown = true;
        }}
        onMouseUp={() => {
          this.itemMouseDown = false;
        }}
      >
        <Tip />
        <ListItems>
          <SearchInput
            width="100%"
            alwaysOpen
            placeholder={this.props.searchPlaceholder}
            value={this.props.searchValue}
            onChange={this.props.onSearchChange}
            useFilterIcon
            focusOnMount
            disablePrimary
            onCloseClick={() => {
              this.handleCloseClick();
            }}
          />
        </ListItems>
      </List>
    );
  }

  renderButton() {
    return (
      <Button
        onMouseDown={() => {
          this.itemMouseDown = true;
        }}
        onMouseUp={() => {
          this.itemMouseDown = false;
        }}
        onClick={() => {
          this.handleButtonClick();
        }}
        dangerouslySetInnerHTML={{
          __html: filterImage(
            this.props.searchValue
              ? ThemePalette.primary
              : ThemePalette.grayscale[5],
          ),
        }}
      />
    );
  }

  render() {
    return (
      <Wrapper>
        {this.renderButton()}
        {this.renderList()}
      </Wrapper>
    );
  }
}

export default DropdownFilter;
