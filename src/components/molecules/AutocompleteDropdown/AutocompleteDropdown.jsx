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

import AutocompleteInput from '../../atoms/AutocompleteInput'
import { Tip, updateTipStyle, scrollItemIntoView } from '../Dropdown'
import tipImage from '../Dropdown/images/tip'

import Palette from '../../styleUtils/Palette'
import DomUtils from '../../../utils/DomUtils'
import StyleProps from '../../styleUtils/StyleProps'

const getWidth = props => {
  if (props.width) {
    return props.width - 2
  }

  if (props.large) {
    return StyleProps.inputSizes.large.width - 2
  }

  return StyleProps.inputSizes.regular.width - 2
}
const Wrapper = styled.div`
  position: relative;
  ${props => props.width ? css`width: ${props.width}px;` : ''}
`
const List = styled.div`
  position: absolute;
  background: white;
  cursor: pointer;
  width: ${props => getWidth(props)}px;
  border: 1px solid ${Palette.grayscale[3]};
  border-radius: ${StyleProps.borderRadius};
  z-index: 1000;
`
const ListItems = styled.div`
  max-height: 400px;
  overflow: auto;
`
const SearchNotFound = styled.div`
  padding: 8px;
  cursor: default;
`
const ListItem = styled.div`
  position: relative;
  color: ${props => props.selected ? 'white' : props.dim ? Palette.grayscale[3] : Palette.grayscale[4]};
  ${props => props.selected ? css`background: ${Palette.primary};` : ''}
  ${props => props.selected ? css`font-weight: ${StyleProps.fontWeights.medium};` : ''}

  padding: 8px 16px;
  transition: all ${StyleProps.animations.swift};

  &:first-child {
    border-top-left-radius: ${StyleProps.borderRadius};
    border-top-right-radius: ${StyleProps.borderRadius};
  }

  &:last-child {
    border-bottom-left-radius: ${StyleProps.borderRadius};
    border-bottom-right-radius: ${StyleProps.borderRadius};
  }

  &:hover {
    background: ${Palette.primary};
    color: white;
  }
`
const DuplicatedLabel = styled.div`
  display: flex;
  font-size: 11px;
  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`

type Props = {
  selectedItem?: any,
  items?: any[],
  labelField?: string,
  valueField?: string,
  className?: string,
  onChange?: (item: any) => void,
  onInputChange?: (value: string, filteredItems: any[]) => void,
  noItemsMessage?: string,
  disabled?: boolean,
  width?: number,
  dimNullValue?: boolean,
  highlight?: boolean,
}
type State = {
  showDropdownList: boolean,
  firstItemHover: boolean,
  searchValue: string,
  filteredItems: any[],
}
@observer
class AutocompleteDropdown extends React.Component<Props, State> {
  static defaultProps: $Shape<Props> = {
    noItemsMessage: 'No results found',
  }

  buttonRef: HTMLElement
  listRef: HTMLElement
  listItemsRef: HTMLElement
  tipRef: HTMLElement
  firstItemRef: HTMLElement
  scrollableParent: HTMLElement
  buttonRect: ClientRect
  itemMouseDown: boolean

  constructor() {
    super()

    this.state = {
      showDropdownList: false,
      firstItemHover: false,
      searchValue: '',
      filteredItems: [],
    }

    // $FlowIssue
    this.handlePageClick = this.handlePageClick.bind(this)

    // $FlowIssue
    this.handleScroll = this.handleScroll.bind(this)
  }

