import Select from "antd/lib/select";
import React, { useEffect, useState } from "react";
import { fetchFans } from "../services/DiscoClubService";
import { Fan } from "../interfaces/Fan";

type SelectFanProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> & {
  onChange: (selectedFan: Fan) => {};
};

export const SelectFan: React.FC<SelectFanProps> = ({
  onChange,
  placeholder = "Select a fan",
  style,
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
  );
};
