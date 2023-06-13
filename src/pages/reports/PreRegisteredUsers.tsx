import { Col, Row, Popconfirm, Button, Table, Tooltip, Typography } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import CopyValueToClipboard from '../../components/CopyValueToClipboard';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { fetchPreRegs, deletePreReg } from '../../services/DiscoClubService';
import { PreReg } from '../../interfaces/PreReg';
import { ColumnsType } from 'antd/lib/table';

interface DashboardProps {}

const PreRegisteredUsers: React.FC<DashboardProps> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [preRegs, setPreRegs] = useState<PreReg[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const { isMobile } = useContext(AppContext);

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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="ID">ID</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '5%',
      render: (id: any) => (
        <CopyValueToClipboard tooltipText="Copy ID" value={id} />
      ),
      align: 'center',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Email">Email</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'email',
      width: '15%',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Creation Date">Creation Date</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hCreationDate',
      width: '65%',
      align: 'center',
      responsive: ['sm'],
      render: (hCreationDate: Date) =>
        moment(hCreationDate).format('DD/MM/YYYY'),
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
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
      <div
        style={
          isMobile
            ? {
                padding: '20px',
              }
            : {}
        }
      >
        <Row className="mb-05">
          <Col lg={12} xs={24}>
            <Typography.Title
              level={4}
              className={isMobile ? 'mb-n1 ant-page-header' : 'ant-page-header'}
            >
              Pre Registered Users
            </Typography.Title>
          </Col>
        </Row>
      </div>
      <div>
        <Table
          scroll={{ x: true }}
          loading={loading}
          rowKey="id"
          columns={preRegistered}
          dataSource={preRegs}
        />
      </div>
    </>
  );
};

export default PreRegisteredUsers;
