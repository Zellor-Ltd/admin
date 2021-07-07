import { Row, Col, Typography, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import React from "react";

interface SearchFilterProps {
  filterFunction: (filterText: string) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  filterFunction,
}) => {
  const onChangeFilter = (evt: React.ChangeEvent<HTMLInputElement>) => {
    filterFunction(evt.target.value);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Row>
        <Col lg={12} xs={24}>
          <Typography.Title level={5} title="Search">
            Search
          </Typography.Title>
          <Input onChange={onChangeFilter} suffix={<SearchOutlined />} />
        </Col>
      </Row>
    </div>
  );
};
