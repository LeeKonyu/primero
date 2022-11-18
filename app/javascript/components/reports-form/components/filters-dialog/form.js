import { fromJS } from "immutable";

import {
  FormSectionRecord,
  FieldRecord,
  SELECT_FIELD,
  TEXT_FIELD,
  TICK_FIELD,
  RADIO_FIELD,
  DATE_FIELD,
  NUMERIC_FIELD,
  OPTION_TYPES,
  TEXT_AREA
} from "../../../form";
import { CONSTRAINTS } from "../../constants";

import { ATTRIBUTE, CONSTRAINT, VALUE } from "./constants";

export const valueFieldType = (currentField, isConstraintNotNull, css, i18n, allowedNotNullConstraint = true) => {
  const commonProps = {
    type: TEXT_FIELD,
    inputClassname: isConstraintNotNull ? css.hideValue : ""
  };

  if (typeof currentField === "undefined") {
    return commonProps;
  }

  switch (currentField.type) {
    case RADIO_FIELD:
    case SELECT_FIELD: {
      if (currentField.option_strings_source) {
        return {
          ...commonProps,
          type: SELECT_FIELD,
          multi_select: true,
          option_strings_source: currentField.option_strings_source,
          option_strings_source_id_key: currentField.option_strings_source === OPTION_TYPES.AGENCY ? "unique_id" : "id"
        };
      }

      return {
        ...commonProps,
        type: SELECT_FIELD,
        multi_select: true,
        option_strings_text: currentField.option_strings_text.map(option => ({
          id: option.id,
          display_text: option.display_text[i18n.locale]
        }))
      };
    }
    case TICK_FIELD: {
      const options = [
        {
          id: true,
          display_text: currentField.tick_box_label || i18n.t("true")
        }
      ];

      if (allowedNotNullConstraint) {
        options.push({
          id: false,
          display_text: i18n.t("report.not_selected")
        });
      }

      return {
        ...commonProps,
        type: SELECT_FIELD,
        multi_select: true,
        option_strings_text: options
      };
    }
    case DATE_FIELD:
      return {
        ...commonProps,
        type: DATE_FIELD,
        selected_value: null
      };
    case NUMERIC_FIELD:
      return {
        ...commonProps,
        numeric: true
      };
    default:
      return commonProps;
  }
};

export const constraintInputType = (
  currentField,
  constraints,
  i18n,
  textFieldOnlyNotBlank = false,
  allowedNotNullConstraint
) => {
  const allowedTickboxConstraint = [SELECT_FIELD, RADIO_FIELD];

  if (allowedNotNullConstraint === false && allowedTickboxConstraint.includes(currentField?.type)) {
    return { visible: false };
  }

  if (allowedTickboxConstraint.includes(currentField?.type)) {
    return {
      display_name: i18n.t("report.filters.not_null"),
      type: TICK_FIELD
    };
  }

  if (currentField?.type === TICK_FIELD) {
    return { visible: false };
  }

  if (textFieldOnlyNotBlank && [TEXT_FIELD, TEXT_AREA].includes(currentField?.type)) {
    return {
      display_name: i18n.t("report.constraint"),
      type: SELECT_FIELD,
      option_strings_text: [
        {
          id: "not_null",
          display_text: i18n.t(constraints.default.not_null)
        }
      ]
    };
  }

  return {
    display_name: i18n.t("report.constraint"),
    type: SELECT_FIELD,
    option_strings_text: Object.entries(constraints.default).map(value => {
      // eslint-disable-next-line camelcase
      const [id, translationKey] = value;

      return {
        id,
        display_text: i18n.t(
          currentField?.type === DATE_FIELD && Object.keys(constraints.date).includes(id)
            ? constraints.date[id]
            : translationKey
        )
      };
    })
  };
};

export default (i18n, fields, currentField, isConstraintNotNull, css) => {
  return fromJS([
    FormSectionRecord({
      unique_id: "reportFilter",
      fields: [
        FieldRecord({
          display_name: i18n.t("report.attribute"),
          name: ATTRIBUTE,
          type: SELECT_FIELD,
          groupBy: "formSection",
          option_strings_text: fields
        }),
        FieldRecord({
          name: CONSTRAINT,
          ...constraintInputType(currentField, CONSTRAINTS, i18n)
        }),
        FieldRecord({
          display_name: i18n.t("report.value"),
          name: VALUE,
          ...valueFieldType(currentField, isConstraintNotNull, css, i18n)
        })
      ]
    })
  ]);
};
