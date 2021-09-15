import { SearchOutlined } from "@ant-design/icons";
import { Input, Typography } from "antd";
import { debounce } from "lodash";
import React, { useEffect, useRef, useState } from "react";

interface SearchFilterDebounceProps {
  filterFunction: (filterText: string) => void;
  initialValue?: string;
  label?: string;
}

export const SearchFilterDebounce: React.FC<SearchFilterDebounceProps> = ({
  filterFunction,
  initialValue = "",
  label = "Search",
}) => {
  const [text, setText] = useState<string>(initialValue);

  const debounced = useRef(
    debounce((newText) => {
      filterFunction(newText);
    }, 1000)
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
        value={text}
        suffix={<SearchOutlined />}
      />
    </div>
  );
};
