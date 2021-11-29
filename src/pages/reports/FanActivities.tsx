import { Col, Row, Typography } from "antd";
import { useRequest } from "../../hooks/useRequest";
import EditableTable from "../../components/EditableTable";
import CopyIdToClipboard from "../../components/CopyIdToClipboard";
import React, { useEffect, useState } from "react";
import { fetchFanActivity } from "../../services/DiscoClubService";
import { PreReg } from "../../interfaces/PreReg";
import { FanActivity } from "../../interfaces/FanActivity";
import { ColumnsType } from "antd/lib/table";

interface DashboardProps {}

const FanActivities: React.FC<DashboardProps> = () => {
  const [, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const [fanActivity, setFanActivity] = useState<FanActivity[]>([]);

  const getFanActivity = async () => {
    const { results } = await doFetch(fetchFanActivity);
    setFanActivity(results);
  };

  useEffect(() => {
    getFanActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fanActs: ColumnsType<PreReg> = [
    {
      title: "_id",
      dataIndex: "id",
      width: "5%",
      render: (id: any) => <CopyIdToClipboard id={id} />,
      align: "center",
    },
    { title: "User", dataIndex: "user", width: "30%" },
    { title: "Total DD", dataIndex: "totalDiscoDollars", width: "10%" },
    { title: "Wishlist Items", dataIndex: "wishListItems", width: "10%" },
    {
      title: "Logins in the last 10 days",
      dataIndex: "last10dayslogins",
      width: "15%",
    },
    { title: "Total Ordered", dataIndex: "totalOrdered", width: "10%" },
    { title: "Items Ordered", dataIndex: "itemsOrdered", width: "10%" },
    {
      title: "Videos watched this month",
      dataIndex: "feedsWatchedThisMonth",
      width: "10%",
    },
  ];

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <Row>
          <Col lg={12} xs={24}>
            <Typography.Title level={3}>Fan Activities</Typography.Title>
          </Col>
        </Row>
      </div>
      <div>
        <EditableTable
          rowKey="id"
          columns={fanActs}
          dataSource={fanActivity}
          onSave={() => console.log("saved")}
        />
      </div>
    </>
  );
};

export default FanActivities;
