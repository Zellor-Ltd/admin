import { Button, Col, PageHeader, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
import { useRequest } from 'hooks/useRequest';
import { FanGroup } from 'interfaces/FanGroup';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchFanGroups } from 'services/DiscoClubService';

const FanGroups: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/fan-group`;
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });

  const {
    setArrayList: setFanGroups,
    filteredArrayList: filteredFanGroups,
    addFilterFunction,
  } = useFilter<FanGroup>([]);

  const getResources = async () => {
    await getFanGroups();
  };

  const getFanGroups = async () => {
    const { results } = await doFetch(fetchFanGroups);
    setFanGroups(results);
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<FanGroup> = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      width: '20%',
    },
    {
      title: 'Creation',
      dataIndex: 'hCreationDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
          <div>{moment(value).format('HH:mm')}</div>
        </>
      ),
    },
  ];

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction('fanGroupName', fanGroups =>
      fanGroups.filter(fanGroup =>
        fanGroup.name.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="Fan Groups"
        subTitle="List of Fan Groups"
        extra={[
          <Button key="1" onClick={() => history.push(detailsPathname)}>
            New Item
          </Button>,
        ]}
      />
      <Row gutter={8}>
        <Col lg={8} xs={16}>
          <SearchFilter
            filterFunction={searchFilterFunction}
            label="Search by Name"
          />
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredFanGroups}
        loading={loading}
      />
    </div>
  );
};

export default FanGroups;
