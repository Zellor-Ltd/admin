import Select from "antd/lib/select";
import React, { useEffect, useState } from "react";
import { fetchFans } from "../services/DiscoClubService";
import { FanFilter } from "../interfaces/Fan";
import { Typography } from "antd";
import { useRequest } from "hooks/useRequest";

type SelectFanQueryProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> & {
  onChange: (selectedFan: FanFilter) => {};
  label?: string;
};

const fansQueryFilters: FanFilter[] = [
  {
    id: "allfans",
    user: "All Disco Fans",
    isFilter: true,
  },
];

export const SelectFanQuery: React.FC<SelectFanQueryProps> = ({
  onChange,
  placeholder = "Select",
  style,
  label = "Fan Filter",
}) => {
  const [fans, setFans] = useState<FanFilter[]>([]);
  const [searchList, setSearchList] = useState<string[]>([]);
  const [selectedFan, setSelectedFan] = useState<string>("");
  const { doFetch } = useRequest();

  const getFans = async () => {
    const { results } = await doFetch(() => fetchFans());
    const _searchList: string[] = [];
    results.unshift(...fansQueryFilters);
    results.forEach((fan: FanFilter) => {
      if (fan.user) _searchList.push(fan.user);
    });
    setSearchList(_searchList);
    setFans([...results]);
  };

  useEffect(() => {
    getFans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onChange = async (value: string) => {
    setSelectedFan(value);
    onChange(fans.find((fan) => fan.user === value) as FanFilter);
    getFans();
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
