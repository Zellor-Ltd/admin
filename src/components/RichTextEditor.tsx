import { FormInstance } from "antd/lib/form";
import React, { useState } from "react";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

/*
The package "react-draft-wysiwyg" is throwing this warning to console:
Warning: Can't call setState on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the r component.

It seems this package is not compatible with react strictMode yet.
*/

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
