import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Col,
  Collapse,
  Input,
  List,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Tabs,
  Table,
  Tag,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from '../../components/CopyIdToClipboard';
import { discoBrandId } from '../../helpers/constants';
import { Brand } from '../../interfaces/Brand';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteBrand,
  fetchBrands,
  saveBrand,
} from '../../services/DiscoClubService';
import { SimpleSwitch } from '../../components/SimpleSwitch';
import scrollIntoView from 'scroll-into-view';
import InfiniteScroll from 'react-infinite-scroll-component';

const { Panel } = Collapse;

const DataManagement: React.FC<RouteComponentProps> = ({}) => {
  const [currentActiveKey, setCurrentActiveKey] = useState<number>(0);
  const [newTabIndex, setNewTabIndex] = useState<number>(0);
  const [panes, setPanes] = useState<any>([{}]);

  const add = () => {
    setNewTabIndex(prev => prev++);
    setCurrentActiveKey(newTabIndex);
    const newPanes = [...panes];
    newPanes.push({
      title: 'New Tab',
      content: 'Content of new Tab',
      key: currentActiveKey,
    });
    setPanes(newPanes);
  };

  const remove = targetKey => {
    let newActiveKey = currentActiveKey;
    let lastIndex;

    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });

    const newPanes = panes.filter(pane => pane.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }

    setPanes(newPanes);
    setCurrentActiveKey(newActiveKey);
  };

  const onChange = activeKey => {
    setCurrentActiveKey(activeKey);
  };

  const onEdit = (targetKey, action) => {
    action === 'add' ? add() : remove(targetKey);
  };

  const procedures = [
    <Button
      onClick={add}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; Text Button
    </Button>,
  ];

  return (
    <>
      <PageHeader
        title="Data Management"
        extra={[
          <Button key="1" onClick={() => console.log('hi')}>
            New Item
          </Button>,
        ]}
      />
      <Row>
        <Col span={6} className="batch-process">
          <Collapse ghost>
            <Panel header="Procedures" key="1">
              <List
                size="small"
                dataSource={procedures}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </Panel>
          </Collapse>
        </Col>
        <Col span={17}>
          <Row>
            <Col>
              <Tabs
                type="editable-card"
                onChange={onChange}
                activeKey={currentActiveKey as unknown as string}
                onEdit={onEdit}
              >
                {panes.map(pane => (
                  <Tabs.TabPane
                    tab={pane.title}
                    key={pane.key}
                    closable={true}
                    className="requests"
                  >
                    {pane.content}
                  </Tabs.TabPane>
                ))}
              </Tabs>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default DataManagement;
