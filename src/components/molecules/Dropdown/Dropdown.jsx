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
import PropTypes from 'prop-types'
import styled from 'styled-components'
import ReactDOM from 'react-dom'

import { DropdownButton } from 'components'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div`
  position: relative;
`
const getWidth = props => {
  if (props.large) {
    return StyleProps.inputSizes.large.width - 2
  }

  if (props.width) {
    return props.width - 2
  }

  return StyleProps.inputSizes.regular.width - 2
}
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
const ListItem = styled.div`
  position: relative;
  color: ${Palette.grayscale[4]};
  padding: 8px 16px;
  transition: all ${StyleProps.animations.swift};
  ${props => props.selected ? `font-weight: ${StyleProps.fontWeights.medium};` : ''}

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

class Dropdown extends React.Component {
  static propTypes = {
    selectedItem: PropTypes.any,
    items: PropTypes.array,
    labelField: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    noItemsMessage: PropTypes.string,
    noSelectionMessage: PropTypes.string,
    disabled: PropTypes.bool,
    width: PropTypes.number,
  }

  static defaultProps = {
    noSelectionMessage: 'Select an item',
  }

  constructor() {
    super()

    this.state = {
      showDropdownList: false,
    }

    this.handlePageClick = this.handlePageClick.bind(this)
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick, false)
    if (this.buttonRef) this.buttonRect = this.buttonRef.getBoundingClientRect()
  }

  componentWillUpdate() {
    if (this.buttonRef) this.buttonRect = this.buttonRef.getBoundingClientRect()
  }

  componentDidUpdate() {
    this.updateListPosition()
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick, false)
  }

  getLabel(item) {
    let labelField = this.props.labelField || 'label'

    if (item === null || item === undefined) {
      return this.props.noSelectionMessage
    }

    return (item[labelField] !== null && item[labelField] !== undefined && item[labelField].toString()) || item.toString()
  }

  updateListPosition() {
    if (!this.state.showDropdownList || !this.listRef || !this.buttonRef) {
      return
    }

    let buttonHeight = this.buttonRef.offsetHeight
    let tipHeight = 8
    let listTop = this.buttonRect.top + buttonHeight + tipHeight
    let listHeight = this.listRef.offsetHeight

    if (listTop + listHeight > window.innerHeight) {
      listTop = window.innerHeight - listHeight - 10
      this.tipRef.style.display = 'none'
    } else {
      this.tipRef.style.display = 'block'
    }

    // If a modal is opened, body scroll is removed and body top is set to replicate scroll position
    let scrollOffset = 0
    if (parseInt(document.body.style.top, 10) < 0) {
      scrollOffset = -parseInt(document.body.style.top, 10)
    }

    this.listRef.style.top = `${listTop + (window.pageYOffset || scrollOffset)}px`
    this.listRef.style.left = `${this.buttonRect.left}px`
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

    this.setState({ showDropdownList: !this.state.showDropdownList })
  }

  handleItemClick(item) {
    this.setState({ showDropdownList: false, firstItemHover: false })

    if (this.props.onChange) {
      this.props.onChange(item)
    }
  }

  handleItemMouseEnter(index) {
    if (index === 0) {
      this.setState({ firstItemHover: true })
    }
  }

  handleItemMouseLeave(index) {
    if (index === 0) {
      this.setState({ firstItemHover: false })
    }
  }

  renderList() {
    if (!this.props.items || this.props.items.length === 0 || !this.state.showDropdownList) {
      return null
    }

    let selectedLabel = this.getLabel(this.props.selectedItem)
    let list = ReactDOM.createPortal((
      <List {...this.props} innerRef={ref => { this.listRef = ref }}>
        <Tip innerRef={ref => { this.tipRef = ref }} primary={this.state.firstItemHover} />
        <ListItems>
          {this.props.items.map((item, i) => {
            let label = this.getLabel(item)
            let listItem = (
              <ListItem
                key={label}
                onMouseDown={() => { this.itemMouseDown = true }}
                onMouseUp={() => { this.itemMouseDown = false }}
                onMouseEnter={() => { this.handleItemMouseEnter(i) }}
                onMouseLeave={() => { this.handleItemMouseLeave(i) }}
                onClick={() => { this.handleItemClick(item) }}
                selected={label === selectedLabel}
              >{label}
              </ListItem>
            )

            return listItem
          })}
        </ListItems>
      </List>
    ), document.body)

    return list
  }

  render() {
    let buttonValue = () => {
      if (this.props.items && this.props.items.length) {
        return this.getLabel(this.props.selectedItem)
      }

      return this.props.noItemsMessage || ''
    }

    return (
      <Wrapper
        className={this.props.className}
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
      >
        <DropdownButton
          {...this.props}
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
