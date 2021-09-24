import Select from "antd/lib/select";
import React, { useEffect, useState } from "react";
import { fetchFanGroups } from "../services/DiscoClubService";
import { FanFilter } from "../interfaces/Fan";
import { Typography } from "antd";
import { useRequest } from "hooks/useRequest";
import { FanGroup } from "interfaces/FanGroup";

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
    isGroup: false,
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

  const getResources = async () => {
    // const { results: fansResults } = await doFetch(() => fetchFans());
    const initialArray = [];
    const { results: fanGroupsResults }: { results: FanGroup[] } =
      await doFetch(() => fetchFanGroups());
    const _searchList: string[] = [];
    const _fansQueryFilters: FanFilter[] = [
      ...fansQueryFilters,
      ...fanGroupsResults.map((fanGroup) => ({
        id: fanGroup.id,
        user: fanGroup.name,
        isFilter: true,
        isGroup: true,
      })),
    ];
    initialArray.unshift(..._fansQueryFilters);
    initialArray.forEach((fan: FanFilter) => {
      if (fan.user) _searchList.push(fan.user);
    });
    setSearchList(_searchList);
    setFans([...initialArray]);
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onChange = async (value: string) => {
    setSelectedFan(value);
    onChange(fans.find((fan) => fan.user === value) as FanFilter);
    getResources();
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
