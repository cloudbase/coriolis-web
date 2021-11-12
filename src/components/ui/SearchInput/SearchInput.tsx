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
import autobind from 'autobind-decorator'

import SearchButton from '../SearchButton/SearchButton'
import TextInput from '../TextInput/TextInput'
import StatusIcon from '../StatusComponents/StatusIcon/StatusIcon'
import { ThemeProps } from '../../Theme'

const Input = styled(TextInput)<any>`
  padding-left: 32px;
  ${props => (props.loading || (props.showClose && props.value) ? 'padding-right: 32px;' : '')}
  width: 50px;
  opacity: 0;
  transition: all ${ThemeProps.animations.swift};
`
const InputAnimation = (props: any) => css`
  ${Input} {
    width: ${props.width};
    opacity: 1;
  }
`
const Wrapper = styled.div<any>`
  position: relative;
  width: ${props => (props.open ? props.width : '50px')};
  ${props => (props.open ? InputAnimation(props) : '')}
`
const SearchButtonStyled = styled(SearchButton)<any>`
  position: absolute;
  top: 8px;
  left: 8px;
`
const StatusIconStyled = styled(StatusIcon)`
  position: absolute;
  right: 8px;
  top: 8px;
`

type Props = {
  onChange?: (value: string) => void,
  onCloseClick?: () => void,
  alwaysOpen?: boolean,
  loading?: boolean,
  focusOnMount?: boolean,
  disablePrimary?: boolean,
  useFilterIcon?: boolean,
  placeholder?: string,
  width?: string,
  value?: string,
  className?: string,
}
type State = {
  open: boolean,
  hover?: boolean,
  focus: boolean,
}
@observer
class SearchInput extends React.Component<Props, State> {
  static defaultProps = {
    placeholder: 'Search',
    width: `${ThemeProps.inputSizes.regular.width}px`,
    value: '',
  }

  state: State = {
    open: false,
    focus: false,
  }

  input: HTMLElement | null | undefined

  itemMouseDown: boolean | undefined

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick, false)

    if (this.props.focusOnMount && this.input) this.input.focus()
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick, false)
  }

  @autobind
  handlePageClick() {
    if (!this.itemMouseDown) {
      this.setState({ open: false })
    }
  }

  handleSearchButtonClick() {
    if (this.input) this.input.focus()
    this.setState(prevState => ({ open: !prevState.open }))
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
        open={this.state.open || this.props.alwaysOpen || this.props.value !== ''}
        onMouseDown={() => { this.itemMouseDown = true }}
        onMouseUp={() => { this.itemMouseDown = false }}
        onMouseEnter={() => { this.handleMouseEnter() }}
        onMouseLeave={() => { this.handleMouseLeave() }}
        width={this.props.width}
        className={this.props.className}
      >
        <Input
          _ref={(input: HTMLElement | null | undefined) => { this.input = input }}
          placeholder={this.props.placeholder}
          onChange={(e: { target: { value: string } }) => {
            if (this.props.onChange) this.props.onChange(e.target.value)
          }}
          onFocus={() => { this.handleFocus() }}
          onBlur={() => { this.handleBlur() }}
          loading={this.props.loading}
          value={this.props.value}
          disablePrimary={this.props.disablePrimary}
          showClose={
            !this.props.loading
            && (this.state.open || this.props.alwaysOpen || this.props.value !== '')
          }
          onCloseClick={() => { if (this.props.onCloseClick) this.props.onCloseClick() }}
        />
        <SearchButtonStyled
          primary={
            this.state.open
            || (this.props.alwaysOpen && (this.state.hover || this.state.focus))
            || (this.props.value !== '' && (this.state.hover || this.state.focus))
          }
          onClick={() => { this.handleSearchButtonClick() }}
          useFilterIcon={this.props.useFilterIcon}
          data-test-id="searchInput-button"
        />
        {this.props.loading ? <StatusIconStyled status="RUNNING" data-test-id="searchInput-loading" /> : null}
      </Wrapper>
    )
  }
}

export default SearchInput
