import { Button, Col, PageHeader, Row, Typography } from 'antd';
import SimpleSelect from 'components/select/SimpleSelect';
import { useRequest } from 'hooks/useRequest';
import { FanGroup } from 'interfaces/FanGroup';
import { SelectOption } from 'interfaces/SelectOption';
import { Tag } from 'interfaces/Tag';
import { useEffect, useState } from 'react';
import { fetchFanGroups } from 'services/DiscoClubService';
import { TagBox } from './TagBox';

interface Step2Props {
  selectedTags: Tag[];
  onReturn?: () => void;
}

const Step2: React.FC<Step2Props> = ({ selectedTags, onReturn }) => {
  const [selectedFanGroup, setSelectedFanGroup] = useState<FanGroup>();
  const [fanGroups, setFanGroups] = useState<FanGroup[]>([]);
  const { doFetch } = useRequest();

  const fanGroupMapping: SelectOption = {
    key: 'id',
    label: 'name',
    value: 'name',
  };

  const getResources = async () => {
    const { results }: { results: FanGroup[] } = await doFetch(() =>
      fetchFanGroups()
    );
    setFanGroups(results);
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFanGroupChange = async (value: FanGroup) => {
    setSelectedFanGroup(value);
  };

  return (
    <>
      <PageHeader title="Push Notifications - Tags" />
      <Row
        gutter={[8, 8]}
        justify="space-between"
        align="bottom"
        className="mr-1 ml-1"
      >
        <Col lg={12} xs={24}>
          <Typography.Title level={5}>Fan Group Filter</Typography.Title>
          <SimpleSelect
            showSearch
            data={fanGroups}
            onChange={(_, fanGroup) => handleFanGroupChange(fanGroup)}
            style={{ width: '100%' }}
            selectedOption={selectedFanGroup?.name}
            optionMapping={fanGroupMapping}
            placeholder="Select a Fan Group"
            disabled={!fanGroups.length}
            className="mb-1"
            allowClear
          ></SimpleSelect>
          {selectedFanGroup && (
            <div>
              {selectedTags.map(tag => (
                <TagBox
                  key={tag.id}
                  tag={tag}
                  selectedFanGroup={selectedFanGroup}
                />
              ))}
            </div>
          )}
        </Col>
        <Col lg={12} xs={24}>
          <Row justify="end">
            <Col>
              <Button type="default" onClick={() => onReturn?.()}>
                Back
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default Step2;
