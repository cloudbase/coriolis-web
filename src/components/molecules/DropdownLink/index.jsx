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
import styled, { css } from 'styled-components'
import ReactDOM from 'react-dom'

import SearchInput from '../../molecules/SearchInput'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import arrowImage from './images/arrow.svg'
import checkmarkImage from './images/checkmark.svg'

const Wrapper = styled.div`
  display: inline-block;
  position: relative;
`
const SearchInputWrapper = styled.div``
const LinkButton = styled.div`
  display: flex;
  align-items: center;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
`
const List = styled.div`
  position: absolute;
  z-index: 20;
  padding: 8px;
  background: ${Palette.grayscale[1]};
  border-radius: 4px;
  border: 1px solid ${Palette.grayscale[0]};
  ${props => props.width ? StyleProps.exactWidth(props.width) : css`
    min-width: 132px;
    max-width: 160px;
  `}
`
const Tip = styled.div`
  position: absolute;
  top: -6px;
  right: 8px;
  width: 10px;
  height: 10px;
  background: ${Palette.grayscale[1]};
  border-top: 1px solid ${Palette.grayscale[0]};
  border-left: 1px solid ${Palette.grayscale[0]};
  border-bottom: 1px solid transparent;
  border-right: 1px solid transparent;
  transform: rotate(45deg);
`
const ListItems = styled.div`
  max-height: 400px;
  overflow: auto;
  ${props => props.searchable ? 'margin-top: 8px;' : ''}
`
const ListItem = styled.div`
  padding-top: 13px;
  color: ${props => props.selected ? Palette.primary : Palette.grayscale[4]};
  cursor: pointer;
  display: flex;

  &:first-child {
    padding-top: 0;
  }
`
const ListItemLabel = styled.div`
  word-break: break-all;
  word-break: break-word;
  ${props => props.highlighted ? `font-weight: ${StyleProps.fontWeights.medium};` : ''}
`
const Checkmark = styled.div`
  ${StyleProps.exactWidth('16px')}
  height: 16px;
  background: ${props => props.show ? `url('${checkmarkImage}') center no-repeat` : 'transparent'};
  margin-right: 8px;
`
const Label = styled.div`
  color: ${Palette.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Arrow = styled.div`
  width: 16px;
  height: 16px;
  background: url('${arrowImage}') center no-repeat;
  margin-left: 4px;
  margin-top: -1px;
`
const EmptySearch = styled.div`
  margin-top: 8px;
