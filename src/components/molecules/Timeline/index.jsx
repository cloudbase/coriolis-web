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
import styled from 'styled-components'

import type { Execution } from '../../../types/Execution'
import Arrow from '../../atoms/Arrow'
import StatusIcon from '../../atoms/StatusIcon'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import DateUtils from '../../../utils/DateUtils'

const ArrowStyled = styled(Arrow) `
  opacity: ${props => props.forceShow ? 1 : 0};
  position: absolute;
  top: 0;
  transition: all ${StyleProps.animations.swift};
  ${props => props.orientation === 'left' ? 'left: -19px;' : ''}
  ${props => props.orientation === 'right' ? 'right: -19px;' : ''}
`
const Wrapper = styled.div`
  position: relative;
  height: 30px;
  user-select: none;
  &:hover ${ArrowStyled} {
    opacity: 1;
  }
`
const MainLine = styled.div`
  width: 100%;
  padding-top: 7px;
  display: flex;
`
const ProgressLine = styled.div`
  border-bottom: 2px solid ${Palette.primary};
  transition: all ${StyleProps.animations.swift};
`
const EndLine = styled.div`
  border-bottom: 2px solid ${Palette.grayscale[2]};
  transition: all ${StyleProps.animations.swift};
`
const ItemsWrapper = styled.div`
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`
const Items = styled.div`
  display: flex;
`
const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 90px;
  cursor: pointer;
  min-width: 75px;
  max-width: 75px;
`
const ItemLabel = styled.div`
  font-size: 12px;
  color: ${Palette.grayscale[4]};
  margin-top: 2px;
  ${props => props.selected ? `color: ${Palette.black};` : ''}
  ${props => props.selected ? `font-weight: ${StyleProps.fontWeights.medium};` : ''}
`

type Props = {
  items: Execution[],
  selectedItem: ?Execution,
  onPreviousClick: () => void,
  onNextClick: () => void,
  onItemClick: (item: Execution) => void,
}
class Timeline extends React.Component<Props> {
  itemsRef: HTMLElement
  progressLineRef: HTMLElement
  wrapperRef: HTMLElement
  itemRef: HTMLElement
  endLineRef: HTMLElement

  componentDidMount() {
    this.moveToSelectedItem()

    if (!this.itemsRef) {
      return
    }
    this.itemsRef.style.transition = `all ${StyleProps.animations.swift}`
  }

  componentDidUpdate() {
    if (this.itemsRef && !this.itemsRef.style.transition) {
      this.itemsRef.style.transition = `all ${StyleProps.animations.swift}`
    }

    this.moveToSelectedItem()
  }

  moveToSelectedItem() {
    if (!this.progressLineRef || !this.endLineRef) {
      return
    }

    if (!this.itemRef || !this.props.selectedItem || !this.itemsRef) {
      this.progressLineRef.style.width = '0'
      this.endLineRef.style.width = '100%'
      return
    }

    // $FlowIssue
    let itemIndex = this.props.items.findIndex(i => i.id === this.props.selectedItem.id)
    let halfWidth = this.wrapperRef.offsetWidth / 2
    let itemGap = this.itemRef.offsetWidth + 90
    let itemHalfWidth = this.itemRef.offsetWidth / 2
    let offset = (halfWidth - (itemGap * itemIndex)) - itemHalfWidth

    this.itemsRef.style.marginLeft = `${offset}px`

    let lastItemPos = (itemGap * (this.props.items.length - 1)) + offset + itemHalfWidth
    this.progressLineRef.style.width = `${lastItemPos}px`
    this.endLineRef.style.width = `${Math.max(this.wrapperRef.offsetWidth - lastItemPos, 0)}px`
  }

  renderMainLine() {
    return (
      <MainLine>
        <ProgressLine innerRef={line => { this.progressLineRef = line }} />
        <EndLine innerRef={line => { this.endLineRef = line }} />
      </MainLine>
    )
  }

  renderItems() {
    if (!this.props.items || !this.props.items.length) {
      return null
    }

    return (
      <ItemsWrapper>
        <Items innerRef={items => { this.itemsRef = items }}>
          {this.props.items.map(item => (
            <Item
              key={item.id}
              innerRef={item => { this.itemRef = item }}
              onClick={() => { this.props.onItemClick(item) }}
            >
              <StatusIcon status={item.status} useBackground />
              <ItemLabel selected={this.props.selectedItem && this.props.selectedItem.id === item.id}>
                {DateUtils.getLocalTime(item.created_at).format('DD MMM YYYY')}
              </ItemLabel>
            </Item>
          ))}
        </Items>
      </ItemsWrapper>
    )
  }

  render() {
    return (
      <Wrapper innerRef={w => { this.wrapperRef = w }}>
        <ArrowStyled
          orientation="left"
          forceShow={!this.props.items || !this.props.items.length}
          primary={Boolean(this.props.items && this.props.items.length)}
          onClick={this.props.onPreviousClick}
        />
        {this.renderMainLine()}
        {this.renderItems()}
        <ArrowStyled
          orientation="right"
          forceShow={!this.props.items || !this.props.items.length}
          onClick={this.props.onNextClick}
        />
      </Wrapper>
    )
  }
}

export default Timeline
