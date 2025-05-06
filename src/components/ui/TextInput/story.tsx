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

import React from "react";
import { storiesOf } from "@storybook/react";
import styled from "styled-components";
import TextInput from ".";

const Wrapper = styled.div<any>`
  display: inline-block;
`;
class StatefulInput extends React.Component<any> {
  state = {
    value: "",
  };

  render() {
    return (
      <TextInput
        {...this.props}
        value={this.state.value}
        onChange={e => {
          this.setState({ value: e.target.value });
        }}
      />
    );
  }
}

storiesOf("TextInput", module)
  .add("default", () => (
    <Wrapper>
      <TextInput />
    </Wrapper>
  ))
  .add("disabled", () => (
    <Wrapper>
      <TextInput disabled />
    </Wrapper>
  ))
  .add("disabled loading", () => (
    <Wrapper>
      <TextInput disabledLoading />
    </Wrapper>
  ))
  .add("required", () => (
    <Wrapper>
      <TextInput required />
    </Wrapper>
  ))
  .add("highlight", () => (
    <Wrapper>
      <TextInput required highlight />
    </Wrapper>
  ))
  .add("large", () => (
    <Wrapper>
      <TextInput large />
    </Wrapper>
  ))
  .add("with close", () => (
    <Wrapper>
      <StatefulInput showClose />
    </Wrapper>
  ));
