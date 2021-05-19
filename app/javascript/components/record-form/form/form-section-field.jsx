import { memo } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import isEmpty from "lodash/isEmpty";

import { useI18n } from "../../i18n";
import {
  DATE_FIELD,
  SELECT_FIELD,
  TICK_FIELD,
  RADIO_FIELD,
  SEPERATOR,
  PHOTO_FIELD,
  AUDIO_FIELD,
  DOCUMENT_FIELD,
  LINK_TO_FORM
} from "../constants";
import Tooltip from "../../tooltip";
import { ConditionalWrapper, displayNameHelper, useMemoizedSelector } from "../../../libs";
import { getOptions } from "../../form/selectors";
import { OPTION_TYPES } from "../../form";
import { SERVICE_SECTION_FIELDS } from "../../record-actions/transitions/components/referrals";

import { GuidingQuestions } from "./components";
import { CUSTOM_STRINGS_SOURCE, FORM_SECTION_FIELD_NAME } from "./constants";
import DateField from "./field-types/date-field";
import SelectField from "./field-types/select-field";
import TextField from "./field-types/text-field";
import TickField from "./field-types/tick-field";
import Seperator from "./field-types/seperator";
import RadioField from "./field-types/radio-field";
import AttachmentField from "./field-types/attachments";
import LinkToForm from "./field-types/link-to-form";
import styles from "./styles.css";

const useStyles = makeStyles(styles);

const FormSectionField = ({
  name,
  field,
  mode,
  recordType,
  recordID,
  filters,
  index,
  formSection,
  isReadWriteForm
}) => {
  const css = useStyles();
  const i18n = useI18n();
  const {
    type,
    help_text: helpText,
    display_name: displayName,
    tick_box_label: tickBoxlabel,
    disabled,
    required,
    selected_value: selectedValue,
    hide_on_view_page: hideOnViewPage,
    visible,
    guiding_questions: guidingQuestions,
    link_to_form: linkToForm,
    option_strings_source: optionStringsSource,
    option_strings_text: optionsStringsText,
    options
  } = field;

  const isImplementingAgencyIndividual = name.endsWith(SERVICE_SECTION_FIELDS.implementingAgencyIndividual);

  const filterOptionStringSource = (() => {
    if (optionStringsSource === CUSTOM_STRINGS_SOURCE.user) {
      return OPTION_TYPES.REFER_TO_USERS;
    }

    return optionStringsSource;
  })();

  const optionsSelector = state =>
    getOptions(
      state,
      filterOptionStringSource,
      i18n,
      options || optionsStringsText,
      OPTION_TYPES.AGENCY === filterOptionStringSource,
      { fullUsers: true }
    );

  const agencies = useMemoizedSelector(state =>
    isImplementingAgencyIndividual ? getOptions(state, OPTION_TYPES.AGENCY, i18n, null, true) : []
  );
  const reportingLocations = useMemoizedSelector(state =>
    isImplementingAgencyIndividual ? getOptions(state, OPTION_TYPES.REPORTING_LOCATIONS, i18n, null, false) : []
  );

  const fieldProps = {
    name,
    field,
    recordType,
    recordID,
    filters,
    autoComplete: "off",
    fullWidth: true,
    InputProps: {
      readOnly: mode.isShow,
      classes: {
        root: css.input
      },
      autoComplete: "new-password",
      disableUnderline: mode.isShow
    },
    InputLabelProps: {
      htmlFor: name,
      shrink: true,
      required,
      classes: {
        root: css.inputLabel
      }
    },
    label: displayNameHelper(displayName, i18n.locale),
    tickBoxlabel: tickBoxlabel?.[i18n.locale],
    helperText: !isEmpty(helpText) ? displayNameHelper(helpText, i18n.locale) : "",
    disabled: mode.isShow || disabled || isReadWriteForm === false,
    checked: ["t", "true"].includes(selectedValue),
    ...(mode.isShow && { placeholder: "--" }),
    index,
    displayName,
    linkToForm,
    ...(type === SELECT_FIELD && { optionsSelector }),
    ...(isImplementingAgencyIndividual && { agencies, reportingLocations })
  };

  const renderGuidingQuestions = guidingQuestions && guidingQuestions[i18n.locale] && (mode.isEdit || mode.isNew) && (
    <GuidingQuestions label={i18n.t("buttons.guidance")} text={guidingQuestions[i18n.locale]} />
  );

  const FieldComponent = (t => {
    switch (t) {
      case DATE_FIELD:
        return DateField;
      case SELECT_FIELD:
        return SelectField;
      case TICK_FIELD:
        return TickField;
      case RADIO_FIELD:
        return RadioField;
      case SEPERATOR:
        return Seperator;
      case LINK_TO_FORM:
        return LinkToForm;
      case PHOTO_FIELD:
      case AUDIO_FIELD:
      case DOCUMENT_FIELD:
        return AttachmentField;
      default:
        return TextField;
    }
  })(type);

  if ((mode?.isShow && hideOnViewPage) || !visible) return false;

  return (
    <ConditionalWrapper condition={!mode.isShow && disabled} wrapper={Tooltip} title={i18n.t("messages.cannot_edit")}>
      <div>
        <FieldComponent {...fieldProps} mode={mode} formSection={formSection} />
        {renderGuidingQuestions}
      </div>
    </ConditionalWrapper>
  );
};

FormSectionField.displayName = FORM_SECTION_FIELD_NAME;

FormSectionField.propTypes = {
  field: PropTypes.object.isRequired,
  filters: PropTypes.object,
  formSection: PropTypes.object,
  index: PropTypes.number,
  isReadWriteForm: PropTypes.bool,
  mode: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  recordID: PropTypes.string,
  recordType: PropTypes.string
};

export default memo(FormSectionField);
