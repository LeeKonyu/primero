/* eslint-disable camelcase */

import React, { useRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { push } from "connected-react-router";
import { FormContext, useForm } from "react-hook-form";
import isEmpty from "lodash/isEmpty";

import { useI18n } from "../i18n";
import LoadingIndicator from "../loading-indicator";
import { FormAction, whichFormMode, submitHandler } from "../form";
import { getReport } from "../pages/report/selectors";
import { PageContainer, PageContent, PageHeading } from "../page";
import bindFormSubmit from "../../libs/submit-form";
import { RECORD_TYPES, ROUTES } from "../../config";
import FormSection from "../form/components/form-section";
import { getAgeRanges } from "../application/selectors";
import {
  getRecordForms,
  getRecordFormsByUniqueId
} from "../record-form/selectors";

import { DESCRIPTION_FIELD, NAME, NAME_FIELD } from "./constants";
import NAMESPACE from "./namespace";
import { form, validations } from "./form";
import {
  buildFields,
  dependantFields,
  formatAgeRange,
  getFormName
} from "./utils";

const Container = ({ mode }) => {
  const i18n = useI18n();
  const formRef = useRef();
  const dispatch = useDispatch();
  const formMode = whichFormMode(mode);
  const validationSchema = validations(i18n);
  const methods = useForm({ validationSchema, defaultValues: {} });
  const selectedModule = methods.watch("modules");
  const selectedRecordType = methods.watch("record_type");
  const emptyModule = isEmpty(selectedModule);
  const emptyRecordType = isEmpty(selectedRecordType);
  const isModuleTouched = Object.keys(
    methods.control.formState.touched
  ).includes("modules");
  const primeroAgeRanges = useSelector(state => getAgeRanges(state));
  const report = useSelector(state => getReport(state));

  const recordTypesForms = useSelector(state =>
    getRecordForms(state, {
      recordType: selectedRecordType,
      primeroModule: selectedModule
    })
  );

  const reportableForm = useSelector(state =>
    getRecordFormsByUniqueId(state, {
      recordType: RECORD_TYPES.cases,
      primeroModule: selectedModule,
      formName: getFormName(selectedRecordType)
    })
  )?.toJS()?.[0]?.fields?.[0]?.subform_section_id;

  useImperativeHandle(
    formRef,
    submitHandler({
      dispatch,
      formMethods: methods,
      formMode,
      i18n,
      initialValues: {},
      onSubmit: () => {}
    })
  );

  const formSections = form(
    i18n,
    emptyModule,
    emptyModule || emptyRecordType,
    formatAgeRange(primeroAgeRanges),
    buildFields(
      getFormName(selectedRecordType) ? reportableForm : recordTypesForms,
      i18n.locale,
      Boolean(getFormName(selectedRecordType))
    )
  );

  // const defaultFilters = [
  //   { "value"=> ["open"], "attribute"=> "status" },
  //   { "value"=> ["true"], "attribute"=> "record_state" }
  // ];

  if (isModuleTouched && emptyModule) {
    const name = methods.getValues()[NAME_FIELD];
    const description = methods.getValues()[DESCRIPTION_FIELD];

    methods.reset({
      ...methods.getValues(),
      ...dependantFields(formSections)
    });

    if (name) {
      methods.setValue(NAME_FIELD, name);
    }

    if (description) {
      methods.setValue(DESCRIPTION_FIELD, description);
    }
  }

  const handleCancel = () => {
    dispatch(push(ROUTES.reports));
  };

  const pageHeading = report?.size
    ? `${i18n.t("reports.label")} ${report.getIn(["name", i18n.locale])}`
    : i18n.t("reports.register_new_report");

  const saveButton = formMode.get("isNew") && (
    <>
      <FormAction
        cancel
        actionHandler={handleCancel}
        text={i18n.t("buttons.cancel")}
      />
      <FormAction
        actionHandler={() => bindFormSubmit(formRef)}
        text={i18n.t("buttons.save")}
        savingRecord={false}
      />
    </>
  );

  return (
    <LoadingIndicator
      hasData={formMode.get("isNew") || report?.size > 0}
      type={NAMESPACE}
    >
      <PageContainer>
        <PageHeading title={pageHeading}>{saveButton}</PageHeading>
        <PageContent>
          <FormContext {...methods} formMode={formMode}>
            <form>
              {formSections.map(formSection => (
                <FormSection
                  formSection={formSection}
                  key={formSection.unique_id}
                />
              ))}
            </form>
          </FormContext>
        </PageContent>
      </PageContainer>
    </LoadingIndicator>
  );
};

Container.displayName = NAME;

Container.propTypes = {
  mode: PropTypes.string
};

export default Container;
