import { Button, Col, PageHeader, Row, Typography } from 'antd';
import SimpleSelect from 'components/select/SimpleSelect';
import { useRequest } from 'hooks/useRequest';
import { FanGroup } from 'interfaces/FanGroup';
import { SelectOption } from 'interfaces/SelectOption';
import { Tag } from 'interfaces/Tag';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { fetchFanGroups } from 'services/DiscoClubService';
import { TagBox } from './TagBox';

interface Step2Props {
  selectedTags: Tag[];
  onReturn?: () => void;
}

const Step2: React.FC<Step2Props> = ({ selectedTags, onReturn }) => {
  const { isMobile } = useContext(AppContext);
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
      <PageHeader title="Push Notifications - Tags" />
      <Row gutter={[8, 8]} justify={isMobile ? 'end' : undefined}>
        <Col lg={6} xs={24}>
          <Typography.Title className="mx-1" level={5}>
            Fan Group Filter
          </Typography.Title>
          <SimpleSelect
            data={fanGroups}
            onChange={(_, fanGroup) => handleFanGroupChange(fanGroup)}
            style={{ width: '92%' }}
            selectedOption={selectedFanGroup?.name}
            optionMapping={fanGroupMapping}
            placeholder={'Select a fan group'}
            loading={isFetchingFanGroups}
            disabled={isFetchingFanGroups}
            allowClear
            className="mx-1"
          ></SimpleSelect>
        </Col>
        <Col span={24}>
          {selectedFanGroup && (
            <div className="mx-1">
              {selectedTags.map(tag => (
                <TagBox tag={tag} selectedFanGroup={selectedFanGroup} />
              ))}
            </div>
          )}
        </Col>
        <Col span={24}>
          <Button
            type="default"
            onClick={() => onReturn?.()}
            className="mx-1 mb-1"
          >
            Back
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Step2;
