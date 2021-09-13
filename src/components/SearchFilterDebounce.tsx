import { SearchOutlined } from "@ant-design/icons";
import { Input, Typography } from "antd";
import { AppContext } from "contexts/AppContext";
import { debounce } from "lodash";
import React, { useContext, useEffect, useRef, useState } from "react";

interface SearchFilterDebounceProps {
  filterFunction: (filterText: string) => void;
  label?: string;
}

export const SearchFilterDebounce: React.FC<SearchFilterDebounceProps> = ({
  filterFunction,
  label = "Search",
}) => {
  const { filterValues, setFilterValues } = useContext(AppContext);

  const [text, setText] = useState<string>(filterValues[label]);

  const debounced = useRef(
    debounce((newText) => {
      filterFunction(newText);
      setFilterValues((prev) => ({ ...prev, [label]: newText }));
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
