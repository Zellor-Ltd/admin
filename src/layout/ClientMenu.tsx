import { MenuOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Dropdown,
  Image,
  Menu,
  Row,
  Tooltip,
  Typography,
} from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ClientMenu = () => {
  const [hoveredMenuItem, setHoveredMenuItem] = useState<string>();
  const [isFocusing, setIsFocusing] = useState(false);

  const clientMenuItems = (
    <Menu
      style={{ position: 'relative', top: '0.75rem' }}
      onMouseEnter={() => setIsFocusing(true)}
      onMouseLeave={() => setIsFocusing(false)}
    >
      <Menu.Item>
        <Link
          to="/client-dashboard"
          onMouseOver={() => setHoveredMenuItem('Analytics')}
        >
          Analytics
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Typography.Text type="secondary">
          <p
            style={{ display: 'inline' }}
            onMouseEnter={() => setHoveredMenuItem('Product Catalogue')}
          >
            Product Catalogue
          </p>
        </Typography.Text>
      </Menu.Item>
      <Menu.Item>
        <Typography.Text type="secondary">
          <p
            style={{ display: 'inline' }}
            onMouseEnter={() => setHoveredMenuItem('Video Library')}
          >
            Video Library
          </p>
        </Typography.Text>
      </Menu.Item>
      <Menu.Item>
        <Link
          to="/playlists"
          onMouseOver={() => setHoveredMenuItem('Carousels')}
        >
          Carousels
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Row justify="space-between" style={{ background: '#211e1e' }}>
      <Col
        span={2}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Tooltip title={hoveredMenuItem} placement="right" visible={isFocusing}>
          <Dropdown overlay={clientMenuItems} trigger={['click']}>
            <Button className="ant-dropdown-link" type="text">
              <MenuOutlined style={{ fontSize: '1.75rem', color: 'white' }} />
            </Button>
          </Dropdown>
        </Tooltip>
      </Col>
      <Col span={22}>
        <Row justify="center">
          <Col style={{ padding: '1rem' }}>
            {/* {getClientLogo()} */}
            <Image
              width={70}
              style={{ position: 'relative', right: '1.5rem' }}
              src="/tmplogoelf.svg"
              preview={false}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ClientMenu;
