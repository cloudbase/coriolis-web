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
import { observer } from "mobx-react";
import styled from "styled-components";

import Arrow from "@src/components/ui/Arrow";

import { ThemePalette } from "@src/components/Theme";
import type { WizardPage } from "@src/@types/WizardData";

const Wrapper = styled.div<any>`
  display: flex;
  justify-content: center;
`;
const ArrowStyled = styled(Arrow)``;
const Breadcrumb = styled.div<any>`
  display: flex;
  align-items: center;
  margin-right: 6px;

  &:last-child ${ArrowStyled} {
    display: none;
  }
`;
const Name = styled.div<any>`
  color: ${props =>
    props.selected ? ThemePalette.primary : ThemePalette.black};
`;

type Props = {
  selected: { id: string };
  pages: WizardPage[];
};
@observer
class WizardBreadcrumbs extends React.Component<Props> {
  render() {
    return (
      <Wrapper>
        {this.props.pages.map(page => (
          <Breadcrumb key={page.id}>
            <Name selected={this.props.selected.id === page.id}>
              {page.breadcrumb}
            </Name>
            <ArrowStyled
              primary={this.props.selected.id === page.id}
              useDefaultCursor
            />
          </Breadcrumb>
        ))}
      </Wrapper>
    );
  }
}

export default WizardBreadcrumbs;
