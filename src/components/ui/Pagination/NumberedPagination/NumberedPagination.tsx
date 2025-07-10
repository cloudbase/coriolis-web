/*
Copyright (C) 2025  Cloudbase Solutions SRL
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
import styled from "styled-components";

const PaginationWrapper = styled.div<any>`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PaginationButton = styled.button`
  background-color: #007bff;
  color: white;
  border: 1px solid #dee2e6;
  padding: 5px 20px;
  margin: 0 5px;
  cursor: pointer;
  border-radius: 4px;

  &:disabled {
    background-color: #e9ecef;
    color: #6c757d;
    border-color: #dee2e6;
    cursor: default;
  }
`;

const PageNumber = styled.span``;

const PageNext = styled(PaginationButton)``;

const PagePrevious = styled(PaginationButton)``;

const ItemsPerPageSelect = styled.select`
  margin-left: 10px;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #cccccc;
`;

type Props = {
  className?: string;
  style?: any;
  itemsCount: number;
  currentPage: number;
  itemsPerPage: number;
  itemsPerPageOptions: number[];
  onPageChange: (newPage: number) => void;
  onItemsPerPageChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

@observer
class NumberedPagination extends React.Component<Props> {
  render() {
    const { itemsCount, currentPage, itemsPerPage } = this.props;
    const totalPages = Math.max(1, Math.ceil(itemsCount / itemsPerPage));
    const hasNextPage = currentPage * itemsPerPage < itemsCount;

    return (
      <PaginationWrapper
        style={this.props.style}
        className={this.props.className}
      >
        <PagePrevious
          onClick={() => {
            if (currentPage > 1) {
              this.props.onPageChange(currentPage - 1);
            }
          }}
          disabled={currentPage === 1}
        >
          Previous
        </PagePrevious>
        <PageNumber>
          Page {currentPage} of {totalPages}
        </PageNumber>
        <PageNext
          onClick={() => {
            if (currentPage < totalPages) {
              this.props.onPageChange(currentPage + 1);
            }
          }}
          disabled={!hasNextPage}
        >
          Next
        </PageNext>
        <ItemsPerPageSelect
          value={itemsPerPage}
          onChange={this.props.onItemsPerPageChange}
        >
          {this.props.itemsPerPageOptions.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </ItemsPerPageSelect>
      </PaginationWrapper>
    );
  }
}

export default NumberedPagination;
