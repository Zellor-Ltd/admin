import { BellOutlined, CloseOutlined } from '@ant-design/icons';
import { Client } from '@stomp/stompjs';
import { Button, Col, Dropdown, Menu, Row } from 'antd';
import React, { useEffect, useState } from 'react';

interface NotificationsProps {}

export const Notifications: React.FC<NotificationsProps> = () => {
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const [brokerURL, login, passcode, exchange] =
      process.env.REACT_APP_STOMP_SERVER?.split('|') || [];
    const client = new Client({
      brokerURL,
      connectHeaders: {
        login,
        passcode,
      },
    });
    client.onConnect = function () {
      //console.log(`Connected to stomp server: ${brokerURL}`);
      client.subscribe(exchange, function (data) {
        setMessages(prev => [...prev, data?.body]);
      });
    };
    client.activate();
    return () => {
      client.deactivate();
    };
  }, []);

  const removeMessage = (index: number) => {
    setMessages([...messages.slice(0, index), ...messages.slice(index + 1)]);
  };

  const menu = (
    <Menu
      style={{
        width: '220px',
        maxHeight: '320px',
        overflowY: messages.length ? 'scroll' : 'initial',
      }}
    >
      {messages.length ? (
        messages.map((message, index) => (
          <>
            <Menu.Item>
              <Row>
                <Col xs={20}>
                  <div
                    style={{
                      padding: '8px 0 0 0',
                      whiteSpace: 'initial',
                      wordWrap: 'break-word',
                    }}
                  >
                    {message}
                  </div>
                </Col>
                <Col xs={4}>
                  <Button
                    type="link"
                    size="large"
                    onClick={() => removeMessage(index)}
                    icon={<CloseOutlined />}
                  />
                </Col>
              </Row>
            </Menu.Item>
            <Menu.Divider />
          </>
        ))
      ) : (
        <Menu.Item>There are no messages.</Menu.Item>
      )}
    </Menu>
  );

  const handleVisibleChange = (flag: boolean) => {
    setShowAlerts(flag);
  };

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      onVisibleChange={handleVisibleChange}
      visible={showAlerts}
    >
      <Button
        style={{
          height: '100%',
          backgroundColor: 'rgb(0 21 41)',
          borderColor: 'rgb(0 21 41)',
          marginRight: '16px',
          marginTop: '6px',
          fontSize: '20px',
        }}
        shape="circle"
        size="large"
        onClick={e => e.preventDefault()}
        icon={
          <BellOutlined style={{ color: 'white', height: 18, width: 38 }} />
        }
      >
        <span
          style={{
            position: 'absolute',
            top: '0px',
            right: '2px',
            borderRadius: '50%',
            background: messages.length ? 'red' : 'inherit',
            height: '10px',
            width: '10px',
          }}
        />
      </Button>
    </Dropdown>
  );
};
