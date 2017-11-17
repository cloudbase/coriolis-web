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

import { EndpointLogos, Button } from 'components'

import StyleProps from '../../styleUtils/StyleProps'

const Wrapper = styled.div`
  padding: 22px 0 32px 0;
  text-align: center;
`
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

class ChooseProvider extends React.Component {
  static propTypes = {
    providers: PropTypes.object,
    onCancelClick: PropTypes.func,
    onProviderClick: PropTypes.func,
  }

  render() {
    if (!this.props.providers) {
      return null
    }

    return (
      <Wrapper>
        <Logos>
          {Object.keys(this.props.providers).map(k => {
            return (
              <EndpointLogosStyled
                height={128}
                key={k}
                endpoint={k}
                onClick={() => { this.props.onProviderClick(k) }}
              />
            )
          })}
        </Logos>
        <Button secondary onClick={this.props.onCancelClick}>Cancel</Button>
      </Wrapper>
    )
  }
}

export default ChooseProvider