`

type ItemType = {
  label: string,
  value: string,
  [string]: any,
}
type Props = {
  selectedItem?: string,
  items: ItemType[],
  onChange?: (item: ItemType) => void,
  highlightedItem?: string,
  className?: string,
  width?: string,
  selectItemLabel?: string,
  noItemsLabel?: string,
  listWidth?: string,
  searchable?: boolean,
  disabled?: boolean,
}
type State = {
  showDropdownList: boolean,
  searchText: string,
}
@observer
class DropdownLink extends React.Component<Props, State> {
  static defaultProps: $Shape<Props> = {
    selectItemLabel: 'Select',
    noItemsLabel: 'No items',
  }

  itemMouseDown: boolean
  labelRef: HTMLElement
  listItemsRef: HTMLElement
  listRef: HTMLElement
  arrowRef: HTMLElement
  tipRef: HTMLElement
  searchInputWrapperRef: HTMLElement

  constructor() {
    super()

    this.state = {
      showDropdownList: false,
      searchText: '',
    }

    const self: any = this
    self.handlePageClick = this.handlePageClick.bind(this)
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick, false)
    this.setLabelWidth()
  }

  componentDidUpdate() {
    this.setLabelWidth()
    this.updateListPosition()
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick, false)
  }

  setLabelWidth() {
    this.labelRef.style.width = ''
    let width = parseInt(this.props.width, 10)
    if (!width) {
      return
    }

    width -= 28
    let labelWidth = this.labelRef.offsetWidth
    if (labelWidth < width) {
      return
    }

    this.labelRef.style.width = `${width}px`
  }

  getFilteredItems() {
    return this.props.items.filter(item =>
      item.value.toLowerCase().indexOf(this.state.searchText.toLowerCase()) > -1 ||
      item.label.toLowerCase().indexOf(this.state.searchText.toLowerCase()) > -1
    )
  }

  handlePageClick() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false })
    }
  }

  handleButtonClick() {
    if (this.props.disabled) {
      return
    }

    this.setState({ showDropdownList: !this.state.showDropdownList }, () => {
      this.scrollIntoView()
    })
  }

  handleItemClick(item: ItemType) {
    this.setState({ showDropdownList: false })

    if (this.props.onChange) {
      this.props.onChange(item)
    }
  }

  handleSearchTextChange(searchText: string) {
    this.setState({ searchText })
  }

  scrollIntoView() {
    if (!this.listRef || !this.listItemsRef) {
      return
    }

    let itemIndex = this.props.items.findIndex(i => i.value === this.props.selectedItem)
    if (itemIndex === -1 || !this.listItemsRef.children[itemIndex]) {
      return
    }

    // $FlowIssue
    this.listItemsRef.children[itemIndex].parentNode.scrollTop = this.listItemsRef.children[itemIndex].offsetTop - this.listItemsRef.children[itemIndex].parentNode.offsetTop
  }

  updateListPosition() {
    if (!this.state.showDropdownList || !this.listRef || !this.arrowRef || !this.tipRef) {
      return
    }

    let listWidth = this.listRef.offsetWidth
    let arrowWidth = this.arrowRef.offsetWidth
    let arrowHeight = this.arrowRef.offsetHeight
    let tipHeight = this.tipRef.offsetHeight
    const tipOffset = 7
    let arrowOffset = this.arrowRef.getBoundingClientRect()
    this.listRef.style.top = `${arrowOffset.top + window.pageYOffset + arrowHeight + tipHeight}px`
    this.listRef.style.left = `${arrowOffset.left + tipOffset + (arrowWidth - listWidth)}px`
  }

  renderSearch() {
    if (!this.props.searchable) {
      return null
    }

    return (
      <SearchInputWrapper
        innerRef={ref => { this.searchInputWrapperRef = ref }}
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
      >
        <SearchInput
          alwaysOpen
          width="100%"
          onChange={text => { this.handleSearchTextChange(text) }}
          value={this.state.searchText}
        />
      </SearchInputWrapper>
    )
  }

  renderEmptySearch() {
    if (!this.state.searchText || this.getFilteredItems().length > 0) {
      return null
    }

    return <EmptySearch>No items found</EmptySearch>
  }

  renderListItems() {
    if (this.state.searchText && this.getFilteredItems().length === 0) {
      return null
    }

    return (
      <ListItems innerRef={ref => { this.listItemsRef = ref }} searchable={this.props.searchable}>
        {this.getFilteredItems().map((item) => {
          let highlighted = item.value !== this.props.selectedItem ? item.value === this.props.highlightedItem : false
          let listItem = (
            <ListItem
              key={item.label}
              onMouseDown={() => { this.itemMouseDown = true }}
              onMouseUp={() => { this.itemMouseDown = false }}
              onClick={() => { this.handleItemClick(item) }}
              selected={item.value === this.props.selectedItem}
            >
              <Checkmark show={item.value === this.props.selectedItem} />
              <ListItemLabel highlighted={highlighted}>{item.label}</ListItemLabel>
            </ListItem>
          )

          return listItem
        })}
      </ListItems>
    )
  }

  renderList() {
    if (!this.props.items || this.props.items.length === 0 || !this.state.showDropdownList) {
      return null
    }

    let body: any = document.body
    return ReactDOM.createPortal((
      <List innerRef={list => { this.listRef = list }} width={this.props.listWidth}>
        <Tip innerRef={ref => { this.tipRef = ref }} />
        {this.renderSearch()}
        {this.renderEmptySearch()}
        {this.renderListItems()}
      </List>
    ), body)
  }

  render() {
    let renderLabel = () => {
      if (this.props.items && this.props.items.length && this.props.selectedItem) {
        let item = this.props.items.find(i => i.value === this.props.selectedItem)
        if (item && item.label) {
          return item.label
        }
      }
      if (!this.props.items || this.props.items.length === 0) {
        return this.props.noItemsLabel
      }
      return this.props.selectItemLabel
    }

    return (
      <Wrapper
        className={this.props.className}
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
      >
        <LinkButton
          onClick={() => this.handleButtonClick()}
          disabled={this.props.disabled}
        >
          <Label innerRef={label => { this.labelRef = label }}>{renderLabel()}</Label>
          <Arrow innerRef={arrow => { this.arrowRef = arrow }} />
        </LinkButton>
        {this.renderList()}
      </Wrapper>
    )
  }
}

export default DropdownLink
