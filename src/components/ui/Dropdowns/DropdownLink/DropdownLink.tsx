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
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'
import ReactDOM from 'react-dom'
import autobind from 'autobind-decorator'
import DomUtils from '../../../../utils/DomUtils'

import SearchInput from '../../SearchInput/SearchInput'

import { ThemePalette, ThemeProps } from '../../../Theme'

import arrowImage from './images/arrow'
import checkmarkImage from './images/checkmark.svg'

const Wrapper = styled.div<any>`
  display: inline-block;
  position: relative;
`
const SearchInputWrapper = styled.div<any>``
const LinkButton = styled.div<any>`
  display: flex;
  align-items: center;
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
`
export const List = styled.div<any>`
  position: absolute;
  z-index: 1001;
  padding: ${props => (props.padding != null ? props.padding : 8)}px;
  background: ${ThemePalette.grayscale[1]};
  border-radius: 4px;
  border: 1px solid ${ThemePalette.grayscale[0]};
  ${props => (props.width ? ThemeProps.exactWidth(props.width) : css`
    min-width: 132px;
    max-width: 160px;
  `)}
  ${props => props.customStyle || ''}
  ${ThemeProps.boxShadow}
`
export const Tip = styled.div<any>`
  position: absolute;
  top: -6px;
  right: 11px;
  width: 10px;
  height: 10px;
  background: ${ThemePalette.grayscale[1]};
  border-top: 1px solid ${props => props.borderColor || ThemePalette.grayscale[0]};
  border-left: 1px solid ${props => props.borderColor || ThemePalette.grayscale[0]};
  border-bottom: 1px solid transparent;
  border-right: 1px solid transparent;
  transform: rotate(45deg);
  transition: all ${ThemeProps.animations.swift};
`
export const ListItems = styled.div<any>`
  max-height: 400px;
  overflow: auto;
  ${props => (props.searchable ? 'margin-top: 8px;' : '')}
`
export const ListItem = styled.div<any>`
  padding-top: 13px;
  color: ${props => (props.selected ? ThemePalette.primary : ThemePalette.grayscale[4])};
  cursor: pointer;
  display: flex;
  align-items: center;

  &:first-child {
    padding-top: 0;
  }
`
export const ListItemLabel = styled.div<any>`
  word-break: break-all;
  word-break: break-word;
  ${props => (props.highlighted ? `font-weight: ${ThemeProps.fontWeights.medium};` : '')}
  ${props => (props.addMargin ? css`margin-left: ${props.addMargin}px;` : '')}
  ${props => props.customStyle}
`
const Checkmark = styled.div<any>`
  ${ThemeProps.exactWidth('16px')}
  height: 16px;
  background: ${props => (props.show ? `url('${checkmarkImage}') center no-repeat` : 'transparent')};
  margin-right: 8px;
`
const Label = styled.div<any>`
  color: ${props => (props.secondary ? ThemePalette.grayscale[4] : ThemePalette.primary)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Arrow = styled.div<any>`
  width: 16px;
  height: 16px;
  margin-left: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${props => (props.orientation === 'right' ? css`transform: rotate(-90deg);` : '')}
  ${props => (props.orientation === 'left' ? css`transform: rotate(90deg);` : '')}
`
const EmptySearch = styled.div<any>`
  margin-top: 8px;
