import { Form } from "formik";
import { useEffect } from "react";
import NavigationPrompt from "react-router-navigation-prompt";
import PropTypes from "prop-types";

import ActionDialog from "../../action-dialog";
import { useI18n } from "../../i18n";

import { ValidationErrors } from "./components";

const FormikForm = ({
  handleSubmit,
  submitForm,
  errors,
  isSubmitting,
  setValues,
  setFieldValue,
  values,
  touched,
  resetForm,
  dirty,
  bindResetForm,
  bindSetValues,
  bindSubmitForm,
  setFormTouched,
  setFormIsSubmitting,
  setFormikValues,
  mode,
  forms,
  renderFormSections,
  handleConfirm
}) => {
  const i18n = useI18n();

  useEffect(() => {
    bindSubmitForm(submitForm);
    bindSetValues(setValues);
    bindResetForm(resetForm);

    setFormikValues(values);
    setFormTouched(touched);
    setFormIsSubmitting(isSubmitting);
  }, []);

  return (
    <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
      <NavigationPrompt when={dirty && !isSubmitting && !mode.isShow}>
        {({ onConfirm, onCancel }) => (
          <ActionDialog
            open
            successHandler={() => handleConfirm(onConfirm)}
            cancelHandler={onCancel}
            dialogTitle={i18n.t("record_panel.record_information")}
            dialogText={i18n.t("messages.confirmation_message")}
            confirmButtonLabel={i18n.t("buttons.ok")}
          />
        )}
      </NavigationPrompt>
      <ValidationErrors formErrors={errors} forms={forms} />
      {renderFormSections(forms, setFieldValue, handleSubmit, values)}
    </Form>
  );
};

FormikForm.displayName = "Form";

FormikForm.propTypes = {
  bindResetForm: PropTypes.func,
  bindSetValues: PropTypes.func,
  bindSubmitForm: PropTypes.func,
  dirty: PropTypes.bool,
  errors: PropTypes.object,
  forms: PropTypes.object,
  handleConfirm: PropTypes.func,
  handleSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
  mode: PropTypes.object,
  renderFormSections: PropTypes.func,
  resetForm: PropTypes.func,
  setFieldValue: PropTypes.func,
  setFormikValues: PropTypes.func,
  setFormIsSubmitting: PropTypes.func,
  setFormTouched: PropTypes.func,
  setValues: PropTypes.func,
  submitForm: PropTypes.func,
  touched: PropTypes.object,
  values: PropTypes.object
};

export default FormikForm;