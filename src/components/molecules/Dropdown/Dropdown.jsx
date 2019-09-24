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
import autobind from 'autobind-decorator'

import DropdownButton from '../../atoms/DropdownButton'

import Palette from '../../styleUtils/Palette'
import DomUtils from '../../../utils/DomUtils'
import StyleProps from '../../styleUtils/StyleProps'

import checkmarkImage from './images/checkmark'
import tipImage from './images/tip'
import requiredImage from './images/required.svg'

const getWidth = props => {
  if (props.width) {
    return props.width - 2
  }

  return StyleProps.inputSizes.regular.width - 2
}
const Wrapper = styled.div`
  position: relative;
  ${props => props.embedded ? 'width: 100%;' : ''}
`
const Required = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  right: -16px;
  top: 12px;
  background: url('${requiredImage}') center no-repeat;
  ${props => props.disabledLoading ? StyleProps.animations.disabledLoading : ''}
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
export const Tip = styled.div`
  position: absolute;
  width: 16px;
  height: 8px;
  right: 8px;
  top: -8px;
  z-index: 11;
  transition: all ${StyleProps.animations.swift};
  overflow: hidden;
  svg {
    #path {
      transition: all ${StyleProps.animations.swift};
      fill: ${props => props.primary ? Palette.primary : 'white'};
    }
  }
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
    transition: stroke ${StyleProps.animations.swift};
    stroke-dasharray: 12;
    stroke-dashoffset: ${props => props.show ? 24 : 12};
    animation-duration: 100ms;
    animation-timing-function: ease-in-out;
    animation-fill-mode: forwards;

    @keyframes dashOn {
      from { stroke-dashoffset: 12; }
      to { stroke-dashoffset: 24; }
    }
    @keyframes dashOff {
      from { stroke-dashoffset: 24; }
      to { stroke-dashoffset: 12; }
    }
  }
`
const ListItem = styled.div`
  position: relative;
  display: flex;
  color: ${props => props.multipleSelected ? Palette.primary : props.selected ? 'white' : props.dim ? Palette.grayscale[3] : Palette.grayscale[4]};
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
const Labels = styled.div`
  word-break: break-word;
  max-width: 100%;
