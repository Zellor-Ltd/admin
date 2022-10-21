import { Input, Modal } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { Button } from 'antd/lib/radio';
import { ContentState, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import React, { useEffect, useRef, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import DOMPurify from 'isomorphic-dompurify';

const { TextArea } = Input;
interface RichTextEditorProps {
  formField: string;
  form: FormInstance;
  editableHtml?: boolean;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  formField,
  form,
  editableHtml = false,
  disabled,
}) => {
  const generateEditorContent = (htmlValue: string) => {
    return EditorState.createWithContent(
      ContentState.createFromBlockArray(htmlToDraft(htmlValue).contentBlocks)
    );
  };

  const [showModal, setShowModal] = useState<boolean>(false);
  const fieldValue = form.getFieldValue(formField);
  const editorInitialValue = fieldValue
    ? generateEditorContent(fieldValue)
    : EditorState.createEmpty();

  const [htmlValue, setHtmlValue] = useState<string>();
  const isMounted = useRef<boolean>(false);
  const [editorState, setEditorState] =
    useState<EditorState>(editorInitialValue);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (fieldValue) setHtmlValue(DOMPurify.sanitize(fieldValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditorChange = (newState: EditorState) => {
    setEditorState(newState);
    const _htmlValue = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );
    form.setFieldsValue({
      [formField]: _htmlValue,
    });
    setHtmlValue(DOMPurify.sanitize(_htmlValue));
  };

  const onOk = () => {
    setShowModal(false);
    // Involve htmlValue content with a <p></p> to prevent RichTextEditor from crashing.
    const formattedHtmlValue =
      htmlValue?.substr(0, 3) === '<p>' ? htmlValue : `<p>${htmlValue}</p>`;
    setHtmlValue(formattedHtmlValue);
    form.setFieldsValue({
      [formField]: formattedHtmlValue,
    });
    setEditorState(generateEditorContent(formattedHtmlValue));
  };

  const onCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <Editor
        readOnly={disabled}
        editorState={editorState}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="editorClassName"
        onEditorStateChange={handleEditorChange}
        wrapperStyle={{ border: '1px solid #F1F1F1' }}
        editorStyle={{ padding: '4px' }}
      />
      {editableHtml && (
        <>
          <Button onClick={() => setShowModal(true)}>Edit HTML</Button>
          <Modal
            title="Edit HTML"
            visible={showModal}
            width="800px"
            onOk={onOk}
            onCancel={onCancel}
            forceRender
          >
            <TextArea
              value={htmlValue}
              onChange={event => {
                setHtmlValue(DOMPurify.sanitize(event.target.value));
              }}
              style={{ height: '300px' }}
            />
          </Modal>
        </>
      )}
    </>
  );
};
