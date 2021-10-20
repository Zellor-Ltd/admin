import { Typography } from "antd";
import Select from "antd/lib/select";
import { useRequest } from "hooks/useRequest";
import { FanGroup } from "interfaces/FanGroup";
import React, { useEffect, useState } from "react";
import { fetchFanGroups } from "../services/DiscoClubService";

type SelectFanGroupProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> & {
  onChange: (selectedFanGroup: FanGroup) => {};
  label?: string;
};

export const SelectFanGroup: React.FC<SelectFanGroupProps> = ({
  onChange,
  placeholder = "Select",
  style,
  label = "Fan Group Filter",
}) => {
  const [fanGroups, setFanGroups] = useState<FanGroup[]>([]);
  const [selectedFanGroup, setSelectedFanGroup] = useState<string>("");
  const { doFetch } = useRequest();

  const getResources = async () => {
    // const { results: fansResults } = await doFetch(() => fetchFans());
    const { results }: { results: FanGroup[] } = await doFetch(() =>
      fetchFanGroups()
    );
    setFanGroups(results);
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onChange = async (value: string) => {
    setSelectedFanGroup(value);
    onChange(fanGroups.find((group) => group.name === value) as FanGroup);
    getResources();
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Typography.Title level={5} title={label}>
        {label}
      </Typography.Title>
      <Select
        value={selectedFanGroup}
        onChange={_onChange}
        showSearch
        style={style}
        placeholder={placeholder}
      >
        {fanGroups.map((value) => (
          <Select.Option key={value.name} value={value.name}>
            {value.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