`

export const updateTipStyle = (listItemsRef: HTMLElement, tipRef: HTMLElement, firstItemRef: HTMLElement) => {
  if (tipRef && firstItemRef) {
    let svgPath = tipRef.querySelector('#path')
    if (svgPath) {
      if (listItemsRef.clientHeight < listItemsRef.scrollHeight) {
        // $FlowIssue
        svgPath.style.fill = 'white'
        firstItemRef.style.borderTopRightRadius = '0'
      } else {
        // $FlowIssue
        svgPath.style.fill = ''
        firstItemRef.style.borderTopRightRadius = ''
      }
    }
  }
}

export const scrollItemIntoView = (
  listRef: HTMLElement,
  listItemsRef: HTMLElement,
  itemIndex: number
) => {
  if (!listRef || !listItemsRef) {
    return
  }
  if (itemIndex === -1 || !listItemsRef.children[itemIndex]) {
    return
  }
  // $FlowIssue
  listItemsRef.children[itemIndex].parentNode.scrollTop = listItemsRef.children[itemIndex].offsetTop - listItemsRef.children[itemIndex].parentNode.offsetTop - 32
}

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
  disabledLoading: boolean,
  width: number,
  'data-test-id'?: string,
  embedded?: boolean,
  dimFirstItem?: boolean,
  multipleSelection?: boolean,
  selectedItems?: ?any[],
  highlight?: boolean,
  required?: boolean,
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

  state = {
    showDropdownList: false,
    firstItemHover: false,
  }

  buttonRef: HTMLElement
  listRef: HTMLElement
  listItemsRef: HTMLElement
  firstItemRef: HTMLElement
  tipRef: HTMLElement
  scrollableParent: HTMLElement
  buttonRect: ClientRect
  itemMouseDown: boolean
  checkmarkRefs: { [string]: HTMLElement } = {}

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
    if (!this.props.multipleSelection) {
      return
    }
    // Clear checkmark if items are removed in newProps
    let newSelectedItems = newProps.selectedItems || []
    let oldSelectedItems = this.props.selectedItems || []
    let hash = item => `${this.getLabel(item)}-${this.getValue(item) || ''}`
    let needsCheckmarkClear = oldSelectedItems.filter(oldItem => !newSelectedItems.find(newItem => hash(oldItem) === hash(newItem)))
    needsCheckmarkClear.forEach(clearItem => {
      this.toggleCheckmarkAnimation(clearItem, this.checkmarkRefs[hash(clearItem)], true)
    })
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

    if (item == null) {
      return this.props.noSelectionMessage
    }

    if (item[labelField] != null) {
      return item[labelField].toString()
    }
    if (item.value != null) {
      return item.value.toString()
    }
    return item.toString()
  }

  getValue(item: any) {
    let valueField = this.props.valueField || 'value'

    if (item == null) {
      return null
    }

    return (item[valueField] != null && item[valueField].toString()) || this.getLabel(item)
  }

  @autobind
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

    this.setState({ showDropdownList: !this.state.showDropdownList }, () => {
      this.scrollIntoView()
    })
  }

  handleItemClick(item: any) {
    if (!this.props.multipleSelection) {
      this.setState({ showDropdownList: false, firstItemHover: false })
    } else {
      let selected = Boolean(this.props.selectedItems && this.props.selectedItems.find(i =>
        this.getValue(i) === this.getValue(item)))
      this.toggleCheckmarkAnimation(
        item,
        this.checkmarkRefs[`${this.getLabel(item)}-${this.getValue(item) || ''}`],
        selected
      )
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

  toggleCheckmarkAnimation(item: any, checkmarkRef: HTMLElement, selected: boolean) {
    if (!item || !checkmarkRef) {
      return
    }
    let symbol = checkmarkRef.querySelector('#symbol')
    if (symbol) {
      symbol.style.animationName = selected ? 'dashOff' : 'dashOn'
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
    updateTipStyle(this.listItemsRef, this.tipRef, this.firstItemRef)
  }

  scrollIntoView() {
    let itemIndex = this.props.items.findIndex(i => this.getValue(i) === this.getValue(this.props.selectedItem))
    scrollItemIntoView(this.listRef, this.listItemsRef, itemIndex)
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
    const firstItemValue = this.props.items.length > 0 ? this.getValue(this.props.items[0]) : null
    const isFirstItemSelected = selectedValue === firstItemValue

    let list = ReactDOM.createPortal((
      <List {...this.props} innerRef={ref => { this.listRef = ref }}>
        <Tip
          innerRef={ref => { this.tipRef = ref }}
          primary={this.state.firstItemHover || isFirstItemSelected}
          dangerouslySetInnerHTML={{ __html: tipImage }}
        />
        <ListItems innerRef={ref => { this.listItemsRef = ref }}>
          {this.props.items.map((item, i) => {
            if (item.separator === true) {
              return <Separator key={`sep-${i}`} />
            }

            let label = this.getLabel(item)
            let value = this.getValue(item)
            let duplicatedLabel = duplicatedLabels.find(l => l === label)
            let multipleSelected = this.props.selectedItems && this.props.selectedItems
              .find(i => this.getValue(i) === value)
            let listItem = (
              <ListItem
                data-test-id="dropdownListItem"
                innerRef={ref => { if (i === 0) { this.firstItemRef = ref } }}
                key={value}
                onMouseDown={() => { this.itemMouseDown = true }}
                onMouseUp={() => { this.itemMouseDown = false }}
                onMouseEnter={() => { this.handleItemMouseEnter(i) }}
                onMouseLeave={() => { this.handleItemMouseLeave(i) }}
                onClick={() => { this.handleItemClick(item) }}
                selected={!this.props.multipleSelection && value === selectedValue}
                multipleSelected={this.props.multipleSelection && multipleSelected}
                dim={this.props.dimFirstItem && i === 0}
                paddingLeft={this.props.multipleSelection ? 8 : 16}
              >
                {this.props.multipleSelection ? (
                  <Checkmark
                    innerRef={ref => { this.checkmarkRefs[`${label}-${value || ''}`] = ref }}
                    dangerouslySetInnerHTML={{ __html: checkmarkImage }}
                    show={multipleSelected}
                  />
                ) : null}
                <Labels>
                  {label === '' ? '\u00A0' : label}
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
          return this.props.selectedItems.map(i => this.getLabel(this.props.items.find(item =>
            this.getValue(item) === this.getValue(i)))).join(', ')
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
        {this.props.required ? <Required disabledLoading={this.props.disabledLoading} /> : null}
        {this.renderList()}
      </Wrapper>
    )
  }
}

export default Dropdown
