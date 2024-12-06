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

import { observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { Field as FieldType } from "@src/@types/Field";
import { getTransferItemTitle, TransferItem } from "@src/@types/MainItem";
import { Region } from "@src/@types/Region";
import EndpointLogos from "@src/components/modules/EndpointModule/EndpointLogos";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import Button from "@src/components/ui/Button";
import CopyMultilineValue from "@src/components/ui/CopyMultilineValue";
import CopyValue from "@src/components/ui/CopyValue";
import PasswordValue from "@src/components/ui/PasswordValue";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import configLoader from "@src/utils/Config";
import DateUtils from "@src/utils/DateUtils";
import DomUtils from "@src/utils/DomUtils";
import LabelDictionary from "@src/utils/LabelDictionary";

import type { Endpoint } from "@src/@types/Endpoint";
const Wrapper = styled.div<any>`
  ${ThemeProps.exactWidth(ThemeProps.contentWidth)}
  margin: 0 auto;
  padding-left: 126px;
`;
const Info = styled.div<any>`
  display: flex;
  flex-wrap: wrap;
  margin-top: 32px;
  margin-left: -32px;
`;
const Field = styled.div<any>`
  ${ThemeProps.exactWidth("calc(50% - 32px)")}
  margin-bottom: 32px;
  margin-left: 32px;
`;
const Label = styled.div<any>`
  font-size: 10px;
  font-weight: ${ThemeProps.fontWeights.medium};
  color: ${ThemePalette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 3px;
`;
const Value = styled.div<any>``;
const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  margin-top: 64px;
`;
const MainButtons = styled.div<any>``;
const DeleteButton = styled.div<any>``;
const LoadingWrapper = styled.div<any>`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 32px 0 64px 0;
`;
const LinkStyled = styled(Link)`
  color: ${ThemePalette.primary};
  text-decoration: none;
  cursor: pointer;
`;
const TransferItems = styled.div`
  max-height: 200px;
  overflow: auto;
`;
const TransferItemWrapper = styled.div`
  margin-bottom: 4px;
`;

const DownloadLink = styled.div`
  display: inline-block;
  color: ${ThemePalette.primary};
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

type Props = {
  item: Endpoint | null;
  regions: Region[];
  connectionInfo: Endpoint["connection_info"] | null;
  loading: boolean;
  transfers: TransferItem[];
  connectionInfoSchema: FieldType[];
  onDeleteClick: () => void;
  onValidateClick: () => void;
};
@observer
class EndpointDetailsContent extends React.Component<Props> {
  renderedKeys!: { [prop: string]: boolean };

  renderDownloadValue(value: string, fieldName: string) {
    const endpoint = this.props.item;
    if (!endpoint) {
      return null;
    }
    return (
      <DownloadLink
        onClick={() => {
          DomUtils.download(value, fieldName);
        }}
      >
        Download
      </DownloadLink>
    );
  }

  renderConnectionInfoLoading() {
    if (!this.props.loading) {
      return null;
    }

    return (
      <LoadingWrapper>
        <StatusImage loading />
      </LoadingWrapper>
    );
  }

  renderConnectionInfo(connectionInfo: any): React.ReactNode {
    if (!connectionInfo) {
      return null;
    }

    return Object.keys(connectionInfo).map(key => {
      let value = connectionInfo[key];

      if (key === "secret_ref") {
        return null;
      }

      if (typeof connectionInfo[key] === "object") {
        return this.renderConnectionInfo(connectionInfo[key]);
      }

      if (this.renderedKeys[key]) {
        return null;
      }

      this.renderedKeys[key] = true;

      if (value === true) {
        value = "Yes";
      } else if (value === false) {
        value = "No";
      } else if (!value) {
        value = "-";
      }

      let valueElement = null;
      const schemaField = this.props.connectionInfoSchema.find(
        f => f.name === key
      );

      if (
        configLoader.config.passwordFields.find(fn => fn === key) ||
        key.indexOf("password") > -1
      ) {
        valueElement = <PasswordValue value={value} />;
      } else if (schemaField?.useFile) {
        valueElement = this.renderDownloadValue(value, key);
      } else {
        valueElement = this.renderValue(value);
      }

      return (
        <Field key={key}>
          <Label>{LabelDictionary.get(key)}</Label>
          {valueElement}
        </Field>
      );
    });
  }

  renderButtons() {
    return (
      <Buttons>
        <MainButtons>
          <Button onClick={this.props.onValidateClick}>
            Validate Endpoint
          </Button>
        </MainButtons>
        <DeleteButton>
          <Button hollow alert onClick={this.props.onDeleteClick}>
            Delete Endpoint
          </Button>
        </DeleteButton>
      </Buttons>
    );
  }

  renderValue(value: string) {
    return <CopyValue value={value} maxWidth="90%" />;
  }

  renderRegions() {
    return (
      <span>
        {this.props.item?.mapped_regions
          .map(
            regionId => this.props.regions.find(r => r.id === regionId)?.name
          )
          .join(", ") || "-"}
      </span>
    );
  }

  renderUsage(items: TransferItem[]) {
    return (
      <TransferItems>
        {items.map(item => (
          <TransferItemWrapper key={item.id}>
            <LinkStyled to={`/transfers/${item.id}`}>
              {getTransferItemTitle(item)}
            </LinkStyled>
          </TransferItemWrapper>
        ))}
      </TransferItems>
    );
  }

  render() {
    this.renderedKeys = {};
    const {
      type,
      name,
      description,
      created_at: createdAt,
      id,
    } = this.props.item || {};

    return (
      <Wrapper>
        <EndpointLogos endpoint={type} />
        <Info>
          <Field>
            <Label>Id</Label>
            {this.renderValue(id || "")}
          </Field>
          <Field>
            <Label>Name</Label>
            {this.renderValue(name || "")}
          </Field>
          <Field>
            <Label>Type</Label>
            {this.renderValue(
              this.props.item
                ? configLoader.config.providerNames[this.props.item.type]
                : ""
            )}
          </Field>
          <Field>
            <Label>Coriolis Regions</Label>
            {this.renderRegions()}
          </Field>
          <Field>
            <Label>Description</Label>
            {description ? (
              <CopyMultilineValue value={description} />
            ) : (
              <Value>-</Value>
            )}
          </Field>
          <Field>
            <Label>Created</Label>
            {this.renderValue(
              DateUtils.getLocalDate(createdAt!).toFormat("dd/LL/yyyy HH:mm")
            )}
          </Field>
          <Field>
            <Label>Used in transfers ({this.props.transfers.length})</Label>
            {this.props.transfers.length > 0 ? (
              this.renderUsage(this.props.transfers)
            ) : (
              <Value>-</Value>
            )}
          </Field>
          {!this.props.connectionInfo
            ? this.renderConnectionInfoLoading()
            : null}
          {this.renderConnectionInfo(this.props.connectionInfo)}
        </Info>
        {this.renderButtons()}
      </Wrapper>
    );
  }
}

export default EndpointDetailsContent;
