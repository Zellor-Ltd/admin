import { Col, Row, Popconfirm, Button, Table, Typography } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import CopyIdToClipboard from '../../components/CopyIdToClipboard';
import React, { useEffect, useState } from 'react';
import { fetchPreRegs, deletePreReg } from '../../services/DiscoClubService';
import { PreReg } from '../../interfaces/PreReg';
import { ColumnsType } from 'antd/lib/table';

interface DashboardProps {}

const PreRegisteredUsers: React.FC<DashboardProps> = () => {
  const [, setLoading] = useState<boolean>(true);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [preRegs, setPreRegs] = useState<PreReg[]>([]);
  const [content, setContent] = useState<any[]>([]);

  const getPreRegs = async () => {
    const { results } = await doFetch(fetchPreRegs);
    setPreRegs(results);
    setContent(results);
  };

  useEffect(() => {
    getPreRegs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteItem = async (record: PreReg) => {
    await doRequest(() => deletePreReg(record));
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === record.id) {
        const index = i;
        setPreRegs(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
      }
    }
  };

  const preRegistered: ColumnsType<PreReg> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '5%',
      render: (id: any) => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    { title: 'Email', dataIndex: 'email', width: '15%' },
    {
      title: 'Creation Date',
      dataIndex: 'hCreationDate',
      width: '65%',
      align: 'center',
      responsive: ['sm'],
      render: (hCreationDate: Date) =>
        moment(hCreationDate).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '15%',
      align: 'right',
      render: (record: PreReg) => (
        <>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <Row>
          <Col lg={12} xs={24}>
            <Typography.Title level={3}>Pre Registered Users</Typography.Title>
          </Col>
        </Row>
      </div>
      <div>
        <Table rowKey="id" columns={preRegistered} dataSource={preRegs} />
      </div>
    </>
  );
};

export default PreRegisteredUsers;
