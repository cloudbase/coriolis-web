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

import * as React from "react";
import { storiesOf } from "@storybook/react";
import Switch from ".";

type Props = {
  disabled?: boolean;
  disabledLoading?: boolean;
  secondary?: boolean;
  triState?: boolean;
  big?: boolean;
  height?: number;
};

class Wrapper extends React.Component<Props> {
  state = {
    checked: false,
  };

  handleChange(checked: boolean | null) {
    this.setState({ checked });
  }

  render() {
    return (
      <Switch
        {...this.props}
        checked={this.state.checked}
        onChange={checked => {
          this.handleChange(checked);
        }}
      />
    );
  }
}

storiesOf("Switch", module)
  .add("default", () => <Wrapper />)
  .add("disabled", () => <Wrapper disabled />)
  .add("disabled loading", () => <Wrapper disabledLoading />)
  .add("secondary", () => <Wrapper secondary />)
  .add("tri-state", () => <Wrapper triState />)
  .add("colored", () => <Wrapper big />)
  .add("small", () => <Wrapper height={16} />);
