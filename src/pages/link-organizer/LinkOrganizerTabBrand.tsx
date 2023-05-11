import { EditOutlined } from "@ant-design/icons";
import { Table, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table";
import CopyValueToClipboard from "components/CopyValueToClipboard";
import { useRequest } from "hooks/useRequest";
import moment from "moment";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { fetchLinkBrand } from "services/DiscoClubService";
import LinkOrganizerTabBrandDetail from "./LinkOrganizerTabBrandDetail";

interface LinkOrganizerTabBrandProps { }

const LinkOrganizerTabBrand: React.FC<LinkOrganizerTabBrandProps> = () => {
    const [loading, setLoading] = useState(false);
    const { doFetch } = useRequest({ setLoading });
    const [listData, setListData] = useState<any[]>([]);
    const [details, setDetails] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<any>();
    const history = useHistory();

    useEffect(() => {
        history.listen((_, action) => {
            if (action === 'POP' && details) setDetails(false);
        });
    });

    useEffect(() => {
        fetch()
    }, []);

    const fetch = async () => {
        const response = await doFetch(() =>
            fetchLinkBrand({})
        );
        setListData(response.result)
    };

    const onEditRecord = (index: number, record?: any) => {
        setCurrentRecord(record);
        setDetails(true);
        history.push(window.location.pathname);
    };

    const onSaveRecord = () => {
        setDetails(false);
    };

    const onCancelRecord = () => {
        setDetails(false);
    };

    const columns: ColumnsType<any> = [
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
                        <Tooltip title="_id">_id</Tooltip>
                    </div>
                </div>
            ),
            dataIndex: 'id',
            width: '3%',
            render: id => <CopyValueToClipboard value={id} />,
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
                        <Tooltip title="brand">Brand</Tooltip>
                    </div>
                </div>
            ),
            dataIndex: 'brand',
            width: '30%',
            render: (brand: any) => (
                brand.name
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
                        <Tooltip title="Links">Links</Tooltip>
                    </div>
                </div>
            ),
            dataIndex: 'links',
            width: '5%',
            render: (links: [any]) => (
                links.length
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
                        <Tooltip title="Last Update">Last Update</Tooltip>
                    </div>
                </div>
            ),
            dataIndex: 'iLastUpdate',
            width: '10%',
            render: (creation: Date) =>
                creation
                    ? new Date(creation).toLocaleDateString('en-GB') +
                    ' ' +
                    new Date(creation).toLocaleTimeString('en-GB')
                    : '-',
            align: 'center',
            sorter: (a, b): any => {
                if (a.iLastUpdate && b.iLastUpdate)
                    return (
                        moment(a.iLastUpdate as Date).unix() -
                        moment(b.iLastUpdate).unix()
                    );
                else if (a.iLastUpdate) return -1;
                else if (b.iLastUpdate) return 1;
                else return 0;
            },
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
            width: '5%',
            align: 'right',
            render: (_, record, index: number) => (
                <>
                    <Link
                        to={{ pathname: window.location.pathname, state: record }}
                        onClick={() => onEditRecord(index, record)}>
                        <EditOutlined />
                    </Link>
                </>
            ),
        },
    ];

    return (
        <div>
            {!details && (
                <div className="custom-table">
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={listData}
                        loading={loading}
                    />
                </div>
            )}

            {details && (
                <LinkOrganizerTabBrandDetail record={currentRecord} onSave={onSaveRecord} onCancel={onCancelRecord} />
            )}
        </div>
    );
};

export default LinkOrganizerTabBrand;
