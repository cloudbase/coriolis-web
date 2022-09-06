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
import countriesList from "@src/components/modules/SetupModule/resources/countriesList";
import {
  CustomerInfoBasic,
  SetupPageLicenceType,
} from "@src/@types/InitialSetup";
import SetupPageTitle from "@src/components/modules/SetupModule/ui/SetupPageTitle";
import SetupPageInputWrapper from "@src/components/modules/SetupModule/ui/SetupPageInputWrapper";
import TextInput from "@src/components/ui/TextInput";
import AutocompleteDropdown from "@src/components/ui/Dropdowns/AutocompleteDropdown";
import SetupPageLicenceInput from "@src/components/modules/SetupModule/ui/SetupPageLicenceInput";

const Wrapper = styled.div``;
const Header = styled.div`
  margin-bottom: 16px;
`;
const Form = styled.form``;
// const LicenceTypeRadioGroup = styled.div`
//   display: flex;
//   margin-top: 4px;
//   margin-left: -16px;
//   > div {
//     margin-left: 16px;
//   }
// `

type CountryDropdownItemType = {
  label: string;
  value: string;
};
const prepareCountriesItems = () =>
  countriesList.map(c => ({ label: c.name, value: c.code }));

type Props = {
  customerInfo: CustomerInfoBasic;
  onUpdateCustomerInfo: (field: keyof CustomerInfoBasic, value: any) => void;
  highlightEmptyFields: boolean;
  highlightEmail: boolean;
  onSubmit: () => void;
  licenceType: SetupPageLicenceType;
  onLicenceTypeChange: (type: SetupPageLicenceType) => void;
};
@observer
class SetupPageLicence extends React.Component<Props> {
  _countriesItems: CountryDropdownItemType[] = [];

  get countriesItems() {
    if (this._countriesItems.length) {
      return this._countriesItems;
    }
    this._countriesItems = prepareCountriesItems();
    return this._countriesItems;
  }

  render() {
    return (
      <Wrapper>
        <SetupPageTitle title="Coriolis® Licence" />
        <Header>
          In order to obtain a licence, please fill in the following form.
        </Header>
        <Form
          onSubmit={e => {
            e.preventDefault();
            this.props.onSubmit();
          }}
        >
          <SetupPageInputWrapper label="Full name">
            <TextInput
              width="100%"
              value={this.props.customerInfo.fullName}
              onChange={e => {
                this.props.onUpdateCustomerInfo("fullName", e.target.value);
              }}
              required
              highlight={
                this.props.highlightEmptyFields &&
                !this.props.customerInfo.fullName
              }
            />
          </SetupPageInputWrapper>
          <SetupPageInputWrapper label="Email">
            <TextInput
              width="100%"
              required
              type="email"
              value={this.props.customerInfo.email}
              onChange={e => {
                this.props.onUpdateCustomerInfo("email", e.target.value);
              }}
              highlight={
                (this.props.highlightEmptyFields &&
                  !this.props.customerInfo.email) ||
                this.props.highlightEmail
              }
            />
          </SetupPageInputWrapper>
          <SetupPageInputWrapper label="Company">
            <TextInput
              width="100%"
              required
              value={this.props.customerInfo.company}
              onChange={e => {
                this.props.onUpdateCustomerInfo("company", e.target.value);
              }}
              highlight={
                this.props.highlightEmptyFields &&
                !this.props.customerInfo.company
              }
            />
          </SetupPageInputWrapper>
          <SetupPageInputWrapper label="Country">
            <AutocompleteDropdown
              required
              width={450}
              items={this.countriesItems}
              selectedItem={this.countriesItems.find(
                c => c.label === this.props.customerInfo.country
              )}
              onChange={item => {
                this.props.onUpdateCustomerInfo("country", item.label);
              }}
              highlight={
                this.props.highlightEmptyFields &&
                !this.props.customerInfo.country
              }
            />
          </SetupPageInputWrapper>
          <SetupPageLicenceInput
            style={{ marginTop: "24px", justifyContent: "center" }}
            licenceType={this.props.licenceType}
            onLicenceTypeChange={this.props.onLicenceTypeChange}
          />
          <button style={{ display: "none" }} type="submit">
            Submit
          </button>
        </Form>
      </Wrapper>
    );
  }
}

export default SetupPageLicence;
