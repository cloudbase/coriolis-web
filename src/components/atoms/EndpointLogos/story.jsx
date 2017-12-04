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
import EndpointLogos from './EndpointLogos'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: -32px;
  margin-top: -32px;

  > div {
    margin-left: 32px;
    margin-top: 32px;
  }
`
const wrap = (endpoint, height) => <EndpointLogos endpoint={endpoint} height={height} />

storiesOf('EndpointLogos', module)
  .add('32px', () => {
    let height = 32
    return (
      <Wrapper>
        {wrap('aws', height)}
        {wrap('azure', height)}
        {wrap('opc', height)}
        {wrap('openstack', height)}
        {wrap('oracle_vm', height)}
        {wrap('vmware_vsphere', height)}
      </Wrapper>
    )
  })
  .add('45px', () => {
    let height = 45
    return (
      <Wrapper>
        {wrap('aws', height)}
        {wrap('azure', height)}
        {wrap('opc', height)}
        {wrap('openstack', height)}
        {wrap('oracle_vm', height)}
        {wrap('vmware_vsphere', height)}
      </Wrapper>
    )
  })
  .add('64px', () => {
    let height = 64
    return (
      <Wrapper>
        {wrap('aws', height)}
        {wrap('azure', height)}
        {wrap('opc', height)}
        {wrap('openstack', height)}
        {wrap('oracle_vm', height)}
        {wrap('vmware_vsphere', height)}
      </Wrapper>
    )
  })
  .add('128px', () => {
    let height = 128
    return (
      <Wrapper>
        {wrap('aws', height)}
        {wrap('azure', height)}
        {wrap('opc', height)}
        {wrap('openstack', height)}
        {wrap('oracle_vm', height)}
        {wrap('vmware_vsphere', height)}
      </Wrapper>
    )
  })
