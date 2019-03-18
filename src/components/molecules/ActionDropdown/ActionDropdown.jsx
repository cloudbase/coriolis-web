
/*
Copyright (C) 2019  Cloudbase Solutions SRL
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
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'
import autobind from 'autobind-decorator'

import DropdownButton from '../../atoms/DropdownButton/DropdownButton'
import { List, ListItems, Tip } from '../DropdownLink/DropdownLink'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

const Wrapper = styled.div`
  position: relative;
`

const ListItem = styled.div`
  color: ${props => props.disabled ? Palette.grayscale[2] : props.color || Palette.black};
  height: 32px;
  padding: 0 16px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  display: flex;
  align-items: center;
  transition: all ${StyleProps.animations.swift};
  &:hover {
    ${props => props.disabled ? '' : css`background: ${Palette.grayscale[0]};`}
  }
  &:first-child {
    border-top-left-radius: ${StyleProps.borderRadius};
    border-top-right-radius: ${StyleProps.borderRadius};
  }
  &:last-child {
    border-bottom-left-radius: ${StyleProps.borderRadius};
    border-bottom-right-radius: ${StyleProps.borderRadius};
  }
`
const ListStyle = css`
  box-shadow: 0 0 8px 0px rgba(111, 114, 118, 0.51);
  border: none;
`
export const TEST_ID = 'actionDropdown'
export type Action = {
  label: string,
  color?: string,
  action: () => void,
  disabled?: boolean,
  hidden?: boolean,
}
export type Props = {
  label: string,
  actions: Action[],
  style?: any,
  'data-test-id'?: string,
}

type State = {
  showDropdownList: boolean,
}

@observer
class ActionDropdown extends React.Component<Props, State> {
  static defaultProps: $Shape<Props> = {
    label: 'Actions',
  }

  state = {
    showDropdownList: false,
  }

  itemMouseDown: boolean
  listRef: HTMLElement
  tipRef: HTMLElement
  buttonRef: HTMLElement

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick, false)
  }

  componentDidUpdate() {
    this.updateListPosition()
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick, false)
  }

  updateListPosition() {
    if (!this.state.showDropdownList || !this.listRef || !this.tipRef || !this.buttonRef) {
      return
    }
    let tipHeight = this.tipRef.offsetHeight / 2
    let topOffset = 6
    let buttonRect = this.buttonRef.getBoundingClientRect()

    // If a modal is opened, body scroll is removed and body top is set to replicate scroll position
    let scrollOffset = 0
    if (document.body && parseInt(document.body.style.top, 10) < 0) {
      scrollOffset = -parseInt(document.body && document.body.style.top, 10)
    }

    this.listRef.style.top = `${buttonRect.top + buttonRect.height + tipHeight + topOffset + (window.pageYOffset || scrollOffset)}px`
    this.listRef.style.left = `${buttonRect.left + window.pageXOffset}px`
  }

  @autobind
  handlePageClick() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false })
    }
  }

  handleButtonClick() {
    this.setState({ showDropdownList: !this.state.showDropdownList })
  }

  handleItemMouseHover(action: Action, index: number, isEnter: boolean) {
    if (!this.tipRef || index !== 0 || action.disabled) {
      return
    }
    this.tipRef.style.background = isEnter ? Palette.grayscale[0] : Palette.grayscale[1]
  }

  handleItemClick(action: Action) {
    if (action.disabled) {
      return
    }
    action.action()
    this.setState({ showDropdownList: false })
  }

  renderListItems() {
    return (
      <ListItems>
        {this.props.actions.filter(a => !a.hidden).map((action, i) => (
          <ListItem
            onMouseEnter={() => { this.handleItemMouseHover(action, i, true) }}
            onMouseLeave={() => { this.handleItemMouseHover(action, i, false) }}
            onMouseDown={() => { this.itemMouseDown = true }}
            onMouseUp={() => { this.itemMouseDown = false }}
            key={action.label}
            onClick={() => { this.handleItemClick(action) }}
            color={action.color}
            disabled={action.disabled}
            data-test-id={`${TEST_ID}-listItem-${action.label}`}
          >
            {action.label}
          </ListItem>
        ))}
      </ListItems>
    )
  }

  renderList() {
    if (!this.state.showDropdownList) {
      return null
    }

    let body: any = document.body
    return ReactDOM.createPortal((
      <List
        innerRef={list => { this.listRef = list }}
        width={`${StyleProps.inputSizes.regular.width}px`}
        padding={0}
        customStyle={ListStyle}
        data-test-id={`${TEST_ID}-list`}
      >
        <Tip innerRef={ref => { this.tipRef = ref }} borderColor={'rgba(111, 114, 118, 0.2)'} />
        {this.renderListItems()}
      </List>
    ), body)
  }

  render() {
    return (
      <Wrapper style={this.props.style} data-test-id={this.props['data-test-id']}>
        <DropdownButton
          secondary
          centered
          value={this.props.label}
          customRef={ref => { this.buttonRef = ref }}
          onClick={() => { this.handleButtonClick() }}
          data-test-id={`${TEST_ID}-dropdownButton`}
        />
        {this.renderList()}
      </Wrapper>
    )
  }
}

export default ActionDropdown
