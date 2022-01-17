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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'
import ReactDOM from 'react-dom'
import autobind from 'autobind-decorator'

import DropdownButton from '@src/components/ui/Dropdowns/DropdownButton'

import { ThemePalette, ThemeProps } from '@src/components/Theme'
import DomUtils from '@src/utils/DomUtils'

import checkmarkImage from './images/checkmark'
import tipImage from './images/tip'
import requiredImage from './images/required.svg'

const getWidth = (props: any) => {
  if (props.width) {
    return props.width - 2
  }

  return ThemeProps.inputSizes.regular.width - 2
}
const Wrapper = styled.div<any>`
  position: relative;
  ${(props: any) => (props.embedded ? 'width: 100%;' : '')}
  &:focus {
    outline: none;
  }
`
const Required = styled.div<any>`
  position: absolute;
  width: 8px;
  height: 8px;
  right: ${(props: any) => props.right}px;
  top: 12px;
  background: url('${requiredImage}') center no-repeat;
  ${(props: any) => (props.disabledLoading ? ThemeProps.animations.disabledLoading : '')}
`
const List = styled.div<any>`
  position: absolute;
  background: white;
  cursor: pointer;
  width: ${(props: any) => getWidth(props)}px;
  border: 1px solid ${ThemePalette.grayscale[3]};
  border-radius: ${ThemeProps.borderRadius};
  z-index: 1000;
  ${ThemeProps.boxShadow}
`
const ListItems = styled.div<any>`
  max-height: 400px;
  overflow: auto;
`
export const Tip = styled.div<any>`
  position: absolute;
  width: 16px;
  height: 8px;
  right: 8px;
  top: -8px;
  z-index: 11;
  transition: all ${ThemeProps.animations.swift};
  overflow: hidden;
  svg {
    #path {
      transition: all ${ThemeProps.animations.swift};
      fill: ${props => (props.primary ? ThemePalette.primary : 'white')};
    }
  }
`
const Checkmark = styled.div<any>`
  ${ThemeProps.exactWidth('16px')}
  height: 16px;
  margin-right: 8px;
  margin-top: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  #symbol {
    transition: stroke ${ThemeProps.animations.swift};
    stroke-dasharray: 12;
    stroke-dashoffset: ${(props: any) => (props.show ? 24 : 12)};
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
const getListItemColor = (props: any) => {
  if (props.disabled) {
    return ThemePalette.grayscale[3]
  }
  if (props.multipleSelected) {
    return ThemePalette.primary
  }
  if (props.selected) {
    return 'white'
  }
  if (props.dim) {
    return ThemePalette.grayscale[3]
  }
  return ThemePalette.grayscale[4]
}
const getListBackgroundColor = (props: any) => {
  if (props.arrowSelected) {
    return css`background: ${ThemePalette.primary}44;`
  }
  if (props.selected) {
    return css`background: ${ThemePalette.primary};`
  }
  return ''
}
const ListItem = styled.div<any>`
  position: relative;
  display: flex;
  color: ${(props: any) => getListItemColor(props)};
  ${(props: any) => getListBackgroundColor(props)}
  ${(props: any) => (props.selected ? css`font-weight: ${ThemeProps.fontWeights.medium};` : '')}
  padding: 8px 16px;
  transition: all ${ThemeProps.animations.swift};
  padding-left: ${(props: any) => props.paddingLeft}px;
  word-break: break-word;
  ${props => (props.disabled ? css`cursor: default;` : '')}

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
    ${Checkmark} #symbol {
      stroke: white;
    }
  }
`
const SubtitleLabel = styled.div`
  display: flex;
  font-size: 11px;
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
const Separator = styled.div<any>`
  width: calc(100% - 32px);
  height: 1px;
  margin: 8px 16px;
  background: ${ThemePalette.grayscale[3]};
`
const Labels = styled.div<any>`
  word-break: break-word;
  max-width: 100%;
`

export const updateTipStyle = (
  listItemsRef: HTMLElement,
  tipRef: HTMLElement,
  firstItemRef: HTMLElement,
) => {
  const usableFirstItemRef = firstItemRef
  if (listItemsRef && tipRef && usableFirstItemRef) {
    const svgPath: SVGPathElement | null = tipRef.querySelector('#path')
    if (svgPath) {
      if (listItemsRef.clientHeight < listItemsRef.scrollHeight) {
        svgPath.style.fill = 'white'
        usableFirstItemRef.style.borderTopRightRadius = '0'
      } else {
        svgPath.style.fill = ''
        usableFirstItemRef.style.borderTopRightRadius = ''
      }
    }
  }
}

