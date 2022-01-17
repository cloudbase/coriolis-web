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

import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'
import autobind from 'autobind-decorator'

import DropdownButton from '@src/components/ui/Dropdowns/DropdownButton'
import { List, ListItems, Tip } from '@src/components/ui/Dropdowns/DropdownLink'

import { ThemePalette, ThemeProps } from '@src/components/Theme'
import StatusIcon from '@src/components/ui/StatusComponents/StatusIcon'

const Wrapper = styled.div<any>`
  position: relative;
`

const ListItem = styled.div<any>`
  color: ${(props: any) => (props.disabled ? ThemePalette.grayscale[2] : props.color || ThemePalette.black)};
  height: ${(props: any) => (props.large ? 42 : 32)}px;
  padding: 0 16px;
  cursor: ${(props: any) => (props.disabled ? 'default' : 'pointer')};
  display: flex;
  align-items: center;
  transition: all ${ThemeProps.animations.swift};
  &:hover {
    ${(props: any) => (props.disabled ? '' : css`background: ${ThemePalette.grayscale[0]};`)}
  }
  &:first-child {
    border-top-left-radius: ${ThemeProps.borderRadius};
    border-top-right-radius: ${ThemeProps.borderRadius};
  }
  &:last-child {
    border-bottom-left-radius: ${ThemeProps.borderRadius};
    border-bottom-right-radius: ${ThemeProps.borderRadius};
  }
`
const ListStyle = css`
  ${ThemeProps.boxShadow}
  border: none;
`
export const TEST_ID = 'actionDropdown'
export type Action = {
  label: string,
  color?: string,
  action: () => void,
  disabled?: boolean,
  hidden?: boolean,
  title?: string | null,
  loading?: boolean
}
export type Props = {
  label: string,
  actions: Action[],
  style?: any,
  'data-test-id'?: string,
  largeItems?: boolean
}

type State = {
  showDropdownList: boolean,
}

@observer
class ActionDropdown extends React.Component<Props, State> {
  static defaultProps = {
    label: 'Actions',
  }

  state = {
    showDropdownList: false,
  }

  itemMouseDown: boolean | undefined | null

  listRef: HTMLElement | undefined | null

  tipRef: HTMLElement | undefined | null

  buttonRef: HTMLElement | undefined | null

  buttonRect: ClientRect | undefined | null

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick, false)
    if (this.buttonRef) {
      this.buttonRect = this.buttonRef.getBoundingClientRect()
    }
  }

  UNSAFE_componentWillUpdate() {
    if (this.buttonRef) {
      this.buttonRect = this.buttonRef.getBoundingClientRect()
    }
  }

  componentDidUpdate() {
    this.updateListPosition()
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick, false)
  }

  updateListPosition() {
    if (!this.state.showDropdownList || !this.listRef
      || !this.tipRef || !this.buttonRef || !this.buttonRect) {
      return
    }
    const tipHeight = this.tipRef.offsetHeight / 2
    const topOffset = 6

    // If a modal is opened, body scroll is removed and body top is set to replicate scroll position
    let scrollOffset = 0
    if (document.body && parseInt(document.body.style.top, 10) < 0) {
      scrollOffset = -parseInt(document.body && document.body.style.top, 10)
    }

    this.listRef.style.top = `${this.buttonRect.top + this.buttonRect.height + tipHeight + topOffset + (window.pageYOffset || scrollOffset)}px`
    this.listRef.style.left = `${this.buttonRect.left + window.pageXOffset}px`
  }

  @autobind
  handlePageClick() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false })
    }
  }

  handleButtonClick() {
    this.setState(prevState => ({ showDropdownList: !prevState.showDropdownList }))
  }

  handleItemMouseHover(action: Action, index: number, isEnter: boolean) {
    if (!this.tipRef || index !== 0 || action.disabled) {
      return
    }
    this.tipRef.style.background = isEnter ? ThemePalette.grayscale[0] : ThemePalette.grayscale[1]
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
            title={action.title}
            large={this.props.largeItems}
          >
            {action.label}{action.loading ? <StatusIcon style={{ marginLeft: '4px', opacity: 0.3 }} status="RUNNING" /> : ''}
          </ListItem>
        ))}
      </ListItems>
    )
  }

  renderList() {
    if (!this.state.showDropdownList) {
      return null
    }

    const { body } = document
    return ReactDOM.createPortal(
      (
        <List
          ref={(list: HTMLElement | null | undefined) => { this.listRef = list }}
          width={`${ThemeProps.inputSizes.regular.width}px`}
          padding={0}
          customStyle={ListStyle}
        >
          <Tip ref={(ref: HTMLElement | null | undefined) => { this.tipRef = ref }} borderColor="rgba(111, 114, 118, 0.2)" />
          {this.renderListItems()}
        </List>
      ), body,
    )
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
