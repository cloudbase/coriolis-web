/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

import Arrow from '@src/components/ui/Arrow/Arrow'
import HorizontalLoading from '@src/components/ui/HorizontalLoading/HorizontalLoading'

import { ThemePalette, ThemeProps } from '@src/components/Theme'

const Wrapper = styled.div<any>`
  display: flex;
  justify-content: center;
  flex-shrink: 0;
`
const pageStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${ThemePalette.grayscale[1]};
  :focus {
    ${(props: any) => (props.disabled ? css`outline: none;` : '')}
  }
`
const pageButtonStyle = css`
  width: 32px;
  height: 30px;
  cursor: ${(props: any) => (props.disabled ? 'default' : 'pointer')};
  padding-top: 2px;
`
const PagePrevious = styled.div<any>`
  border-top-left-radius: ${ThemeProps.borderRadius};
  border-bottom-left-radius: ${ThemeProps.borderRadius};
  ${pageStyle}
  ${pageButtonStyle}
`
const PageNext = styled.div<any>`
  border-top-right-radius: ${ThemeProps.borderRadius};
  border-bottom-right-radius: ${ThemeProps.borderRadius};
  ${pageStyle}
  ${pageButtonStyle}
`
const PageNumber = styled.div<any>`
  width: 64px;
  height: 29px;
  flex-direction: column;
  margin: 0 1px;
  padding-top: 3px;
  ${pageStyle}
`

type Props = {
  className?: string,
  style?: any,
  previousDisabled: boolean,
  onPreviousClick: () => void,
  currentPage: number,
  totalPages: number,
  loading?: boolean,
  nextDisabled: boolean,
  onNextClick: () => void,
}

@observer
class Pagination extends React.Component<Props> {
  goTo(type: 'previous' | 'next') {
    if (type === 'previous' && !this.props.previousDisabled) {
      this.props.onPreviousClick()
    }
    if (type === 'next' && !this.props.nextDisabled) {
      this.props.onNextClick()
    }
  }

  handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>, type: 'previous' | 'next') {
    if (e.key !== ' ') {
      return
    }
    e.preventDefault()
    this.goTo(type)
  }

  render() {
    return (
      <Wrapper
        className={this.props.className}
        style={this.props.style}
        onMouseDown={(e: { preventDefault: () => void }) => { e.preventDefault() }}
      >
        <PagePrevious
          disabled={this.props.previousDisabled}
          tabIndex={0}
          onClick={() => { this.goTo('previous') }}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => { this.handleKeyDown(e, 'previous') }}
        >
          <Arrow orientation="left" disabled={this.props.previousDisabled} color={ThemePalette.black} thick />
        </PagePrevious>
        <PageNumber>
          {this.props.currentPage} of {this.props.totalPages}
          {this.props.loading ? (
            <HorizontalLoading style={{ width: '100%', top: '3px' }} />
          ) : null}
        </PageNumber>
        <PageNext
          disabled={this.props.nextDisabled}
          tabIndex={0}
          onClick={() => { this.goTo('next') }}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => { this.handleKeyDown(e, 'next') }}
        >
          <Arrow disabled={this.props.nextDisabled} color={ThemePalette.black} thick />
        </PageNext>
      </Wrapper>
    )
  }
}

export default Pagination
