import { useRequest } from 'hooks/useRequest';
import { FanGroup } from 'interfaces/FanGroup';
import { Tag } from 'interfaces/Tag';
import React, { useState } from 'react';
import { pushGroupTag } from 'services/DiscoClubService';

interface TagBoxProps {
  tag: Tag;
  selectedFanGroup: FanGroup;
}

export const TagBox: React.FC<TagBoxProps> = ({ tag, selectedFanGroup }) => {
  const [counter, setCounter] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });

  const handleClick = async () => {
    if (loading) return;
    await doRequest(() => pushGroupTag(tag.id, selectedFanGroup.id));
    const newCounter = { ...counter };
    newCounter[selectedFanGroup.name] =
      (newCounter[selectedFanGroup.name] || 0) + 1;
    setCounter(newCounter);
  };

  return (
    <div
      style={{
        height: 100,
        width: 100,
        backgroundColor: tag.template === 'dollar' ? '#1890ff' : 'yellow',
        marginRight: '16px',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          height: 80,
          cursor: 'pointer',
          color: 'white',
          textAlign: 'center',
          lineHeight: '76px',
          fontSize: '36px',
        }}
        onClick={handleClick}
      >
        <div
          style={{
            position: 'relative',
            height: '0px',
            top: '0px',
            float: 'right',
            right: '5px',
            lineHeight: 'initial',
            fontSize: 'initial',
          }}
        >
          {counter[selectedFanGroup.name] || 0}
        </div>
        {tag.template === 'dollar' && (
          <div style={{ paddingTop: '4px' }}>{tag.discoDollars}</div>
        )}
        {tag.template === 'product' && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={tag.product?.thumbnailUrl.url}
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
      <div
        style={{
          height: 20,
          backgroundColor: 'grey',
          fontSize: 10,
          textAlign: 'center',
          paddingTop: '2px',
          wordWrap: 'break-word',
          textOverflow: 'clip',
        }}
      >
        {tag.brand?.brandName}
      </div>
    </div>
  );
};
