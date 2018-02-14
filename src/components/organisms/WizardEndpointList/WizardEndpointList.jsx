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
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'

import { EndpointLogos, Dropdown, StatusImage, Button } from 'components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  ${props => props.isCentered ? css`
    justify-content: center;
    align-items: center;
  ` : ''}
`
const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const EndpointLogosStyled = styled(EndpointLogos) `
  margin-bottom: 32px;
`
const Row = styled.div`
  display: flex;
  flex-shrink: 0;
  margin-bottom: 96px;
  &:last-child {
    margin-bottom: 0;
  }
  ${props => props.isIncomplete ? css`
    justify-content: center;
    ${Item} {
      margin-right: 112px;
      &:last-child {
        margin-right: 0px;
      }
    }
  ` : css`
    justify-content: space-between;
  `}
`

class WizardEndpointList extends React.Component {
  static propTypes = {
    providers: PropTypes.array,
    endpoints: PropTypes.array,
    loading: PropTypes.bool,
    selectedEndpoint: PropTypes.object,
    otherEndpoint: PropTypes.object,
    onChange: PropTypes.func,
    onAddEndpoint: PropTypes.func,
  }

  handleOnChange(selectedItem) {
    if (selectedItem.id !== 'addNew') {
      this.props.onChange(selectedItem)
      return
    }

    this.props.onAddEndpoint(selectedItem.provider)
  }

  renderProvider(provider) {
    let otherEndpoint = this.props.otherEndpoint
    let items = this.props.endpoints.filter(e => e.type === provider && (!otherEndpoint || otherEndpoint.id !== e.id))
    let selectedItem = this.props.selectedEndpoint && this.props.selectedEndpoint.type === provider
      ? this.props.selectedEndpoint : null
    let actionInput = null
    if (items.length > 0) {
      items = [
        ...items,
        { id: 'addNew', name: 'Add new ...', provider },
      ]

      actionInput = (
        <Dropdown
          primary={Boolean(selectedItem)}
          items={items}
          labelField="name"
          noSelectionMessage="Select"
          centered
          selectedItem={selectedItem}
          onChange={selectedItem => { this.handleOnChange(selectedItem) }}
        />
      )
    } else {
      actionInput = (
        <Button
          secondary
          hollow
          hoverPrimary
          onClick={() => { this.handleOnChange({ id: 'addNew', provider }) }}
        >Add</Button>
      )
    }

    return (
      <Item key={provider}>
        <EndpointLogosStyled height={128} endpoint={provider} disabled={items.length === 0} />
        {actionInput}
      </Item>
    )
  }

  renderProviders() {
    if (this.props.loading) {
      return null
    }

    const itemsPerRow = 3
    let lastItems = []
    let rows = []
    this.props.providers.forEach((provider, i) => {
      lastItems.push(this.renderProvider(provider))
      let isIncomplete = i === this.props.providers.length - 1 && lastItems.length < itemsPerRow
      if (i % itemsPerRow === itemsPerRow - 1 || isIncomplete) {
        rows.push((
          <Row key={i} isIncomplete={isIncomplete}>
            {lastItems}
          </Row>
        ))
        lastItems = []
      }
    })

    return rows
  }

  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return <StatusImage style={{ marginTop: '-48px' }} loading />
  }

  render() {
    return (
      <Wrapper isCentered={this.props.loading}>
        {this.renderLoading()}
        {this.renderProviders()}
      </Wrapper>
    )
  }
}

export default WizardEndpointList