  componentWillMount() {
    this.setState({
      filteredItems: this.props.items,
      searchValue: this.props.selectedItem ? this.getLabel(this.props.selectedItem) : '',
    })
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick, false)
    if (this.buttonRef) {
      this.scrollableParent = DomUtils.getScrollableParent(this.buttonRef)
      this.scrollableParent.addEventListener('scroll', this.handleScroll)
      window.addEventListener('resize', this.handleScroll)
      this.buttonRect = this.buttonRef.getBoundingClientRect()
    }
  }

  componentWillReceiveProps(newProps: Props) {
    this.setState({ filteredItems: this.getFilteredItems(newProps) })
  }

  componentWillUpdate() {
    if (this.buttonRef) this.buttonRect = this.buttonRef.getBoundingClientRect()
  }

  componentDidUpdate() {
    this.updateListPosition()
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick, false)
    window.removeEventListener('resize', this.handleScroll, false)
    this.scrollableParent.removeEventListener('scroll', this.handleScroll, false)
  }

  getLabel(item: any) {
    let labelField = this.props.labelField || 'label'

    if (item === null || item === undefined) {
      return ''
    }

    return (item[labelField] !== null && item[labelField] !== undefined && item[labelField].toString()) || item.toString()
  }

  getValue(item: any) {
    let valueField = this.props.valueField || 'value'

    if (item === null || item === undefined) {
      return null
    }

    if (typeof item === 'string') {
      return item
    }

    return (item[valueField] !== null && item[valueField] !== undefined && item[valueField].toString()) || null
  }

  getFilteredItems(props?: ?Props, searchValue?: string): any[] {
    let useProps = props || this.props
    let useSearch = searchValue === undefined ? this.state.searchValue : searchValue
    if (!useProps.items) {
      return []
    }
    return useProps.items.filter(i => {
      const label = this.getLabel(i).toLowerCase()
      const value = this.getValue(i) || ''
      return label.indexOf(useSearch.toLowerCase()) > -1 || value.indexOf(useSearch.toLowerCase()) > -1
    })
  }

  handleScroll() {
    if (this.buttonRef) {
      if (DomUtils.isElementInViewport(this.buttonRef, this.scrollableParent)) {
        this.buttonRect = this.buttonRef.getBoundingClientRect()
        this.updateListPosition()
      } else if (this.state.showDropdownList) {
        this.setState({ showDropdownList: false })
      }
    }
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

    this.setState({
      showDropdownList: !this.state.showDropdownList,
      filteredItems: this.props.items,
    }, () => {
      this.scrollIntoView()
    })
  }

  handleItemClick(item: any) {
    this.setState({
      showDropdownList: false,
      firstItemHover: false,
      searchValue: this.getLabel(item),
      filteredItems: this.getFilteredItems(null, this.getLabel(item)),
    })

    if (this.props.onChange) {
      this.props.onChange(item)
    }
  }

  handleItemMouseEnter(index: number) {
    if (index === 0) {
      this.setState({ firstItemHover: true })
    }
  }

  handleItemMouseLeave(index: number) {
    if (index === 0) {
      this.setState({ firstItemHover: false })
    }
  }

  handleSearchInputChange(searchValue: string, isFocus?: boolean) {
    let filteredItems = isFocus ? this.props.items || [] : this.getFilteredItems(null, searchValue)

    this.setState({
      searchValue,
      filteredItems,
      showDropdownList: true,
    }, () => {
      if (isFocus) {
        this.scrollIntoView()
      }
    })

    if (this.props.onInputChange) {
      this.props.onInputChange(searchValue, filteredItems)
    }
  }

  scrollIntoView() {
    let itemIndex = this.state.filteredItems.findIndex(i => this.getValue(i) === this.getValue(this.props.selectedItem))
    scrollItemIntoView(this.listRef, this.listItemsRef, itemIndex)
  }

  updateListPosition() {
    if (!this.state.showDropdownList || !this.listRef || !this.buttonRef || !document.body) {
      return
    }

    let buttonHeight = this.buttonRef.offsetHeight
    let tipHeight = 8
    let listTop = this.buttonRect.top + buttonHeight + tipHeight
    let listHeight = this.listRef.offsetHeight

    if (listTop + listHeight + 16 > window.innerHeight) {
      listHeight = window.innerHeight - listTop - 16
    } else {
      listHeight = 400
    }

    // If a modal is opened, body scroll is removed and body top is set to replicate scroll position
    let scrollOffset = 0
    if (parseInt(document.body.style.top, 10) < 0) {
      scrollOffset = -parseInt(document.body && document.body.style.top, 10)
    }

    this.listRef.style.top = `${listTop + (window.pageYOffset || scrollOffset)}px`
    this.listRef.style.left = `${this.buttonRect.left + window.pageXOffset}px`

    if (this.listItemsRef) {
      this.listItemsRef.style.maxHeight = `${listHeight}px`
      updateTipStyle(this.listItemsRef, this.tipRef, this.firstItemRef)
    }
  }

  renderItems() {
    if (this.state.filteredItems.length === 0) {
      return null
    }

    let selectedValue = this.getValue(this.props.selectedItem)
    let duplicatedLabels = []
    this.state.filteredItems.forEach((item, i) => {
      let label = this.getLabel(item)
      for (let j = i + 1; j < this.state.filteredItems.length; j += 1) {
        if (label === this.getLabel(this.state.filteredItems[j]) && !duplicatedLabels.find(item2 => this.getLabel(item2) === label)) {
          duplicatedLabels.push(label)
        }
      }
    })

    return (
      <ListItems innerRef={ref => { this.listItemsRef = ref }}>
        {this.state.filteredItems.map((item, i) => {
          let label = this.getLabel(item)
          let value = this.getValue(item)
          let duplicatedLabel = duplicatedLabels.find(l => l === label)
          let listItem = (
            <ListItem
              data-test-id="ad-listItem"
              key={value}
              innerRef={ref => { if (i === 0) { this.firstItemRef = ref } }}
              onMouseDown={() => { this.itemMouseDown = true }}
              onMouseUp={() => { this.itemMouseDown = false }}
              onMouseEnter={() => { this.handleItemMouseEnter(i) }}
              onMouseLeave={() => { this.handleItemMouseLeave(i) }}
              onClick={() => { this.handleItemClick(item) }}
              selected={value !== null && value === selectedValue}
              dim={this.props.dimNullValue && (value === null || value === undefined)}
            >
              {label}
              {duplicatedLabel ? <DuplicatedLabel> (<span>{value || ''}</span>)</DuplicatedLabel> : ''}
            </ListItem>
          )

          return listItem
        })}
      </ListItems>
    )
  }

  renderSearchNotFound() {
    if (this.state.searchValue === '' || !this.props.items || this.props.items.length === 0 || this.state.filteredItems.length > 0) {
      return null
    }

    return (
      <ListItems>
        <SearchNotFound onClick={() => { this.setState({ showDropdownList: false }) }}>
          {this.props.noItemsMessage}
        </SearchNotFound>
      </ListItems>
    )
  }

  renderList() {
    if (!this.state.showDropdownList) {
      return null
    }

    const body: any = document.body
    const selectedItemValue = this.getValue(this.props.selectedItem)
    const firstItemValue = this.state.filteredItems.length > 0 ? this.getValue(this.state.filteredItems[0]) : null
    const isFirstItemSelected = selectedItemValue !== null && selectedItemValue === firstItemValue

    let list = ReactDOM.createPortal((
      <List {...this.props} innerRef={ref => { this.listRef = ref }}>
        <Tip
          innerRef={ref => { this.tipRef = ref }}
          primary={this.state.firstItemHover || isFirstItemSelected}
          dangerouslySetInnerHTML={{ __html: tipImage }}
        />
        {this.renderItems()}
        {this.renderSearchNotFound()}
      </List>
    ), body)

    return list
  }

  render() {
    let nullLabel = this.props.items && this.getValue(this.props.items[0]) === null ? this.getLabel(this.props.items[0]) : ''
    let inputValue = this.getValue(this.props.selectedItem) === null && this.state.searchValue === nullLabel ? '' : this.state.searchValue

    return (
      <Wrapper
        className={this.props.className}
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
        width={this.props.width}
      >
        <AutocompleteInput
          width={this.props.width}
          innerRef={ref => { this.buttonRef = ref }}
          onMouseDown={() => { this.itemMouseDown = true }}
          onMouseUp={() => { this.itemMouseDown = false }}
          value={inputValue}
          onClick={() => this.handleButtonClick()}
          onChange={searchValue => { this.handleSearchInputChange(searchValue) }}
          onFocus={() => { this.handleSearchInputChange(this.state.searchValue, true) }}
          highlight={this.props.highlight}
          disabled={this.props.disabled}
        />
        {this.renderList()}
      </Wrapper>
    )
  }
}

export default AutocompleteDropdown