export const scrollItemIntoView = (
  listRef: HTMLElement,
  listItemsRef: HTMLElement,
  itemIndex: number,
) => {
  const usableListItemsRef = listItemsRef
  if (!listRef || !usableListItemsRef) {
    return
  }
  if (itemIndex === -1 || !listItemsRef.children[itemIndex]) {
    return
  }
  const child = usableListItemsRef.children[itemIndex] as HTMLElement | null
  const parentNode = child && (child.parentNode as HTMLElement | null)
  if (!parentNode || !child) {
    return
  }
  parentNode.scrollTop = child.offsetTop - parentNode.offsetTop - 32
}

export const handleKeyNavigation = (options: {
  submitKeys: string[],
  keyboardEvent: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>,
  arrowSelection: number | null,
  items: any[],
  selectedItem: any,
  onSubmit: (item: any) => void,
  onGetValue: (item: any) => any,
  onSelection: (arrowSelection: number) => void,
}) => {
  const {
    submitKeys, keyboardEvent, arrowSelection,
    items, onSubmit, onGetValue, selectedItem, onSelection,
  } = options
  if (submitKeys.find(k => k === keyboardEvent.key)) {
    keyboardEvent.preventDefault()
    if (arrowSelection == null) {
      return
    }
    window.handlingEnterKey = true // Needed for KeyboardManager conflict resolution
    const arrowSelectedItem = items[arrowSelection]
    if (arrowSelectedItem) {
      onSubmit(arrowSelectedItem)
    }
    setTimeout(() => { window.handlingEnterKey = false }, 100)
    return
  }
  if (keyboardEvent.key !== 'ArrowUp' && keyboardEvent.key !== 'ArrowDown') {
    return
  }
  keyboardEvent.preventDefault()
  const itemIndex = items.findIndex(i => onGetValue(i) === onGetValue(selectedItem))
  const currentIndex = arrowSelection == null ? itemIndex : arrowSelection
  const maxIndex = items.length - 1

  if (keyboardEvent.key === 'ArrowUp') {
    onSelection(currentIndex === 0 ? maxIndex : currentIndex - 1)
  }

  if (keyboardEvent.key === 'ArrowDown') {
    onSelection(currentIndex === maxIndex ? 0 : currentIndex + 1)
  }
}

type Props = {
  selectedItem?: any,
  items: any[],
  labelField?: string,
  valueField?: string,
  className?: string,
  onChange?: (item: any) => void,
  noItemsMessage?: string,
  noSelectionMessage?: string,
  disabled?: boolean,
  disabledLoading?: boolean,
  width?: number,
  'data-test-id'?: string,
  embedded?: boolean,
  dimFirstItem?: boolean,
  multipleSelection?: boolean,
  selectedItems?: any[] | null,
  highlight?: boolean,
  required?: boolean,
  centered?: boolean,
  useBold?: boolean,
  primary?: boolean
  labelRenderer?: (item: any, index: number) => React.ReactNode
}
type State = {
  showDropdownList: boolean,
  firstItemHover: boolean,
  arrowSelection: number | null,
}
@observer
class Dropdown extends React.Component<Props, State> {
  static defaultProps = {
    noSelectionMessage: 'Select an item',
  }

  state: State = {
    showDropdownList: false,
    firstItemHover: false,
    arrowSelection: null,
  }

  buttonRef: HTMLElement | null | undefined

  listRef: HTMLElement | null | undefined

  listItemsRef: HTMLElement | null | undefined

  firstItemRef: HTMLElement | null | undefined

  tipRef: HTMLElement | null | undefined

  scrollableParent: HTMLElement | null | undefined

  wrapperRef: HTMLElement | null | undefined

  buttonRect: ClientRect | null | undefined

  itemMouseDown: boolean | undefined

  justFocused: boolean | undefined

  ignoreFocusHandler: boolean | undefined

  checkmarkRefs: { [ref: string]: HTMLElement } = {}

