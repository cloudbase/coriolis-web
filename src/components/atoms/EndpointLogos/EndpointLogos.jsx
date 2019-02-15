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

import Generic from './images/Generic'

import aws32Image from './images/aws-32.svg'
import azure32Image from './images/azure-32.svg'
import opc32Image from './images/opc-32.svg'
import openstack32Image from './images/openstack-32.svg'
import oraclevm32Image from './images/oraclevm-32.svg'
import vmware32Image from './images/vmware-32.svg'
import oci32Image from './images/oci-32.svg'
import hyperv32Image from './images/hyperv-32.svg'
import scvmm32Image from './images/scvmm-32.svg'

import aws42Image from './images/aws-42.svg'
import azure42Image from './images/azure-42.svg'
import opc42Image from './images/opc-42.svg'
import openstack42Image from './images/openstack-42.svg'
import oraclevm42Image from './images/oraclevm-42.svg'
import vmware42Image from './images/vmware-42.svg'
import oci42Image from './images/oci-42.svg'
import hyperv42Image from './images/hyperv-42.svg'
import scvmm42Image from './images/scvmm-42.svg'

import aws64Image from './images/aws-64.svg'
import azure64Image from './images/azure-64.svg'
import opc64Image from './images/opc-64.svg'
import openstack64Image from './images/openstack-64.svg'
import oraclevm64Image from './images/oraclevm-64.svg'
import vmware64Image from './images/vmware-64.svg'
import oci64Image from './images/oci-64.svg'
import hyperv64Image from './images/hyperv-64.svg'
import scvmm64Image from './images/scvmm-64.svg'

import aws128Image from './images/aws-128.svg'
import azure128Image from './images/azure-128.svg'
import opc128Image from './images/opc-128.svg'
import openstack128Image from './images/openstack-128.svg'
import oraclevm128Image from './images/oraclevm-128.svg'
import vmware128Image from './images/vmware-128.svg'
import oci128Image from './images/oci-128.svg'
import hyperv128Image from './images/hyperv-128.svg'
import scvmm128Image from './images/scvmm-128.svg'

import aws128DisabledImage from './images/aws-128-disabled.svg'
import azure128DisabledImage from './images/azure-128-disabled.svg'
import opc128DisabledImage from './images/opc-128-disabled.svg'
import openstack128DisabledImage from './images/openstack-128-disabled.svg'
import oraclevm128DisabledImage from './images/oraclevm-128-disabled.svg'
import vmware128DisabledImage from './images/vmware-128-disabled.svg'
import oci128DisabledImage from './images/oci-128-disabled.svg'
import hyperv128DisabledImage from './images/hyperv-128-disabled.svg'
import scvmm128DisabledImage from './images/scvmm-128-disabled.svg'

const endpointImages = {
  azure: [
    { h: 32, image: azure32Image },
    { h: 42, image: azure42Image },
    { h: 64, image: azure64Image },
    { h: 128, image: azure128Image },
    { h: 128, image: azure128DisabledImage, disabled: true },
  ],
  openstack: [
    { h: 32, image: openstack32Image },
    { h: 42, image: openstack42Image },
    { h: 64, image: openstack64Image },
    { h: 128, image: openstack128Image },
    { h: 128, image: openstack128DisabledImage, disabled: true },
  ],
  opc: [
    { h: 32, image: opc32Image },
    { h: 42, image: opc42Image },
    { h: 64, image: opc64Image },
    { h: 128, image: opc128Image },
    { h: 128, image: opc128DisabledImage, disabled: true },
  ],
  oracle_vm: [
    { h: 32, image: oraclevm32Image },
    { h: 42, image: oraclevm42Image },
    { h: 64, image: oraclevm64Image },
    { h: 128, image: oraclevm128Image },
    { h: 128, image: oraclevm128DisabledImage, disabled: true },
  ],
  vmware_vsphere: [
    { h: 32, image: vmware32Image },
    { h: 42, image: vmware42Image },
    { h: 64, image: vmware64Image },
    { h: 128, image: vmware128Image },
    { h: 128, image: vmware128DisabledImage, disabled: true },
  ],
  aws: [
    { h: 32, image: aws32Image },
    { h: 42, image: aws42Image },
    { h: 64, image: aws64Image },
    { h: 128, image: aws128Image },
    { h: 128, image: aws128DisabledImage, disabled: true },
  ],
  oci: [
    { h: 32, image: oci32Image },
    { h: 42, image: oci42Image },
    { h: 64, image: oci64Image },
    { h: 128, image: oci128Image },
    { h: 128, image: oci128DisabledImage, disabled: true },
  ],
  'hyper-v': [
    { h: 32, image: hyperv32Image },
    { h: 42, image: hyperv42Image },
    { h: 64, image: hyperv64Image },
    { h: 128, image: hyperv128Image },
    { h: 128, image: hyperv128DisabledImage, disabled: true },
  ],
  scvmm: [
    { h: 32, image: scvmm32Image },
    { h: 42, image: scvmm42Image },
    { h: 64, image: scvmm64Image },
    { h: 128, image: scvmm128Image },
    { h: 128, image: scvmm128DisabledImage, disabled: true },
  ],
}
const Wrapper = styled.div``
const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  ${props => props.imageInfo ? css`background: url('${props.imageInfo.image}') no-repeat center;` : ''}
`
const widthHeights = [
  { w: 80, h: 32 },
  { w: 105, h: 42 },
  { w: 192, h: 128 },
  { w: 192, h: 64 },
]

type Props = {
  endpoint?: string,
  height: number,
  disabled?: boolean,
  'data-test-id'?: string,
}
@observer
class EndpointLogos extends React.Component<Props> {
  static defaultProps: Props = {
    height: 64,
  }

  renderLogo(size: { w: number, h: number }) {
    let imageInfo = null

    if (this.props.endpoint && endpointImages[this.props.endpoint]) {
      imageInfo = endpointImages[this.props.endpoint].find(i => i.h === size.h && (!this.props.disabled || i.disabled === true))
    } else {
      return null
    }

    if (!imageInfo) {
      return null
    }

    return (
      <Logo
        width={size.w}
        height={size.h}
        imageInfo={imageInfo}
      />
    )
  }

  renderGenericLogo(size: { w: number, h: number }) {
    return (
      <Generic
        data-test-id="endpointLogos-genericLogo"
        size={size}
        name={this.props.endpoint || ''}
        disabled={this.props.disabled}
      />
    )
  }

  render() {
    let size = widthHeights.find(wh => wh.h === this.props.height)

    if (!size) {
      return null
    }

    let imageInfo = null

    if (this.props.endpoint && endpointImages[this.props.endpoint]) {
      imageInfo = endpointImages[this.props.endpoint].find(i => i.h === size.h && (!this.props.disabled || i.disabled === true))
    }

    return (
      <Wrapper {...this.props} data-test-id={this.props['data-test-id'] || 'endpointLogos'}>
        <Logo
          width={size.w}
          height={size.h}
          imageInfo={imageInfo}
          data-test-id="endpointLogos-logo"
        >
          {imageInfo ? null : this.renderGenericLogo(size)}
        </Logo>
      </Wrapper>
    )
  }
}

export default EndpointLogos
