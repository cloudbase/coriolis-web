/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import { observer } from "mobx-react";
import styled from "styled-components";

const Wrapper = styled.div`
  font-size: 20px;
  text-align: center;
  margin-bottom: 24px;
`;
type Props = {
  title: string;
};

@observer
class SetupPageTitle extends React.Component<Props> {
  render() {
    return <Wrapper>{this.props.title}</Wrapper>;
  }
}

export default SetupPageTitle;
