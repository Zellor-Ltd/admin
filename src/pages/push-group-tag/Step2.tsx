import { Button, Col, PageHeader, Row } from 'antd';
import { SelectFanGroup } from 'components/SelectFanGroup';
import { FanGroup } from 'interfaces/FanGroup';
import { Tag } from 'interfaces/Tag';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { TagBox } from './TagBox';

const Step2: React.FC<RouteComponentProps> = props => {
  const { history, location } = props;
  const selectedTags = location.state as unknown as Tag[];
  const [selectedFanGroup, setSelectedFanGroup] = useState<FanGroup>();

  const handleFanGroupChange = async (value: FanGroup) => {
    setSelectedFanGroup(value);
  };

  return (
    <>
      <PageHeader title="Push Notifcations - Tags" />
      <Row gutter={8} style={{ marginBottom: '20px', width: '100%' }}>
        <Col>
          <SelectFanGroup
            onChange={handleFanGroupChange}
            style={{ width: '250px' }}
          ></SelectFanGroup>
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
          <Button type="default" onClick={() => history.goBack()}>
            Back
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Step2;
