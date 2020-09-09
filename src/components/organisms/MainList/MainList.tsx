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
import styled from 'styled-components'

import StatusImage from '../../atoms/StatusImage'
import Button from '../../atoms/Button'

import Palette from '../../styleUtils/Palette'

const Wrapper = styled.div<any>`
  margin-top: 8px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 900px;
`
const Separator = styled.div<any>`
  height: 1px;
  background: ${Palette.grayscale[1]};;
`
const Loading = styled.div<any>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
`
const LoadingText = styled.div<any>`
  font-size: 18px;
  margin-top: 39px;
`
const List = styled.div<any>`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
`

const NoResults = styled.div<any>`
  margin-top: 39px;
  text-align: center;
`
const EmptyList = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  justify-content: center;
  flex-grow: 1;
`
const EmptyListImage = styled.div<any>`
  width: 96px;
  height: 96px;
  background: url('${props => props.source}') center no-repeat;
  background-size: contain;
  margin-bottom: 46px;
`
const EmptyListMessage = styled.div<any>`
  font-size: 18px;
`
const EmptyListExtraMessage = styled.div<any>`
  max-width: 700px;
  text-align: center;
  margin: 10px 0 25px 0;
`
export type ItemComponentProps = {
  key: string,
  item: any,
  selected: boolean,
  onClick: () => void,
  onSelectedChange: (checked: boolean) => void
}
type Props = {
  items: any[],
  selectedItems: any[],
  loading: boolean,
  onSelectedChange: (item: any, checked: boolean) => void,
  onItemClick: (item: any) => void,
  renderItemComponent: (componentProps: ItemComponentProps) => React.ReactNode,
  showEmptyList: boolean,
  emptyListImage?: string | null,
  emptyListMessage?: string,
  emptyListExtraMessage?: string,
  emptyListButtonLabel?: string,
  onEmptyListButtonClick?: () => void,
}
@observer
class MainList extends React.Component<Props> {
  renderList() {
    if (!this.props.items || this.props.items.length === 0) {
      return null
    }

    return (
      <List>
        {this.props.items.map(item => {
          const selected = Boolean(this.props.selectedItems.find(i => i.id === item.id))
          return this.props.renderItemComponent({
            key: item.id,
            item,
            selected,
            onClick: () => { this.props.onItemClick(item) },
            onSelectedChange: checked => { this.props.onSelectedChange(item, checked) },
          })
        })}
      </List>
    )
  }

  renderLoading() {
    return (
      <Loading>
        <StatusImage loading data-test-id="mainList-loadingStatus" />
        <LoadingText>Loading ...</LoadingText>
      </Loading>
    )
  }

  renderNoResults() {
    return (
      <NoResults>No results</NoResults>
    )
  }

  renderEmptyList() {
    const renderImage = () => {
      if (this.props.emptyListImage) {
        return <EmptyListImage source={this.props.emptyListImage} />
      }
      return null
    }

    const renderButton = () => {
      if (this.props.emptyListButtonLabel) {
        return <Button onClick={this.props.onEmptyListButtonClick} data-test-id="mainList-emptyListButton">{this.props.emptyListButtonLabel}</Button>
      }
      return null
    }

    return (
      <EmptyList>
        {renderImage()}
        <EmptyListMessage data-test-id="mainList-emptyMessage">{this.props.emptyListMessage}</EmptyListMessage>
        <EmptyListExtraMessage>{this.props.emptyListExtraMessage}</EmptyListExtraMessage>
        {renderButton()}
      </EmptyList>
    )
  }

  render() {
    const renderContent = () => {
      if (this.props.loading) {
        return this.renderLoading()
      }

      if (this.props.showEmptyList) {
        return this.renderEmptyList()
      }

      if (this.props.items.length === 0) {
        return this.renderNoResults()
      }

      return this.renderList()
    }

    return (
      <Wrapper>
        {this.props.loading || this.props.items.length === 0 || this.props.showEmptyList
          ? <Separator /> : null}
        {renderContent()}
      </Wrapper>
    )
  }
}

export default MainList