  componentDidMount() {
    if (this.buttonRef) {
      this.scrollableParent = DomUtils.getScrollableParent(this.buttonRef)
      this.scrollableParent.addEventListener('scroll', this.handleScroll)
      window.addEventListener('resize', this.handleScroll)
      this.buttonRect = this.buttonRef.getBoundingClientRect()
    }
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (!this.props.multipleSelection) {
      return
    }
    // Clear checkmark if items are removed in newProps
    const newSelectedItems = newProps.selectedItems || []
    const oldSelectedItems = this.props.selectedItems || []
    const hash = (item: any) => `${this.getLabel(item)}-${this.getValue(item) || ''}`
    const needsCheckmarkClear = oldSelectedItems.filter(
      oldItem => !newSelectedItems.find(newItem => hash(oldItem) === hash(newItem)),
    )
    needsCheckmarkClear.forEach(clearItem => {
      this.toggleCheckmarkAnimation(clearItem, this.checkmarkRefs[hash(clearItem)], true)
    })
  }

  UNSAFE_componentWillUpdate() {
    if (this.buttonRef) this.buttonRect = this.buttonRef.getBoundingClientRect()
  }

  componentDidUpdate() {
    this.updateListPosition()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleScroll, false)
    if (this.scrollableParent) {
      this.scrollableParent.removeEventListener('scroll', this.handleScroll, false)
    }
  }

  getLabel(item: any) {
    const labelField = this.props.labelField || 'label'

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
    const valueField = this.props.valueField || 'value'

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

  toggleDropdownList(show: boolean = true) {
    if (this.props.disabled && show) {
      return
    }

    this.setState({ showDropdownList: show }, () => {
      this.scrollIntoView()
    })
  }

  handleFocus() {
    if (this.ignoreFocusHandler || this.props.disabled || this.props.disabledLoading) {
      return
    }

    this.justFocused = true
    this.toggleDropdownList(true)
    setTimeout(() => { this.justFocused = false }, 1000)
  }

  handleBlur() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false })
    }
  }

  handleKeyPress(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!this.state.showDropdownList) {
      return
    }
    handleKeyNavigation({
      submitKeys: ['Enter', ' '],
      keyboardEvent: e,
      arrowSelection: this.state.arrowSelection,
      items: this.props.items,
      selectedItem: this.props.selectedItem,
      onSubmit: item => { this.handleItemClick(item) },
      onGetValue: item => this.getValue(item),
      onSelection: arrowSelection => {
        this.setState({ arrowSelection }, () => {
          this.scrollIntoView(arrowSelection)
        })
      },
    })
  }

  handleButtonClick() {
    if (this.justFocused) {
      return
    }
    this.toggleDropdownList(!this.state.showDropdownList)
  }

  handleItemClick(item: any) {
    const resetFocus = () => {
      if (!this.wrapperRef) {
        return
      }
      this.ignoreFocusHandler = true
      this.wrapperRef.focus()
      setTimeout(() => { this.ignoreFocusHandler = false }, 100)
    }

    if (item.disabled) {
      resetFocus()
      return
    }

    if (!this.props.multipleSelection) {
      this.setState({ showDropdownList: false, firstItemHover: false }, () => {
        resetFocus()
      })
    } else {
      const selected = Boolean(
        this.props.selectedItems
        && this.props.selectedItems.find(i => this.getValue(i) === this.getValue(item)),
      )
      this.toggleCheckmarkAnimation(
        item,
        this.checkmarkRefs[`${this.getLabel(item)}-${this.getValue(item) || ''}`],
        selected,
      )
      resetFocus()
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
    const symbol = checkmarkRef.querySelector('#symbol') as HTMLElement
    if (symbol) {
      symbol.style.animationName = selected ? 'dashOff' : 'dashOn'
    }
  }

  updateListPosition() {
    if (!this.state.showDropdownList || !this.listRef || !this.buttonRef || !this.firstItemRef
      || !document.body || !this.buttonRect || !this.tipRef || !this.listItemsRef) {
      return
    }

    const buttonHeight = this.buttonRef.offsetHeight
    const tipHeight = 8
    let listTop = this.buttonRect.top + buttonHeight + tipHeight
    const listHeight = this.listRef.offsetHeight

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

    const widthDiff = this.listRef.offsetWidth - this.buttonRef.offsetWidth
    this.listRef.style.top = `${listTop + (window.pageYOffset || scrollOffset)}px`
    this.listRef.style.left = `${(this.buttonRect.left + window.pageXOffset) - widthDiff}px`
    updateTipStyle(this.listItemsRef, this.tipRef, this.firstItemRef)
  }

  scrollIntoView(itemIndex?: number) {
    const selectedItemIndex = this.props.items
      .findIndex(i => this.getValue(i) === this.getValue(this.props.selectedItem))
    const actualItemIndex = itemIndex != null ? itemIndex : selectedItemIndex
    if (this.listRef && this.listItemsRef) {
      scrollItemIntoView(this.listRef, this.listItemsRef, actualItemIndex)
    }
  }

  renderList() {
    if (!this.props.items || this.props.items.length === 0 || !this.state.showDropdownList) {
      return null
    }

    const { body } = document
    const selectedValue = this.getValue(this.props.selectedItem)
    const duplicatedLabels: any[] = []
    this.props.items.forEach((item, i) => {
      const label = this.getLabel(item)
      for (let j = i + 1; j < this.props.items.length; j += 1) {
        if (label === this.getLabel(this.props.items[j])
          && !duplicatedLabels.find(item2 => this.getLabel(item2) === label)) {
          duplicatedLabels.push(label)
        }
      }
    })
    const firstItemValue = this.props.items.length > 0 ? this.getValue(this.props.items[0]) : null
    const isFirstItemSelected = selectedValue === firstItemValue

    const list = ReactDOM.createPortal(
      (
        <List
        // eslint-disable-next-line react/jsx-props-no-spreading
          {...this.props}
          ref={(ref: HTMLElement | null | undefined) => { this.listRef = ref }}
        >
          <Tip
            ref={(ref: HTMLElement | null | undefined) => { this.tipRef = ref }}
            primary={this.state.firstItemHover || isFirstItemSelected}
            dangerouslySetInnerHTML={{ __html: tipImage }}
          />
          <ListItems ref={(ref: HTMLElement | null | undefined) => { this.listItemsRef = ref }}>
            {this.props.items.map((item, i) => {
              if (item.separator === true) {
                // eslint-disable-next-line react/no-array-index-key
                return <Separator key={`sep-${i}`} />
              }

              const label = this.getLabel(item)
              const value = this.getValue(item)
              const duplicatedLabel = duplicatedLabels.find(l => l === label)
              const multipleSelected = this.props.selectedItems && this.props.selectedItems
                .find(j => this.getValue(j) === value)
              const labelRenderer = this.props.labelRenderer ? this.props.labelRenderer(item, i) : label

              const listItem = (
                <ListItem
                  ref={(ref: HTMLElement | null | undefined) => {
                    if (i === 0) { this.firstItemRef = ref }
                  }}
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
                  arrowSelected={i === this.state.arrowSelection}
                  disabled={item.disabled}
                >
                  {this.props.multipleSelection ? (
                    <Checkmark
                      ref={(ref: HTMLElement) => { this.checkmarkRefs[`${label}-${value || ''}`] = ref }}
                      dangerouslySetInnerHTML={{ __html: checkmarkImage }}
                      show={multipleSelected}
                    />
                  ) : null}
                  <Labels>
                    {label === '' ? '\u00A0' : labelRenderer}
                    {item.subtitleLabel ? (
                      <SubtitleLabel>{item.subtitleLabel}</SubtitleLabel>
                    ) : null}

                    {duplicatedLabel ? <DuplicatedLabel>(<span>{value || ''}</span>)</DuplicatedLabel> : ''}
                  </Labels>
                </ListItem>
              )

              return listItem
            })}
          </ListItems>
        </List>
      ), body,
    )

    return list
  }

  render() {
    const buttonValue = () => {
      if (this.props.items && this.props.items.length) {
        if (this.props.multipleSelection && this.props.selectedItems
          && this.props.selectedItems.length > 0) {
          return this.props.selectedItems.map(i => this.getLabel(this.props.items.find(item => this.getValue(item) === this.getValue(i)))).join(', ')
        }
        return this.getLabel(this.props.selectedItem)
      }

      return this.props.noItemsMessage || ''
    }

    return (
      <Wrapper
        className={this.props.className}
        data-test-id={this.props['data-test-id'] || 'dropdown'}
        embedded={this.props.embedded}
        tabIndex={0}
        ref={(ref: HTMLElement | null | undefined) => { this.wrapperRef = ref }}
        onFocus={() => { this.handleFocus() }}
        onBlur={() => { this.handleBlur() }}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => { this.handleKeyPress(e) }}
      >
        <DropdownButton
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...this.props}
          data-test-id="dropdown-dropdownButton"
          customRef={ref => { this.buttonRef = ref }}
          value={buttonValue()}
          onClick={() => { this.handleButtonClick() }}
          outline={this.state.showDropdownList}
        />
        {this.props.required ? (
          <Required
            disabledLoading={this.props.disabledLoading}
            right={this.props.embedded ? -24 : -16}
          />
        ) : null}
        {this.renderList()}
      </Wrapper>
    )
  }
}

export default Dropdown
