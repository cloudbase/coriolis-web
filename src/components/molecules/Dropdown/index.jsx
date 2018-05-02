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

import DropdownButton from '../../atoms/DropdownButton'

import Palette from '../../styleUtils/Palette'
import DomUtils from '../../../utils/DomUtils'
import StyleProps from '../../styleUtils/StyleProps'

import checkmarkImage from './images/checkmark'

const getWidth = props => {
  if (props.large) {
    return StyleProps.inputSizes.large.width - 2
  }

  if (props.width) {
    return props.width - 2
  }

  return StyleProps.inputSizes.regular.width - 2
}
const Wrapper = styled.div`
  position: relative;
  ${props => props.embedded ? 'width: 100%;' : ''}
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
const Tip = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${props => props.primary ? Palette.primary : 'white'};
  border-top: 1px solid ${Palette.grayscale[3]};
  border-left: 1px solid ${Palette.grayscale[3]};
  border-bottom: 1px solid ${props => props.primary ? Palette.primary : 'white'};
  border-right: 1px solid ${props => props.primary ? Palette.primary : 'white'};
  transform: rotate(45deg);
  right: 8px;
  top: -6px;
  z-index: 11;
  transition: all ${StyleProps.animations.swift};
`
const Checkmark = styled.div`
  ${StyleProps.exactWidth('16px')}
  height: 16px;
  margin-right: 8px;
  margin-top: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  #symbol {
    transition: all ${StyleProps.animations.swift};
  }
`
const ListItem = styled.div`
  position: relative;
  display: flex;
  color: ${props => props.selected ? 'white' : props.dim ? Palette.grayscale[3] : Palette.grayscale[4]};
  ${props => props.selected ? css`background: ${Palette.primary};` : ''}
  ${props => props.selected ? css`font-weight: ${StyleProps.fontWeights.medium};` : ''}
  padding: 8px 16px;
  transition: all ${StyleProps.animations.swift};
  padding-left: ${props => props.paddingLeft}px;

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
    ${Checkmark} #symbol {
      stroke: white;
    }
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
const Separator = styled.div`
  width: calc(100% - 32px);
  height: 1px;
  margin: 8px 16px;
  background: ${Palette.grayscale[3]};
