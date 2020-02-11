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
import styled, { css } from 'styled-components'

import Generic from './resources/Generic'

const Wrapper = styled.div``
const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  ${props => props.url ? css`background: url('${props.url}') no-repeat center;` : ''}
  background-size: contain;
`
const widthHeights = [
  { w: 80, h: 32 },
  { w: 105, h: 42 },
  { w: 185, h: 128 },
  { w: 185, h: 64 },
]
const PROVIDER_LOGOS = [
  'azure', 'openstack', 'opc', 'oracle_vm', 'vmware_vsphere', 'aws', 'oci', 'hyper-v', 'scvmm', 'kubevirt',
]
type Props = {
  endpoint?: ?string,
  height: number,
  disabled?: boolean,
  white?: boolean,
  baseUrl?: string,
  'data-test-id'?: string,
}
@observer
class EndpointLogos extends React.Component<Props> {
  static defaultProps: Props = {
    height: 64,
  }

  renderGenericLogo(size: { w: number, h: number }) {
    return (
      <Generic
        data-test-id="endpointLogos-genericLogo"
        size={size}
        name={this.props.endpoint || ''}
        disabled={this.props.disabled}
        white={this.props.white}
      />
    )
  }

  render() {
    let size = widthHeights.find(wh => wh.h === this.props.height)

    if (!size) {
      return null
    }

    let imageUrl: ?string = null
    let provider = this.props.endpoint
    if (provider && PROVIDER_LOGOS.indexOf(provider) > -1) {
      imageUrl = `${this.props.baseUrl || ''}/api/logos/${provider}/${size.h}`
      let style = this.props.white ? 'white' : this.props.disabled ? 'disabled' : null
      imageUrl = style ? `${imageUrl}/${style}` : imageUrl
    }

    return (
      <Wrapper {...this.props} data-test-id={this.props['data-test-id'] || 'endpointLogos'}>
        <Logo
          width={size.w}
          height={size.h}
          url={imageUrl}
          data-test-id="endpointLogos-logo"
        >
          {imageUrl ? null : this.renderGenericLogo(size)}
        </Logo>
      </Wrapper>
    )
  }
}

export default EndpointLogos
