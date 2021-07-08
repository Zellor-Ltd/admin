import Select from "antd/lib/select";
import React, { useEffect, useState } from "react";
import { fetchFans } from "../services/DiscoClubService";
import { Fan } from "../interfaces/Fan";
import { Typography } from "antd";

type SelectFanProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> & {
  onChange: (selectedFan: Fan) => {};
  label?: string;
};

export const SelectFan: React.FC<SelectFanProps> = ({
  onChange,
  placeholder = "Select a fan",
  style,
  label = "Fan Filter",
}) => {
  const [fans, setFans] = useState<Fan[]>([]);
  const [searchList, setSearchList] = useState<string[]>([]);
  const [selectedFan, setSelectedFan] = useState<string>("");

  useEffect(() => {
    const getFans = async () => {
      try {
        const { results }: any = await fetchFans();
        const _searchList: string[] = [];
        results.forEach((fan: Fan) => {
          // if (fan.name) _searchList.unshift(fan.name);
          // if (fan.email) _searchList.push(fan.email);
          if (fan.user) _searchList.push(fan.user);
        });
        setSearchList(_searchList);
        setFans(results);
      } catch (e) {}
    };
    getFans();
  }, []);

  const _onChange = (value: string) => {
    setSelectedFan(value);
    onChange(
      fans.find(
        // (fan) => fan.name === value || fan.email === value
        (fan) => fan.user === value
      ) as Fan
    );
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Select
        value={selectedFan}
        onChange={_onChange}
        showSearch
        style={style}
        placeholder={placeholder}
      >
        {searchList.map((value) => (
          <Select.Option key={value} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
