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
import SetupPageTitle from "@src/components/modules/SetupModule/ui/SetupPageTitle";

const Wrapper = styled.div``;

@observer
class SetupPageWelcome extends React.Component {
  render() {
    return (
      <Wrapper>
        <SetupPageTitle title="Welcome to Coriolis®" />
        <p>
          Coriolis® is a fully distributed and scalable system that provides
          both “lift-and-shift” migration services (CMaaS) and cross-site
          disaster recovery features (DRaaS) between a source cloud platform and
          an independent destination cloud platform.
        </p>
      </Wrapper>
    );
  }
}

export default SetupPageWelcome;
