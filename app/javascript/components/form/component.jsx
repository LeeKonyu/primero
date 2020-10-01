/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */

import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useForm, FormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import { fromJS } from "immutable";

import { useI18n } from "../i18n";

import CancelPrompt from "./components/cancel-prompt";
import FormSection from "./components/form-section";
import { whichFormMode } from "./utils/which-mode";
import { submitHandler } from "./utils/form-submission";

const Component = ({
  formSections,
  onSubmit,
  validations,
  mode,
  initialValues,
  formRef,
  useCancelPrompt,
  formErrors,
  submitAllFields,
  onValid,
  useFormMode,
  renderBottom
}) => {
  const i18n = useI18n();
  const dispatch = useDispatch();
  const formMethods = useForm({
    mode: useFormMode || "onSubmit",
    ...(initialValues && { defaultValues: initialValues }),
    ...(validations && { validationSchema: validations })
  });

  const formMode = whichFormMode(mode);

  useImperativeHandle(
    formRef,
    submitHandler({
      dispatch,
      formMethods,
      formMode,
      i18n,
      initialValues,
      onSubmit,
      submitAllFields
    })
  );

  useEffect(() => {
    const { isValid } = formMethods.formState;

    if (onValid) {
      onValid(isValid);
    }
  }, [formMethods.formState.isValid]);

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    formErrors?.forEach(error => {
      formMethods.setError(error.get("detail"), "", i18n.t(error.getIn(["message", 0])));
    });
  }, [formErrors]);

  useEffect(() => {
    formMethods.reset(initialValues);
  }, [initialValues]);

  const renderFormSections = () =>
    formSections.map(formSection => <FormSection formSection={formSection} key={formSection.unique_id} />);

  return (
    <FormContext {...formMethods} formMode={formMode}>
      <CancelPrompt useCancelPrompt={useCancelPrompt} />
      <form noValidate>{renderFormSections(formSections)}</form>
      {renderBottom && renderBottom()}
    </FormContext>
  );
};

Component.displayName = "Form";

Component.defaultProps = {
  formErrors: fromJS([]),
  mode: "new",
  onValid: null,
  submitAllFields: false
};

Component.propTypes = {
  formErrors: PropTypes.object,
  formRef: PropTypes.object.isRequired,
  formSections: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
  mode: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onValid: PropTypes.func,
  renderBottom: PropTypes.func,
  submitAllFields: PropTypes.bool,
  useCancelPrompt: PropTypes.bool,
  useFormMode: PropTypes.oneOf(["onSubmit", "onBlur"]),
  validations: PropTypes.object
};

export default forwardRef((props, ref) => <Component {...props} formRef={ref} />);
