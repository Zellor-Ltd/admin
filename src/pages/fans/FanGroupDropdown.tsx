import { Button, Divider, Form, FormInstance, Input, Select } from 'antd';
import React, { ChangeEventHandler, useEffect, useState } from 'react';
import { FanGroup } from 'interfaces/FanGroup';
import { useRequest } from 'hooks/useRequest';
import { fetchFanGroups, saveFanGroup } from 'services/DiscoClubService';

interface FanGroupDropdownProps {
  form: FormInstance<any>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  style?: any;
}

const FanGroupDropdown: React.FC<FanGroupDropdownProps> = ({
  form,
  loading,
  setLoading,
  style = { width: 240 },
}) => {
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [fanGroups, setFanGroups] = useState<FanGroup[]>([]);
  const [selectedFanGroup, setSelectedFanGroup] = useState<string>(
    form.getFieldValue('group')
  );
  const [addFanGroupField, setAddFanGroupField] = useState<string>('');

  const getFanGroups = async () => {
    const response: any = await fetchFanGroups();
    setFanGroups(response.results);
  };

  useEffect(() => {
    getFanGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFanGroup = async () => {
    await doRequest(
      () => saveFanGroup({ name: addFanGroupField }),
      'Fan Group Created.'
    );
    const response = await doFetch(() => fetchFanGroups());
    setFanGroups(response.results);
    setAddFanGroupField('');
  };

  const onFanGroupChange: ChangeEventHandler<HTMLInputElement> = event => {
    setAddFanGroupField(event.target.value);
  };

  return (
    <Form.Item label="Group">
      <Select
        style={style}
        placeholder="Group"
        allowClear
        onChange={(value = '') => {
          setSelectedFanGroup(String(value));
          form.setFieldsValue({ group: String(value) });
        }}
        value={selectedFanGroup}
        dropdownRender={menu => (
          <div>
            {menu}
            <Divider style={{ margin: '4px 0' }} />
            <div
              style={{
                display: 'flex',
                flexWrap: 'nowrap',
                justifyContent: 'space-between',
                padding: 8,
              }}
            >
              <Input
                style={{ flex: 'auto', marginRight: '6px' }}
                value={addFanGroupField}
                onChange={onFanGroupChange}
              />
              <Button onClick={addFanGroup} loading={loading} type="primary">
                Add item
              </Button>
            </div>
          </div>
        )}
      >
        {fanGroups.map(fanGroup => (
          <Select.Option key={fanGroup.id} value={fanGroup.name}>
            {fanGroup.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default FanGroupDropdown;