`
const Labels = styled.div``

type Props = {
  selectedItem: any,
  items: any[],
  labelField: string,
  valueField: string,
  className: string,
  onChange: (item: any) => void,
  noItemsMessage: string,
  noSelectionMessage: string,
  disabled: boolean,
  width: number,
  'data-test-id'?: string,
  embedded?: boolean,
  dimFirstItem?: boolean,
  multipleSelection?: boolean,
  selectedItems?: string[],
  highlight?: boolean,
}
type State = {
  showDropdownList: boolean,
  firstItemHover: boolean
}
@observer
class Dropdown extends React.Component<Props, State> {
  static defaultProps: $Shape<Props> = {
    noSelectionMessage: 'Select an item',
  }

  buttonRef: HTMLElement
  listRef: HTMLElement
  listItemsRef: HTMLElement
  tipRef: HTMLElement
  scrollableParent: HTMLElement
  buttonRect: ClientRect
  itemMouseDown: boolean

  constructor() {
    super()

    this.state = {
      showDropdownList: false,
      firstItemHover: false,
    }

    // $FlowIssue
    this.handlePageClick = this.handlePageClick.bind(this)

    // $FlowIssue
    this.handleScroll = this.handleScroll.bind(this)
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
      return this.props.noSelectionMessage
    }

    return (item[labelField] !== null && item[labelField] !== undefined && item[labelField].toString()) || (item.value && item.value.toString()) || item.toString()
  }

  getValue(item: any) {
    let valueField = this.props.valueField || 'value'

    if (item === null || item === undefined) {
      return null
    }

    return (item[valueField] !== null && item[valueField] !== undefined && item[valueField].toString()) || this.getLabel(item)
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

    this.setState({ showDropdownList: !this.state.showDropdownList }, () => {
      this.scrollIntoView()
    })
  }

  handleItemClick(item: any) {
    if (!this.props.multipleSelection) {
      this.setState({ showDropdownList: false, firstItemHover: false })
    }

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

  updateListPosition() {
    if (!this.state.showDropdownList || !this.listRef || !this.buttonRef || !document.body) {
      return
    }

    let buttonHeight = this.buttonRef.offsetHeight
    let tipHeight = 8
    let listTop = this.buttonRect.top + buttonHeight + tipHeight
    let listHeight = this.listRef.offsetHeight

    if (listTop + listHeight > window.innerHeight) {
      listTop = window.innerHeight - listHeight - 16
      this.tipRef.style.display = 'none'
    } else {
      this.tipRef.style.display = 'block'
    }

    // If a modal is opened, body scroll is removed and body top is set to replicate scroll position
    let scrollOffset = 0
    if (parseInt(document.body.style.top, 10) < 0) {
      scrollOffset = -parseInt(document.body && document.body.style.top, 10)
    }

    let widthDiff = this.listRef.offsetWidth - this.buttonRef.offsetWidth
    this.listRef.style.top = `${listTop + (window.pageYOffset || scrollOffset)}px`
    this.listRef.style.left = `${(this.buttonRect.left + window.pageXOffset) - widthDiff}px`
  }

  scrollIntoView() {
    if (!this.listRef || !this.listItemsRef) {
      return
    }

    let itemIndex = this.props.items.findIndex(i => this.getValue(i) === this.getValue(this.props.selectedItem))
    if (itemIndex === -1 || !this.listItemsRef.children[itemIndex]) {
      return
    }

    // $FlowIssue
    this.listItemsRef.children[itemIndex].parentNode.scrollTop = this.listItemsRef.children[itemIndex].offsetTop - this.listItemsRef.children[itemIndex].parentNode.offsetTop - 32
  }

  renderList() {
    if (!this.props.items || this.props.items.length === 0 || !this.state.showDropdownList) {
      return null
    }

    const body: any = document.body
    let selectedValue = this.getValue(this.props.selectedItem)
    let duplicatedLabels = []
    this.props.items.forEach((item, i) => {
      let label = this.getLabel(item)
      for (let j = i + 1; j < this.props.items.length; j += 1) {
        if (label === this.getLabel(this.props.items[j]) && !duplicatedLabels.find(item2 => this.getLabel(item2) === label)) {
          duplicatedLabels.push(label)
        }
      }
    })

    let list = ReactDOM.createPortal((
      <List {...this.props} innerRef={ref => { this.listRef = ref }}>
        <Tip innerRef={ref => { this.tipRef = ref }} primary={this.state.firstItemHover} />
        <ListItems innerRef={ref => { this.listItemsRef = ref }}>
          {this.props.items.map((item, i) => {
            if (item.separator === true) {
              return <Separator />
            }

            let label = this.getLabel(item)
            let value = this.getValue(item)
            let duplicatedLabel = duplicatedLabels.find(l => l === label)
            let multipleSelected = this.props.selectedItems && this.props.selectedItems.find(i => i === value)
            let listItem = (
              <ListItem
                data-test-id="dropdownListItem"
                key={value}
                onMouseDown={() => { this.itemMouseDown = true }}
                onMouseUp={() => { this.itemMouseDown = false }}
                onMouseEnter={() => { this.handleItemMouseEnter(i) }}
                onMouseLeave={() => { this.handleItemMouseLeave(i) }}
                onClick={() => { this.handleItemClick(item) }}
                selected={!this.props.multipleSelection && value === selectedValue}
                dim={this.props.dimFirstItem && i === 0}
                paddingLeft={this.props.multipleSelection ? 8 : 16}
              >
                {this.props.multipleSelection ? <Checkmark dangerouslySetInnerHTML={{ __html: multipleSelected ? checkmarkImage : '' }} /> : null}
                <Labels>
                  {label}
                  {duplicatedLabel ? <DuplicatedLabel> (<span>{value || ''}</span>)</DuplicatedLabel> : ''}
                </Labels>
              </ListItem>
            )

            return listItem
          })}
        </ListItems>
      </List>
    ), body)

    return list
  }

  render() {
    let buttonValue = () => {
      if (this.props.items && this.props.items.length) {
        if (this.props.multipleSelection && this.props.selectedItems && this.props.selectedItems.length > 0) {
          return this.props.selectedItems.map(i => this.getLabel(this.props.items.find(item => this.getValue(item) === i))).join(', ')
        }
        return this.getLabel(this.props.selectedItem)
      }

      return this.props.noItemsMessage || ''
    }

    return (
      <Wrapper
        className={this.props.className}
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
        data-test-id={this.props['data-test-id'] || 'dropdown'}
        embedded={this.props.embedded}
      >
        <DropdownButton
          {...this.props}
          data-test-id="dropdown-dropdownButton"
          innerRef={ref => { this.buttonRef = ref }}
          onMouseDown={() => { this.itemMouseDown = true }}
          onMouseUp={() => { this.itemMouseDown = false }}
          value={buttonValue()}
          onClick={() => this.handleButtonClick()}
        />
        {this.renderList()}
      </Wrapper>
    )
  }
}

export default Dropdown
