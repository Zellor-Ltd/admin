import { SearchOutlined } from "@ant-design/icons";
import { Input, Typography } from "antd";
import { debounce } from "lodash";
import React, { useEffect, useRef, useState } from "react";

interface SearchFilterDebounceProps {
  filterFunction: (filterText: string) => void;
  label?: string;
}

export const SearchFilterDebounce: React.FC<SearchFilterDebounceProps> = ({
  filterFunction,
  label = "Search",
}) => {
  const [text, setText] = useState<string>("");

  const debounced = useRef(
    debounce((newText) => filterFunction(newText), 1000)
  );

  useEffect(() => debounced.current(text), [text]);

  return (
    <div style={{ marginBottom: "16px" }}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Input
        onChange={(evt) => {
          setText(evt.target.value);
        }}
        suffix={<SearchOutlined />}
      />
    </div>
  );
};
