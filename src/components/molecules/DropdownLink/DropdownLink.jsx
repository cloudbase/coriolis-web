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
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Palette from '../../styleUtils/Palette'

import arrowImage from './images/arrow.svg'
import checkmarkImage from './images/checkmark.svg'

const Wrapper = styled.div`
  display: inline-block;
  position: relative;
`
const LinkButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`
const List = styled.div`
  position: absolute;
  top: 28px;
  right: -7px;
  z-index: 20;
  padding: 8px;
  background: ${Palette.grayscale[1]};
  border-radius: 4px;
  border: 1px solid ${Palette.grayscale[0]};
  width: 110px;

  &:after {
    content: ' ';
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
  }
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
const ListItemLabel = styled.div``
const Checkmark = styled.div`
  width: 16px;
  height: 16px;
  background: ${props => props.show ? `url('${checkmarkImage}') center no-repeat` : 'transparent'};
  margin-right: 8px;
`
const Label = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${Palette.primary};
`
const Arrow = styled.div`
  width: 16px;
  height: 16px;
  background: url('${arrowImage}') center no-repeat;
  margin-left: 4px;
  margin-top: -1px;
`

class DropdownLink extends React.Component {
  static propTypes = {
    selectedItem: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
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
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick, false)
  }

  handlePageClick() {
    if (!this.itemMouseDown) {
      this.setState({ showDropdownList: false })
    }
  }

  handleButtonClick() {
    this.setState({ showDropdownList: !this.state.showDropdownList })
  }

  handleItemClick(item) {
    this.setState({ showDropdownList: false })

    if (this.props.onChange) {
      this.props.onChange(item)
    }
  }

  renderList() {
    if (!this.props.items || this.props.items.length === 0 || !this.state.showDropdownList) {
      return null
    }

    return (
      <List>
        {this.props.items.map((item) => {
          let listItem = (
            <ListItem
              key={item.label}
              onMouseDown={() => { this.itemMouseDown = true }}
              onMouseUp={() => { this.itemMouseDown = false }}
              onClick={() => { this.handleItemClick(item) }}
              selected={item.value === this.props.selectedItem}
            >
              <Checkmark show={item.value === this.props.selectedItem} />
              <ListItemLabel>{item.label}</ListItemLabel>
            </ListItem>
          )

          return listItem
        })}
      </List>
    )
  }

  render() {
    return (
      <Wrapper>
        <LinkButton
          onMouseDown={() => { this.itemMouseDown = true }}
          onMouseUp={() => { this.itemMouseDown = false }}
          onClick={() => this.handleButtonClick()}
        >
          <Label>{this.props.items.find(i => i.value === this.props.selectedItem).label}</Label>
          <Arrow />
        </LinkButton>
        {this.renderList()}
      </Wrapper>
    )
  }
}

export default DropdownLink
