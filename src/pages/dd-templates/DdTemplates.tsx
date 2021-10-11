import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, PageHeader, Popconfirm, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SearchFilter } from "components/SearchFilter";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { DdTemplate } from "interfaces/DdTemplate";
import moment from "moment";
import { useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { deleteDdTemplate, fetchDdTemplates } from "services/DiscoClubService";
import CopyIdToClipboard from "components/CopyIdToClipboard";

const DdTemplates: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/dd-template`;
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [content, setContent] = useState<any[]>([]);

  const {
    setArrayList: setDdTemplates,
    filteredArrayList: filteredDdTemplates,
    addFilterFunction,
  } = useFilter<DdTemplate>([]);

  const getResources = async () => {
    await getDdTemplates();
  };

  const getDdTemplates = async () => {
    const { results } = await doFetch(fetchDdTemplates);
    setDdTemplates(results);
    setContent(results);
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteItem = async (id: string) => {
    await doRequest(() => deleteDdTemplate({ id }));
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === id) {
        const index = i;
        setDdTemplates((prev) => [
          ...prev.slice(0, index),
          ...prev.slice(index + 1),
        ]);
      }
    }
  };

  const columns: ColumnsType<DdTemplate> = [
    {
      title: "_id",
      dataIndex: "id",
      width: "6%",
      render: (id) => <CopyIdToClipboard id={id} />,
      align: "center",
    },
    {
      title: "Tag Name",
      dataIndex: "tagName",
      width: "20%",
      render: (value: string, record: DdTemplate) => (
        <Link to={{ pathname: detailsPathname, state: record }}>{value}</Link>
      ),
    },
    {
      title: "Template",
      dataIndex: "template",
      width: "12%",
      align: "center",
    },
    {
      title: "Disco Gold",
      dataIndex: "discoGold",
      width: "10%",
      align: "center",
    },
    {
      title: "Disco Dollars",
      dataIndex: "discoDollars",
      width: "10%",
      align: "center",
    },
    {
      title: "Creation",
      dataIndex: "hCreationDate",
      width: "15%",
      align: "center",
      render: (value: Date) => (
        <>
          <div>{moment(value).format("DD/MM/YYYY")}</div>
          <div>{moment(value).format("HH:mm")}</div>
        </>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: "10%",
      align: "right",
      render: (_, record: DdTemplate) => (
        <>
          <Link to={{ pathname: detailsPathname, state: record }}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction("ddTagName", (dds) =>
      dds.filter((dd) =>
        dd.tagName.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="Disco Dollars Templates"
        subTitle="List of Disco Dollars Templates"
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
            label="Search by Tag Name"
          />
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredDdTemplates}
        loading={loading}
      />
    </div>
  );
};

export default DdTemplates;
