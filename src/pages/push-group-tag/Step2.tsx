import { Button, Col, PageHeader, Row, Typography } from 'antd';
import SimpleSelect from 'components/SimpleSelect';
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
  const [isFetchingFanGroups, setIsFetchingFanGroups] = useState(false);
  const { doFetch } = useRequest();

  const fanGroupMapping: SelectOption = {
    key: 'id',
    label: 'name',
    value: 'name',
  };

  const getResources = async () => {
    setIsFetchingFanGroups(true);
    // const { results: fansResults } = await doFetch(() => fetchFans());
    const { results }: { results: FanGroup[] } = await doFetch(() =>
      fetchFanGroups()
    );
    setFanGroups(results);
    setIsFetchingFanGroups(false);
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
      <PageHeader title="Push Notifcations - Tags" />
      <Row gutter={8} style={{ marginBottom: '20px', width: '100%' }}>
        <Col>
          <Typography.Title level={5}>Fan Group Filter</Typography.Title>
          <SimpleSelect
            data={fanGroups}
            onChange={(_, fanGroup) => handleFanGroupChange(fanGroup)}
            style={{ width: '100%', marginBottom: '16px' }}
            selectedOption={selectedFanGroup?.name}
            optionsMapping={fanGroupMapping}
            placeholder={'Select a fan group'}
            loading={isFetchingFanGroups}
            disabled={isFetchingFanGroups}
            allowClear={true}
          ></SimpleSelect>
        </Col>
      </Row>
      <Row gutter={8}>
        {selectedFanGroup && (
          <>
            {selectedTags.map(tag => (
              <TagBox tag={tag} selectedFanGroup={selectedFanGroup} />
            ))}
          </>
        )}
      </Row>
      <Row gutter={8} style={{ marginTop: '16px' }}>
        <Col>
          <Button type="default" onClick={() => onReturn?.()}>
            Back
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Step2;
