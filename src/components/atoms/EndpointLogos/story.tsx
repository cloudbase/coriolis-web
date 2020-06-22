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
import { storiesOf } from '@storybook/react'
import styled from 'styled-components'
import EndpointLogos from '.'

const Wrapper = styled.div<any>`
  display: flex;
  flex-wrap: wrap;
  margin-left: -32px;
  margin-top: -32px;
  ${(props: any) => (props.background ? `background: ${props.background};` : '')}

  > div {
    margin-left: 32px;
    margin-top: 32px;
  }
`
const wrap = (
  endpoint: string | null | undefined,
  height: number | undefined,
  disabled = false, white = false,
) => (
  <EndpointLogos
    endpoint={endpoint}
    height={height}
    disabled={disabled}
    white={white}
    baseUrl="http://localhost:3000"
  />
)
const providers = [
  'aws',
  'azure',
  'opc',
  'openstack',
  'oracle_vm',
  'oci',
  'vmware_vsphere',
  'Generic Cloud',
  'hyper-v',
  'scvmm',
]

storiesOf('EndpointLogos', module)
  .add('32px', () => {
    const height = 32
    return (
      <Wrapper>
        {providers.map(p => wrap(p, height))}
      </Wrapper>
    )
  })
  .add('32px - white', () => {
    const height = 32
    return (
      <Wrapper background="#202134">
        {providers.map(p => wrap(p, height, false, true))}
      </Wrapper>
    )
  })
  .add('42px', () => {
    const height = 42
    return (
      <Wrapper>
        {providers.map(p => wrap(p, height))}
      </Wrapper>
    )
  })
  .add('64px', () => {
    const height = 64
    return (
      <Wrapper>
        {providers.map(p => wrap(p, height))}
      </Wrapper>
    )
  })
  .add('128px', () => {
    const height = 128
    return (
      <Wrapper>
        {providers.map(p => wrap(p, height))}
      </Wrapper>
    )
  })
  .add('128px - disabled', () => {
    const height = 128
    return (
      <Wrapper>
        {providers.map(p => wrap(p, height, true))}
      </Wrapper>
    )
  })
