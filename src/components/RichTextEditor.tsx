import { FormInstance } from "antd/lib/form";
import React, { useState } from "react";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface RichTextEditorProps {
  formField: string;
  form: FormInstance;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  formField,
  form,
}) => {
  const fieldValue = form.getFieldValue(formField);
  const editorInitialValue = fieldValue
    ? EditorState.createWithContent(
        ContentState.createFromBlockArray(htmlToDraft(fieldValue).contentBlocks)
      )
    : EditorState.createEmpty();

  const [editorState, setEditorState] =
    useState<EditorState>(editorInitialValue);

  const handleEditorChange = (newState: EditorState) => {
    setEditorState(newState);
    form.setFieldsValue({
      [formField]: draftToHtml(convertToRaw(editorState.getCurrentContent())),
    });
  };

  return (
    <Editor
      editorState={editorState}
      toolbarClassName="toolbarClassName"
      wrapperClassName="wrapperClassName"
      editorClassName="editorClassName"
      onEditorStateChange={handleEditorChange}
    />
  );
};
