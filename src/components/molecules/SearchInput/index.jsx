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
import styled, { css } from 'styled-components'

import SearchButton from '../../atoms/SearchButton'
import TextInput from '../../atoms/TextInput'
import StatusIcon from '../../atoms/StatusIcon'

import StyleProps from '../../styleUtils/StyleProps'

const Input = styled(TextInput) `
  position: absolute;
  top: -8px;
  left: -8px;
  padding-left: 32px;
  ${props => props.loading ? 'padding-right: 32px;' : ''}
  width: 50px;
  opacity: 0;
  transition: all ${StyleProps.animations.swift};
`
const InputAnimation = css`
  ${Input} {
    width: ${StyleProps.inputSizes.regular.width}px;
    opacity: 1;
  }
`
const Wrapper = styled.div`
  position: relative;
  ${props => props.open ? InputAnimation : ''}
`
const SearchButtonStyled = styled(SearchButton)`
  position: relative;
`
const StatusIconStyled = styled(StatusIcon)`
  position: absolute;
  left: 144px;
  top: 0;
`

type Props = {
  onChange: (value: string) => void,
  alwaysOpen?: boolean,
  loading?: boolean,
  placeholder: string,
}
type State = {
  open: boolean,
  hover?: boolean,
  focus?: boolean,
  value: string,
}
class SearchInput extends React.Component<Props, State> {
  static defaultProps = {
    placeholder: 'Search',
  }

  input: HTMLElement
  itemMouseDown: boolean

  constructor() {
    super()

    this.state = {
      open: false,
      value: '',
    }

    // $FlowIssue
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
      this.setState({ open: false })
    }
  }

  handleSearchButtonClick() {
    this.input && this.input.focus()
    this.setState({ open: !this.state.open })
  }

  handleMouseEnter() {
    this.setState({ hover: true })
  }

  handleMouseLeave() {
    this.setState({ hover: false })
  }

  handleFocus() {
    this.setState({ focus: true })
  }

  handleBlur() {
    this.setState({ focus: false })
  }

  render() {
    return (
      <Wrapper
        open={this.state.open || this.props.alwaysOpen || this.state.value !== ''}
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
        onMouseEnter={() => { this.handleMouseEnter() }}
        onMouseLeave={() => { this.handleMouseLeave() }}
      >
        <Input
          _ref={input => { this.input = input }}
          placeholder={this.props.placeholder}
          onChange={e => {
            this.setState({ value: e.target.value })
            this.props.onChange(e.target.value)
          }}
          value={this.state.value}
          onFocus={() => { this.handleFocus() }}
          onBlur={() => { this.handleBlur() }}
          loading={this.props.loading}
        />
        <SearchButtonStyled
          primary={
            this.state.open ||
            (this.props.alwaysOpen && (this.state.hover || this.state.focus)) ||
            (this.state.value !== '' && (this.state.hover || this.state.focus))
          }
          onClick={() => { this.handleSearchButtonClick() }}
        />
        {this.props.loading ? <StatusIconStyled status="RUNNING" /> : null}
      </Wrapper>
    )
  }
}

export default SearchInput
