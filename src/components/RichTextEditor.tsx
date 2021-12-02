import { Input, Modal } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { Button } from 'antd/lib/radio';
import { ContentState, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import React, { useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const { TextArea } = Input;

/*
The package "react-draft-wysiwyg" is throwing this warning to console:
Warning: Can't call setState on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the r component.

It seems this package is not compatible with react strictMode yet.
*/

interface RichTextEditorProps {
  formField: string;
  form: FormInstance;
  editableHtml?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  formField,
  form,
  editableHtml = false,
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

  const [htmlValue, setHtmlValue] = useState<string>(fieldValue);
  const [editorState, setEditorState] =
    useState<EditorState>(editorInitialValue);

  const handleEditorChange = (newState: EditorState) => {
    setEditorState(newState);
    const _htmlValue = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );
    form.setFieldsValue({
      [formField]: _htmlValue,
    });
    setHtmlValue(_htmlValue);
  };

  const onOk = () => {
    setShowModal(false);
    // Envolve htmlValue content with a <p></p> to prevent RichTextEditor from crashing.
    const formattedHtmlValue =
      htmlValue.substr(0, 3) === '<p>' ? htmlValue : `<p>${htmlValue}</p>`;
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
        editorState={editorState}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="editorClassName"
        onEditorStateChange={handleEditorChange}
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
                setHtmlValue(event.target.value);
              }}
              style={{ height: '300px' }}
            />
          </Modal>
        </>
      )}
    </>
  );
};