`

type ItemType = {
  label: string,
  value: any,
  [props: string]: any,
}
type Props = {
  selectedItem?: any,
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
  secondary?: boolean,
  multipleSelection?: boolean,
  selectedItems?: string[],
  'data-test-id'?: string,
  linkButtonStyle?: any,
  arrowImage?: (color: string) => string,
  noCheckmark?: boolean,
  itemStyle?: (item: ItemType) => string,
  style?: React.CSSProperties,
  labelStyle?: any,
  getLabel?: () => string,
}
type State = {
  showDropdownList: boolean,
  searchText: string,
}
@observer
class DropdownLink extends React.Component<Props, State> {
  static defaultProps = {
    selectItemLabel: 'Select',
    noItemsLabel: 'No items',
  }

  state: State = {
    showDropdownList: false,
    searchText: '',
  }

  scrollableParent: HTMLElement | null | undefined

  itemMouseDown: boolean | undefined

  labelRef: HTMLElement | null | undefined

  listItemsRef: HTMLElement | null | undefined

  listRef: HTMLElement | null | undefined

  arrowRef: HTMLElement | null | undefined

  tipRef: HTMLElement | null | undefined

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick, false)
    if (this.arrowRef) {
      this.scrollableParent = DomUtils.getScrollableParent(this.arrowRef)
      this.scrollableParent.addEventListener('scroll', this.handleScroll)
      window.addEventListener('resize', this.handleScroll)
    }
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
    if (!this.labelRef) {
      return
    }

    this.labelRef.style.width = ''
    let width = parseInt(this.props.width || '', 10)
    if (!width) {
      return
    }

    width -= 28
    const labelWidth = this.labelRef.offsetWidth
    if (labelWidth < width) {
      return
    }

    this.labelRef.style.width = `${width}px`
  }

  getFilteredItems() {
    const { items } = this.props

    return items.filter(item => (typeof item.value === 'string'
      ? item.value.toLowerCase().indexOf(this.state.searchText.toLowerCase()) > -1
      : item.value === Number(this.state.searchText)
        || item.label.toLowerCase().indexOf(this.state.searchText.toLowerCase()) > -1))
  }

  @autobind
  handleScroll() {
    if (this.arrowRef) {
      if (DomUtils.isElementInViewport(this.arrowRef, this.scrollableParent)) {
        this.updateListPosition()
      } else if (this.state.showDropdownList) {
        this.setState({ showDropdownList: false })
      }
    }
  }

  @autobind
  handlePageClick() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false })
    }
  }

  handleButtonClick() {
    if (this.props.disabled) {
      return
    }

    this.setState(prevState => ({ showDropdownList: !prevState.showDropdownList }), () => {
      this.updateListPosition()
      this.scrollIntoView()
    })
  }

  handleItemClick(item: ItemType) {
    if (!this.props.multipleSelection) {
      this.setState({ showDropdownList: false })
    }

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

    const itemIndex = this.props.items.findIndex(i => i.value === this.props.selectedItem)
    const child = this.listItemsRef.children[itemIndex] as HTMLElement | undefined
    const parent = child && child.parentNode as HTMLElement | undefined
    if (itemIndex === -1 || !child || !parent) {
      return
    }

    parent.scrollTop = child.offsetTop - parent.offsetTop
  }

  updateListPosition() {
    if (!this.state.showDropdownList || !this.listRef || !this.arrowRef || !this.tipRef) {
      return
    }

    const listWidth = this.listRef.offsetWidth
    const arrowWidth = this.arrowRef.offsetWidth
    const arrowHeight = this.arrowRef.offsetHeight
    const tipHeight = this.tipRef.offsetHeight
    const tipOffset = 9
    const arrowOffset = this.arrowRef.getBoundingClientRect()

    // If a modal is opened, body scroll is removed and body top is set to replicate scroll position
    let scrollOffset = 0
    if (document.body && parseInt(document.body.style.top, 10) < 0) {
      scrollOffset = -parseInt(document.body && document.body.style.top, 10)
    }

    this.listRef.style.top = `${arrowOffset.top + (window.pageYOffset || scrollOffset) + arrowHeight + tipHeight}px`
    this.listRef.style.left = `${arrowOffset.left + tipOffset + (arrowWidth - listWidth)}px`
  }

  renderSearch() {
    if (!this.props.searchable) {
      return null
    }

    return (
      <SearchInputWrapper
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

  renderItem(item: ItemType) {
    const highlighted = item.value !== this.props.selectedItem
      ? item.value === this.props.highlightedItem : false
    const label = item.label
      || item.value.toString().charAt(0).toUpperCase() + item.value.toString().substr(1)
    let selected

    if (this.props.multipleSelection && this.props.selectedItems) {
      selected = Boolean(this.props.selectedItems.find(i => i === item.value))
    } else {
      selected = item.value === this.props.selectedItem
    }

    return (
      <ListItem
        key={item.label || item.value}
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
        onClick={() => { this.handleItemClick(item) }}
        selected={selected}
      >
        {!this.props.noCheckmark ? <Checkmark show={selected} /> : null}
        <ListItemLabel
          highlighted={highlighted}
          addMargin={this.props.noCheckmark ? 8 : 0}
          customStyle={this.props.itemStyle ? this.props.itemStyle(item) : ''}
        >{label}
        </ListItemLabel>
      </ListItem>
    )
  }

  renderListItems() {
    if (this.state.searchText && this.getFilteredItems().length === 0) {
      return null
    }

    return (
      <ListItems
        data-test-id="dropdownLink-listItem"
        ref={(ref: HTMLElement | null | undefined) => { this.listItemsRef = ref }}
        searchable={this.props.searchable}
      >
        {this.getFilteredItems().map(item => this.renderItem(item))}
      </ListItems>
    )
  }

  renderList() {
    if (!this.props.items || this.props.items.length === 0 || !this.state.showDropdownList) {
      return null
    }

    const { body } = document
    return ReactDOM.createPortal(
      (
        <List
          ref={(list: HTMLElement | null | undefined) => {
            this.listRef = list
          }}
          width={this.props.listWidth}
        >
          <Tip ref={(ref: HTMLElement | null | undefined) => { this.tipRef = ref }} />
          {this.renderSearch()}
          {this.renderEmptySearch()}
          {this.renderListItems()}
        </List>
      ), body,
    )
  }

  render() {
    const renderLabel = () => {
      if (this.props.getLabel) {
        return this.props.getLabel()
      }
      if (this.props.items && this.props.items.length && this.props.selectedItem != null) {
        const item = this.props.items.find(i => i.value === this.props.selectedItem)
        if (item && item.label) {
          return item.label
        }
      }
      if (!this.props.items || this.props.items.length === 0) {
        return this.props.noItemsLabel
      }
      return this.props.selectItemLabel
    }

    const arrowImageFunc = this.props.arrowImage || arrowImage

    return (
      <Wrapper
        className={this.props.className}
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
        data-test-id={this.props['data-test-id'] || 'dropdownLink'}
        style={this.props.style}
      >
        <LinkButton
          onClick={() => this.handleButtonClick()}
          disabled={this.props.disabled}
          style={this.props.linkButtonStyle}
        >
          <Label
            secondary={this.props.secondary}
            ref={(label: HTMLElement | null | undefined) => { this.labelRef = label }}
            data-test-id="dropdownLink-label"
            style={this.props.labelStyle}
          >{renderLabel()}
          </Label>
          <Arrow
            ref={(arrow: HTMLElement | null | undefined) => { this.arrowRef = arrow }}
            dangerouslySetInnerHTML={{
              __html: arrowImageFunc(this.props.secondary ? ThemePalette.grayscale[3] : ThemePalette.primary),
            }}
          />
        </LinkButton>
        {this.renderList()}
      </Wrapper>
    )
  }
}

export default DropdownLink
