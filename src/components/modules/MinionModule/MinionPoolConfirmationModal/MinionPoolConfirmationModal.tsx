/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

import Button from "@src/components/ui/Button";

import KeyboardManager from "@src/utils/KeyboardManager";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import FieldInput from "@src/components/ui/FieldInput";
import Modal from "@src/components/ui/Modal";

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px 32px 32px;
`;
const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px;
`;
const Description = styled.div`
  margin-top: 32px;
`;
const Form = styled.div<any>`
  height: 120px;
`;
const FieldInputStyled = styled(FieldInput)`
  width: 319px;
  justify-content: space-between;
`;
const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
type Props = {
  onCancelClick: () => void;
  onExecuteClick: (force: boolean) => void;
};
type State = {
  force: boolean;
};
@observer
class MinionPoolConfirmationModal extends React.Component<Props, State> {
  state: State = {
    force: false,
  };

  componentDidMount() {
    KeyboardManager.onEnter(
      "minion-pool-confirmation",
      () => {
        this.props.onExecuteClick(this.state.force);
      },
      2,
    );
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown("minion-pool-confirmation");
  }

  render() {
    return (
      <Modal
        isOpen
        title="Minion Pool Deallocate Confirmation"
        onRequestClose={this.props.onCancelClick}
      >
        <Wrapper>
          <Header>
            <StatusImage status="CONFIRMATION" />
            <Description>
              Are you sure you want to deallocate the minion pool?
            </Description>
          </Header>
          <Form>
            <FieldInputStyled
              name="force"
              description="Whether to force the deallocation of the Minion Pool and its machines. This will affect all Migrations/Replicas currently using the pool’s resources."
              type="boolean"
              layout="page"
              value={this.state.force}
              label="Force"
              onChange={value => {
                this.setState({ force: value });
              }}
            />
          </Form>
          <Buttons>
            <Button secondary onClick={this.props.onCancelClick}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                this.props.onExecuteClick(this.state.force);
              }}
            >
              Deallocate
            </Button>
          </Buttons>
        </Wrapper>
      </Modal>
    );
  }
}

export default MinionPoolConfirmationModal;
