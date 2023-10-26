/*
Copyright (C) 2022  Cloudbase Solutions SRL
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
import React from "react";
import styled, { css } from "styled-components";

import { MetalHubServer } from "@src/@types/MetalHub";
import { ThemeProps } from "@src/components/Theme";
import Button from "@src/components/ui/Button";
import FieldInput from "@src/components/ui/FieldInput";
import LoadingButton from "@src/components/ui/LoadingButton";
import Modal from "@src/components/ui/Modal";
import StatusIcon from "@src/components/ui/StatusComponents/StatusIcon";
import metalHubStore from "@src/stores/MetalHubStore";
import KeyboardManager from "@src/utils/KeyboardManager";

import image from "./images/server.svg";

import type { Field as FieldType } from "@src/@types/Field";

const Wrapper = styled.div`
  padding: 48px 32px 32px 32px;
`;
const Image = styled.div`
  width: 96px;
  height: 96px;
  background: url("${image}") center no-repeat;
  margin: 0 auto;
`;
const Form = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 64px;

  > div {
    margin-top: 16px;
  }
`;
const Buttons = styled.div`
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
`;
const StatusHeader = styled.div`
  display: flex;
  align-items: center;
`;
const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;

  > div {
    text-align: center;
    &:first-child {
      margin-bottom: 8px;
    }
  }
`;
const StatusIconStyled = styled(StatusIcon)``;
const Status = styled.div<{ layout: "vertical" | "horizontal" }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;

  ${StatusHeader} {
    ${({ layout }) =>
      layout === "vertical"
        ? css`
            flex-direction: column;
          `
        : ""}
  }

  ${StatusMessage} {
    ${({ layout }) =>
      layout === "horizontal"
        ? css`
            margin-left: 8px;
          `
        : ""}
  }

  ${StatusIconStyled} {
    ${({ layout }) =>
      layout === "vertical"
        ? css`
            margin-bottom: 8px;
          `
        : ""}
  }
`;

type Props = {
  server?: MetalHubServer;
  loading?: boolean;
  onRequestClose: () => void;
  onUpdateDone: () => void;
};

type State = {
  host: string;
  port: string;
  saving: boolean;
  highlightFieldNames: string[];
  showSuccess: boolean;
};
@observer
class MetalHubModal extends React.Component<Props, State> {
  state: State = {
    host: "",
    port: "",
    highlightFieldNames: [],
    saving: false,
    showSuccess: false,
  };

  get loading() {
    return this.state.saving || this.props.loading;
  }

  componentDidMount() {
    KeyboardManager.onEnter(
      "MetalHubNewModal",
      () => {
        this.handleAddClick();
      },
      2
    );

    if (this.props.server) {
      const apiEndpointComponents = this.props.server.api_endpoint.split(":");
      this.setState({
        host: apiEndpointComponents[1].replace("//", ""),
        port: apiEndpointComponents[2].replace(/\/.*/, ""),
      });
    }
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown("MetalHubNewModal");
    metalHubStore.clearValidationError();
  }

  // Used to store the newly added server in case of validation error since a PATCH request is needed afterwards
  serverAddedForValidation: number | null = null;

  async handleAddClick() {
    if (this.highlightFields()) {
      return;
    }

    const endpointUrl = `https://${this.state.host}:${this.state.port}/api/v1`;
    this.setState({ saving: true });
    const serverId = this.props.server?.id || this.serverAddedForValidation;
    let validationResult = false;
    try {
      if (serverId) {
        await metalHubStore.patchServer(serverId, endpointUrl);
        validationResult = await metalHubStore.validateServer(serverId);
      } else {
        const addedServer = await metalHubStore.addServer(endpointUrl);
        this.serverAddedForValidation = addedServer.id;
        validationResult = await metalHubStore.validateServer(addedServer.id);
      }
    } finally {
      if (!validationResult) {
        this.setState({ saving: false });
      } else {
        this.setState({ saving: false, showSuccess: true });
        setTimeout(() => {
          this.props.onUpdateDone();
        }, 2000);
      }
    }
  }

  highlightFields() {
    const highlightFieldNames = [];
    if (!this.state.host) {
      highlightFieldNames.push("host");
    }
    if (!this.state.port) {
      highlightFieldNames.push("port");
    }
    if (highlightFieldNames.length > 0) {
      this.setState({ highlightFieldNames });
      return true;
    }
    this.setState({ highlightFieldNames: [] });
    return false;
  }

  renderField(opts: {
    field: FieldType;
    value: any;
    onChange: (value: any) => void;
  }) {
    const { field, value, onChange } = opts;
    return (
      <FieldInput
        layout="modal"
        key={field.name}
        name={field.name}
        type={field.type || "string"}
        value={value}
        label={field.label}
        description={field.description}
        onChange={onChange}
        width={ThemeProps.inputSizes.large.width}
        required={field.required}
        highlight={Boolean(
          this.state.highlightFieldNames.find(n => n === field.name)
        )}
        disabledLoading={this.loading || this.state.showSuccess}
      />
    );
  }

  renderForm() {
    const fields = [
      this.renderField({
        field: {
          name: "host",
          required: true,
          label: "Host",
          description:
            "The Coriolis Snapshot Agent API hostname of the added bare metal server",
        },
        value: this.state.host,
        onChange: host => {
          this.setState({ host });
        },
      }),
      this.renderField({
        field: {
          name: "port",
          required: true,
          label: "Port",
          description:
            "The port number used for accessing the Coriolis Snapshot Agent API of the added bare metal server",
        },
        value: this.state.port,
        onChange: port => {
          this.setState({ port });
        },
      }),
    ];

    return <Form>{fields}</Form>;
  }

  renderButtons() {
    return (
      <Buttons>
        <Button
          secondary
          large
          onClick={this.props.onRequestClose}
          disabled={this.state.showSuccess}
        >
          Cancel
        </Button>
        {this.loading ? (
          <LoadingButton large>Validating ...</LoadingButton>
        ) : (
          <Button
            large
            onClick={() => {
              this.handleAddClick();
            }}
            disabled={this.state.showSuccess}
          >
            Validate and save
          </Button>
        )}
      </Buttons>
    );
  }

  renderValidationStatus() {
    if (
      !this.state.saving &&
      !this.state.showSuccess &&
      !metalHubStore.validationError.length
    ) {
      return null;
    }
    const message = this.state.saving
      ? "Validating ..."
      : metalHubStore.validationError.length
      ? metalHubStore.validationError.map(e => <div key={e}>{e}</div>)
      : "Validation successful";
    const status = this.state.saving
      ? "RUNNING"
      : metalHubStore.validationError.length
      ? "ERROR"
      : "COMPLETED";
    return (
      <Status layout={status === "ERROR" ? "vertical" : "horizontal"}>
        <StatusHeader>
          <StatusIconStyled status={status} />
          <StatusMessage>{message}</StatusMessage>
        </StatusHeader>
      </Status>
    );
  }

  render() {
    return (
      <Modal
        isOpen
        title={`${
          this.props.server ? "Update" : "Add"
        } Coriolis Bare Metal Server`}
        onRequestClose={this.props.onRequestClose}
      >
        <Wrapper>
          <Image />
          {this.renderValidationStatus()}
          {this.renderForm()}
          {this.renderButtons()}
        </Wrapper>
      </Modal>
    );
  }
}

export default MetalHubModal;
