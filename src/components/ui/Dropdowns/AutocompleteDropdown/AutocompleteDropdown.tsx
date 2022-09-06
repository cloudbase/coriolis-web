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
import ReactDOM from "react-dom";
import autobind from "autobind-decorator";

import AutocompleteInput from "@src/components/ui/AutocompleteInput";
import tipImage from "@src/components/ui/Dropdowns/Dropdown/images/tip";

import { ThemePalette, ThemeProps } from "@src/components/Theme";
import DomUtils from "@src/utils/DomUtils";
import {
  Tip,
  updateTipStyle,
  scrollItemIntoView,
  handleKeyNavigation,
} from "@src/components/ui/Dropdowns/Dropdown";

import requiredImage from "./images/required.svg";

const getWidth = (props: any) => {
  if (props.width) {
    return props.width - 2;
  }

  if (props.large) {
    return ThemeProps.inputSizes.large.width - 2;
  }

  return ThemeProps.inputSizes.regular.width - 2;
};
const Wrapper = styled.div<any>`
  position: relative;
  ${(props: any) =>
    props.embedded
      ? css`
          width: 100%;
        `
      : props.width
      ? css`
          width: ${props.width}px;
        `
      : ""}
`;
const Required = styled.div<any>`
  position: absolute;
  width: 8px;
  height: 8px;
  right: ${(props: any) => props.right}px;
  top: 12px;
  background: url("${requiredImage}") center no-repeat;
`;
const List = styled.div<any>`
  position: absolute;
  background: white;
  cursor: pointer;
  width: ${(props: any) => getWidth(props)}px;
  border: 1px solid ${ThemePalette.grayscale[3]};
  border-radius: ${ThemeProps.borderRadius};
  z-index: 1000;
  ${ThemeProps.boxShadow}
`;
const Separator = styled.div<any>`
  width: calc(100% - 32px);
  height: 1px;
  margin: 8px 16px;
  background: ${ThemePalette.grayscale[3]};
`;
const ListItems = styled.div<any>`
  max-height: 400px;
  overflow: auto;
`;
const SearchNotFound = styled.div<any>`
  padding: 8px;
  cursor: default;
`;
const ListItem = styled.div<any>`
  position: relative;
  color: ${(props: any) =>
    props.selected
      ? "white"
      : props.dim
      ? ThemePalette.grayscale[3]
      : ThemePalette.grayscale[4]};
  ${(props: any) =>
    props.arrowSelected
      ? css`
          background: ${ThemePalette.primary}44;
        `
      : ""}
  ${(props: any) =>
    props.selected
      ? css`
          background: ${ThemePalette.primary};
        `
      : ""}
  ${(props: any) =>
    props.selected
      ? css`
          font-weight: ${ThemeProps.fontWeights.medium};
        `
      : ""}
  padding: 8px 16px;
  transition: all ${ThemeProps.animations.swift};
  word-break: break-word;

  &:first-child {
    border-top-left-radius: ${ThemeProps.borderRadius};
    border-top-right-radius: ${ThemeProps.borderRadius};
  }

  &:last-child {
    border-bottom-left-radius: ${ThemeProps.borderRadius};
    border-bottom-right-radius: ${ThemeProps.borderRadius};
  }

  &:hover {
    background: ${ThemePalette.primary};
    color: white;
  }

  ${props =>
    props.disabled
      ? css`
          cursor: default;
          color: ${ThemePalette.grayscale[3]};
          &:hover {
            background: white;
            color: ${ThemePalette.grayscale[3]};
          }
        `
      : ""}
`;
const SubtitleLabel = styled.div`
  display: flex;
  font-size: 11px;
`;
const DuplicatedLabel = styled.div<any>`
  display: flex;
  font-size: 11px;
  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

type Props = {
  selectedItem?: any;
  items?: any[];
  labelField?: string;
  valueField?: string;
  className?: string;
  onChange?: (item: any) => void;
  onInputChange?: (value: string, filteredItems: any[]) => void;
  noItemsMessage?: string;
  disabled?: boolean;
  disabledLoading?: boolean;
  width?: number;
  dimNullValue?: boolean;
  highlight?: boolean;
  required?: boolean;
  embedded?: boolean;
};
type State = {
  showDropdownList: boolean;
  firstItemHover: boolean;
  searchValue: string;
  filteredItems: any[];
  arrowSelection: number | null;
};
@observer
class AutocompleteDropdown extends React.Component<Props, State> {
  static defaultProps: Props = {
    noItemsMessage: "No results found",
  };

  state: State = {
    showDropdownList: false,
    firstItemHover: false,
    searchValue: "",
    filteredItems: [],
    arrowSelection: null,
  };

  buttonRef: HTMLElement | null | undefined;

  listRef: HTMLElement | null | undefined;

  listItemsRef: HTMLElement | null | undefined;

  tipRef: HTMLElement | null | undefined;

  firstItemRef: HTMLElement | null | undefined;

  scrollableParent: HTMLElement | null | undefined;

  buttonRect: ClientRect | undefined;

  itemMouseDown: boolean | undefined;

  UNSAFE_componentWillMount() {
    this.setState({
      filteredItems: this.props.items || [],
      searchValue: this.props.selectedItem
        ? this.getLabel(this.props.selectedItem)
        : "",
    });
  }

  componentDidMount() {
    if (this.buttonRef) {
      this.scrollableParent = DomUtils.getScrollableParent(this.buttonRef);
      this.scrollableParent.addEventListener("scroll", this.handleScroll);
      window.addEventListener("resize", this.handleScroll);
      this.buttonRect = this.buttonRef.getBoundingClientRect();
    }
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    this.setState({ filteredItems: this.getFilteredItems(newProps) });
  }

  UNSAFE_componentWillUpdate() {
    if (this.buttonRef)
      this.buttonRect = this.buttonRef.getBoundingClientRect();
  }

  componentDidUpdate() {
    this.updateListPosition();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleScroll, false);
    if (this.scrollableParent) {
      this.scrollableParent.removeEventListener(
        "scroll",
        this.handleScroll,
        false
      );
    }
  }

  getLabel(item: any): string {
    const labelField = this.props.labelField || "label";

    if (item == null) {
      return "";
    }

    return (
      (item[labelField] != null && item[labelField].toString()) ||
      item.toString()
    );
  }

  getValue(item: any) {
    const valueField = this.props.valueField || "value";

    if (item == null) {
      return null;
    }

    if (typeof item === "string") {
      return item;
    }

    return (item[valueField] != null && item[valueField].toString()) || null;
  }

  getFilteredItems(props?: Props | null, searchValue?: string): any[] {
    const useProps = props || this.props;
    const useSearch =
      searchValue === undefined ? this.state.searchValue : searchValue;
    if (!useProps.items) {
      return [];
    }
    return useProps.items.filter(i => {
      const label = this.getLabel(i).toLowerCase();
      const value = this.getValue(i) || "";
      return (
        label.indexOf(useSearch.toLowerCase()) > -1 ||
        value.indexOf(useSearch.toLowerCase()) > -1
      );
    });
  }

  @autobind
  handleScroll() {
    if (this.buttonRef) {
      if (DomUtils.isElementInViewport(this.buttonRef, this.scrollableParent)) {
        this.buttonRect = this.buttonRef.getBoundingClientRect();
        this.updateListPosition();
      } else if (this.state.showDropdownList) {
        this.setState({ showDropdownList: false });
      }
    }
  }

  closeDropdownList() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false });
    }
  }

  handleItemClick(item: any) {
    if (item.disabled) {
      return;
    }

    this.setState({
      showDropdownList: false,
      firstItemHover: false,
      searchValue: this.getLabel(item),
      filteredItems: this.getFilteredItems(null, this.getLabel(item)),
    });

    if (this.props.onChange) {
      this.props.onChange(item);
    }
  }

  handleItemMouseEnter(index: number) {
    if (index === 0) {
      this.setState({ firstItemHover: true });
    }
  }

  handleItemMouseLeave(index: number) {
    if (index === 0) {
      this.setState({ firstItemHover: false });
    }
  }

  handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!this.state.showDropdownList) {
      return;
    }
    handleKeyNavigation({
      submitKeys: ["Enter"],
      keyboardEvent: e,
      arrowSelection: this.state.arrowSelection,
      items: this.state.filteredItems,
      selectedItem: this.props.selectedItem,
      onSubmit: item => {
        this.handleItemClick(item);
      },
      onGetValue: item => this.getValue(item),
      onSelection: arrowSelection => {
        this.setState({ arrowSelection }, () => {
          this.scrollIntoView(arrowSelection);
        });
      },
    });
  }

  handleSearchInputChange(searchValue: string, isFocus?: boolean) {
    const filteredItems = isFocus
      ? this.props.items || []
      : this.getFilteredItems(null, searchValue);

    this.setState(
      {
        searchValue,
        filteredItems,
        showDropdownList: true,
        arrowSelection: null,
      },
      () => {
        if (isFocus) {
          this.scrollIntoView();
        }
      }
    );

    if (this.props.onInputChange) {
      this.props.onInputChange(searchValue, filteredItems);
    }
  }

  scrollIntoView(itemIndex?: number) {
    const selectedItemIndex = this.state.filteredItems.findIndex(
      i => this.getValue(i) === this.getValue(this.props.selectedItem)
    );
    const actualItemIndex = itemIndex != null ? itemIndex : selectedItemIndex;
    if (this.listRef && this.listItemsRef) {
      scrollItemIntoView(this.listRef, this.listItemsRef, actualItemIndex);
    }
  }

  updateListPosition() {
    if (
      !this.state.showDropdownList ||
      !this.listRef ||
      !this.firstItemRef ||
      !this.buttonRef ||
      !document.body ||
      !this.buttonRect ||
      !this.tipRef
    ) {
      return;
    }

    const buttonHeight = this.buttonRef.offsetHeight;
    const tipHeight = 8;
    const listTop = this.buttonRect.top + buttonHeight + tipHeight;
    let listHeight = this.listRef.offsetHeight;

    if (listTop + listHeight + 16 > window.innerHeight) {
      listHeight = window.innerHeight - listTop - 16;
    } else {
      listHeight = 400;
    }

    // If a modal is opened, body scroll is removed and body top is set to replicate scroll position
    let scrollOffset = 0;
    if (parseInt(document.body.style.top, 10) < 0) {
      scrollOffset = -parseInt(document.body && document.body.style.top, 10);
    }

    const widthDiff = this.listRef.offsetWidth - this.buttonRef.offsetWidth;
    this.listRef.style.top = `${
      listTop + (window.pageYOffset || scrollOffset)
    }px`;
    this.listRef.style.left = `${
      this.buttonRect.left + window.pageXOffset - widthDiff
    }px`;

    if (this.listItemsRef) {
      this.listItemsRef.style.maxHeight = `${listHeight}px`;
      updateTipStyle(this.listItemsRef, this.tipRef, this.firstItemRef);
    }
  }

  renderItems() {
    if (this.state.filteredItems.length === 0) {
      return null;
    }

    const selectedValue = this.getValue(this.props.selectedItem);
    const duplicatedLabels: string[] = [];
    this.state.filteredItems.forEach((item, i) => {
      const label = this.getLabel(item);
      for (let j = i + 1; j < this.state.filteredItems.length; j += 1) {
        if (
          label === this.getLabel(this.state.filteredItems[j]) &&
          !duplicatedLabels.find(item2 => this.getLabel(item2) === label)
        ) {
          duplicatedLabels.push(label);
        }
      }
    });

    return (
      <ListItems
        ref={(ref: HTMLElement | null | undefined) => {
          this.listItemsRef = ref;
        }}
      >
        {this.state.filteredItems.map((item, i) => {
          if (item.separator === true) {
            // eslint-disable-next-line react/no-array-index-key
            return <Separator key={`sep-${i}`} />;
          }
          const label = this.getLabel(item);
          const value = this.getValue(item);
          const duplicatedLabel = duplicatedLabels.find(l => l === label);
          const listItem = (
            <ListItem
              key={value}
              ref={(ref: HTMLElement | null | undefined) => {
                if (i === 0) {
                  this.firstItemRef = ref;
                }
              }}
              onMouseDown={() => {
                this.itemMouseDown = true;
              }}
              onMouseUp={() => {
                this.itemMouseDown = false;
              }}
              onMouseEnter={() => {
                this.handleItemMouseEnter(i);
              }}
              onMouseLeave={() => {
                this.handleItemMouseLeave(i);
              }}
              onClick={() => {
                this.handleItemClick(item);
              }}
              selected={value !== null && value === selectedValue}
              dim={this.props.dimNullValue && value == null}
              arrowSelected={i === this.state.arrowSelection}
              disabled={item.disabled}
            >
              {label}
              {item.subtitleLabel ? (
                <SubtitleLabel>{item.subtitleLabel}</SubtitleLabel>
              ) : null}
              {duplicatedLabel ? (
                <DuplicatedLabel>
                  {" "}
                  (<span>{value || ""}</span>)
                </DuplicatedLabel>
              ) : (
                ""
              )}
            </ListItem>
          );

          return listItem;
        })}
      </ListItems>
    );
  }

  renderSearchNotFound() {
    if (
      this.state.searchValue === "" ||
      !this.props.items ||
      this.props.items.length === 0 ||
      this.state.filteredItems.length > 0
    ) {
      return null;
    }

    return (
      <ListItems>
        <SearchNotFound
          onClick={() => {
            this.setState({ showDropdownList: false });
          }}
        >
          {this.props.noItemsMessage}
        </SearchNotFound>
      </ListItems>
    );
  }

  renderList() {
    if (!this.state.showDropdownList) {
      return null;
    }

    const { body } = document;
    const selectedItemValue = this.getValue(this.props.selectedItem);
    const firstItemValue =
      this.state.filteredItems.length > 0
        ? this.getValue(this.state.filteredItems[0])
        : null;
    const isFirstItemSelected =
      selectedItemValue !== null && selectedItemValue === firstItemValue;

    const list = ReactDOM.createPortal(
      // eslint-disable-next-line react/jsx-props-no-spreading
      <List
        {...this.props}
        ref={(ref: HTMLElement | null | undefined) => {
          this.listRef = ref;
        }}
      >
        <Tip
          ref={(ref: HTMLElement | null | undefined) => {
            this.tipRef = ref;
          }}
          primary={this.state.firstItemHover || isFirstItemSelected}
          dangerouslySetInnerHTML={{ __html: tipImage }}
        />
        {this.renderItems()}
        {this.renderSearchNotFound()}
      </List>,
      body
    );

    return list;
  }

  render() {
    const nullLabel =
      this.props.items && this.getValue(this.props.items[0]) === null
        ? this.getLabel(this.props.items[0])
        : "";
    const inputValue =
      this.getValue(this.props.selectedItem) === null &&
      this.state.searchValue === nullLabel
        ? ""
        : this.state.searchValue;

    return (
      <Wrapper
        className={this.props.className}
        width={this.props.width}
        embedded={this.props.embedded}
      >
        <AutocompleteInput
          width={this.props.width}
          customRef={ref => {
            this.buttonRef = ref;
          }}
          onBlur={() => {
            this.closeDropdownList();
          }}
          value={inputValue}
          onChange={searchValue => {
            this.handleSearchInputChange(searchValue);
          }}
          onFocus={() => {
            this.handleSearchInputChange(this.state.searchValue, true);
          }}
          highlight={this.props.highlight}
          disabled={this.props.disabled}
          disabledLoading={this.props.disabledLoading}
          embedded={this.props.embedded}
          onInputKeyDown={e => {
            this.handleInputKeyDown(e);
          }}
        />
        {this.props.required ? (
          <Required right={this.props.embedded ? -24 : -16} />
        ) : null}
        {this.renderList()}
      </Wrapper>
    );
  }
}

export default AutocompleteDropdown;
