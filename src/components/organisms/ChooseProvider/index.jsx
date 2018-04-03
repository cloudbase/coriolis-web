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
import { observer } from 'mobx-react'
import styled from 'styled-components'

import EndpointLogos from '../../atoms/EndpointLogos'
import Button from '../../atoms/Button'
import StatusImage from '../../atoms/StatusImage'
import type { Providers as ProvidersType } from '../../../types/Providers'

import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div`
  padding: 22px 0 32px 0;
  text-align: center;
`
const Providers = styled.div``
const Logos = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 42px;
`
const EndpointLogosStyled = styled(EndpointLogos) `
  transform: scale(0.67);
  transition: all ${StyleProps.animations.swift};
  cursor: pointer;
  &:hover {
    transform: scale(0.7);
  }
`
const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;
`
const LoadingText = styled.div`
  font-size: 18px;
  margin-top: 32px;
`

type Props = {
  providers: ?ProvidersType,
  onCancelClick: () => void,
  onProviderClick: (provider: string) => void,
  loading: boolean,
}
@observer
class ChooseProvider extends React.Component<Props> {
  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>Loading providers ...</LoadingText>
      </LoadingWrapper>
    )
  }

  renderProviders() {
    if (!this.props.providers || this.props.loading) {
      return null
    }

    return (
      <Providers>
        <Logos>
          {Object.keys(this.props.providers).map(k => {
            return (
              <EndpointLogosStyled
                height={128}
                key={k}
                endpoint={k}
                data-test-id={`endpointLogo-${k}`}
                onClick={() => { this.props.onProviderClick(k) }}
              />
            )
          })}
        </Logos>
        <Button secondary onClick={this.props.onCancelClick}>Cancel</Button>
      </Providers>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderProviders()}
        {this.renderLoading()}
      </Wrapper>
    )
  }
}

export default ChooseProvider
