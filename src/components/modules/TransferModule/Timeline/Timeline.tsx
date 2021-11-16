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
import styled from 'styled-components'

import type { Execution } from '../../../../@types/Execution'
import Arrow from '../../../ui/Arrow/Arrow'
import StatusIcon from '../../../ui/StatusComponents/StatusIcon/StatusIcon'

import { ThemePalette, ThemeProps } from '../../../Theme'
import DateUtils from '../../../../utils/DateUtils'

const ITEM_GAP = 96

const ArrowStyled = styled(Arrow)<any>`
  opacity: ${props => (props.forceShow ? 1 : 0)};
  position: absolute;
  top: 0;
  transition: all ${ThemeProps.animations.swift};
  ${props => (props.orientation === 'left' ? 'left: -19px;' : '')}
  ${props => (props.orientation === 'right' ? 'right: -19px;' : '')}
`
const Wrapper = styled.div<any>`
  position: relative;
  height: 30px;
  user-select: none;
  &:hover ${ArrowStyled} {
    opacity: 1;
  }
`
const MainLine = styled.div<any>`
  width: 100%;
  padding-top: 7px;
  display: flex;
`
const ProgressLine = styled.div<any>`
  border-bottom: 2px solid ${ThemePalette.primary};
  transition: all ${ThemeProps.animations.swift};
`
const EndLine = styled.div<any>`
  border-bottom: 2px solid ${ThemePalette.grayscale[2]};
  transition: all ${ThemeProps.animations.swift};
`
const ItemsWrapper = styled.div<any>`
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`
const Items = styled.div<any>`
  display: flex;
`
const Item = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: ${ITEM_GAP}px;
  cursor: pointer;
  min-width: 75px;
  max-width: 75px;
`
const ItemLabel = styled.div<any>`
  font-size: 12px;
  color: ${ThemePalette.grayscale[4]};
  margin-top: 2px;
  ${props => (props.selected ? `color: ${ThemePalette.black};` : '')}
  ${props => (props.selected ? `font-weight: ${ThemeProps.fontWeights.medium};` : '')}
`

type Props = {
  items?: Execution[] | null,
  selectedItem?: Execution | null,
  onPreviousClick?: () => void,
  onNextClick?: () => void,
  onItemClick?: (item: Execution) => void,
}
@observer
class Timeline extends React.Component<Props> {
  itemsRef: HTMLElement | null | undefined

  progressLineRef: HTMLElement | null | undefined

  wrapperRef: HTMLElement | null | undefined

  itemRef: HTMLElement | null | undefined

  endLineRef: HTMLElement | null | undefined

  componentDidMount() {
    this.moveToSelectedItem()

    if (!this.itemsRef) {
      return
    }
    this.itemsRef.style.transition = `all ${ThemeProps.animations.swift}`
  }

  componentDidUpdate() {
    if (this.itemsRef && !this.itemsRef.style.transition) {
      this.itemsRef.style.transition = `all ${ThemeProps.animations.swift}`
    }

    this.moveToSelectedItem()
  }

  moveToSelectedItem() {
    if (!this.progressLineRef || !this.endLineRef || !this.props.items || !this.wrapperRef) {
      return
    }
    const selectedItem = this.props.selectedItem
    if (!this.itemRef || !selectedItem || !this.itemsRef) {
      this.progressLineRef.style.width = '0'
      this.endLineRef.style.width = '100%'
      return
    }

    const itemIndex = this.props.items.findIndex(i => i.id === selectedItem.id)
    const halfWidth = this.wrapperRef.offsetWidth / 2
    const itemGap = this.itemRef.offsetWidth + ITEM_GAP
    const itemHalfWidth = this.itemRef.offsetWidth / 2
    const offset = (halfWidth - (itemGap * itemIndex)) - itemHalfWidth

    this.itemsRef.style.marginLeft = `${offset}px`

    const lastItemPos = (itemGap * (this.props.items.length - 1)) + offset + itemHalfWidth
    this.progressLineRef.style.width = `${lastItemPos}px`
    this.endLineRef.style.width = `${Math.max(this.wrapperRef.offsetWidth - lastItemPos, 0)}px`
  }

  renderMainLine() {
    return (
      <MainLine>
        <ProgressLine ref={(line: HTMLElement | null | undefined) => {
          this.progressLineRef = line
        }}
        />
        <EndLine ref={(line: HTMLElement | null | undefined) => { this.endLineRef = line }} />
      </MainLine>
    )
  }

  renderItems() {
    if (!this.props.items || !this.props.items.length) {
      return null
    }

    return (
      <ItemsWrapper>
        <Items ref={(items: HTMLElement | null | undefined) => { this.itemsRef = items }}>
          {this.props.items.map(item => (
            <Item
              key={item.id}
              ref={(ref: HTMLElement | null | undefined) => { this.itemRef = ref }}
              onClick={() => { if (this.props.onItemClick) this.props.onItemClick(item) }}
              data-test-id={`timeline-item-${item.id}`}
            >
              <StatusIcon status={item.status} useBackground />
              <ItemLabel selected={this.props.selectedItem && this.props.selectedItem.id === item.id} data-test-id={`timeline-label-${item.id}`}>
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
      <Wrapper ref={(w: HTMLElement | null | undefined) => { this.wrapperRef = w }}>
        <ArrowStyled
          orientation="left"
          forceShow={!this.props.items || !this.props.items.length}
          primary={Boolean(this.props.items && this.props.items.length)}
          onClick={this.props.onPreviousClick}
          data-test-id="timeline-previous"
        />
        {this.renderMainLine()}
        {this.renderItems()}
        <ArrowStyled
          orientation="right"
          forceShow={!this.props.items || !this.props.items.length}
          onClick={this.props.onNextClick}
          data-test-id="timeline-next"
        />
      </Wrapper>
    )
  }
}

export default Timeline
