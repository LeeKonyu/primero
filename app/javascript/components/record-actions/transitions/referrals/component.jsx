import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { fromJS } from "immutable";
import omit from "lodash/omit";

import Form from "../../../form";
import { useI18n } from "../../../i18n";
import { RECORD_TYPES } from "../../../../config";
import { getRecordForms } from "../../../record-form/selectors";
import { saveReferral } from "../action-creators";
import { getErrorsByTransitionType } from "../selectors";
import { setServiceToRefer } from "../../../record-form/action-creators";
import { getServiceToRefer } from "../../../record-form";
import PdfExporter from "../../../pdf-exporter";
import { getRoleFormSections } from "../../../application/selectors";

import { mapServiceFields } from "./utils";
import {
  REFERRAL_FIELD,
  TRANSITION_TYPE,
  SERVICE_EXTERNAL_REFERRAL,
  FIELDS,
  CUSTOM_EXPORT_FILE_NAME_FIELD,
  OMITTED_SUBMISSION_FIELDS
} from "./constants";
import { form, validations } from "./form";

const Referrals = ({
  referralRef,
  providedConsent,
  canConsentOverride,
  record,
  recordType,
  setDisabled,
  setPending,
  handleClose
}) => {
  const i18n = useI18n();
  const pdfExporterRef = useRef();
  const dispatch = useDispatch();

  const serviceToRefer = useSelector(state => getServiceToRefer(state));
  const formErrors = useSelector(state => getErrorsByTransitionType(state, TRANSITION_TYPE));
  const recordTypesForms = useSelector(state =>
    getRecordForms(state, {
      recordType: RECORD_TYPES[recordType],
      primeroModule: record?.get("module_id")
    })
  );

  const isExternalReferralFromService = serviceToRefer.get(SERVICE_EXTERNAL_REFERRAL, false);
  const isReferralFromService = !serviceToRefer.isEmpty();
  const referralFromService = mapServiceFields(serviceToRefer, isExternalReferralFromService);

  const forms = form({
    i18n,
    canConsentOverride,
    providedConsent,
    recordType,
    isReferralFromService,
    isExternalReferralFromService
  });

  const handleSubmit = values => {
    const recordID = record.get("id");

    dispatch(
      saveReferral(
        recordID,
        recordType,
        {
          data: {
            ...omit(values, OMITTED_SUBMISSION_FIELDS),
            consent_overridden: canConsentOverride || values[REFERRAL_FIELD]
          }
        },
        i18n.t("referral.success", { record_type: recordType, id: recordID })
      )
    );

    if (values.remote) {
      pdfExporterRef.current.savePdf({ setPending, close: handleClose, values });
    }
  };

  useEffect(() => {
    setDisabled(true);

    return () => dispatch(setServiceToRefer(fromJS({})));
  }, []);

  return (
    <>
      <Form
        submitAllFields
        formSections={forms}
        onSubmit={handleSubmit}
        ref={referralRef}
        validations={validations}
        formErrors={formErrors}
        initialValues={{
          [FIELDS.CONSENT_INDIVIDUAL_TRANSFER]: providedConsent,
          ...referralFromService
        }}
        // renderBottom={renderPdfExporter({ record, recordTypesForms, pdfExporterRef })}
        renderBottom={() => (
          <PdfExporter
            record={record}
            forms={recordTypesForms}
            ref={pdfExporterRef}
            formsSelectedFieldDefault=""
            formsSelectedField={FIELDS.ROLE}
            formsSelectedSelector={getRoleFormSections}
            customFilenameField={CUSTOM_EXPORT_FILE_NAME_FIELD}
          />
        )}
      />
    </>
  );
};

Referrals.displayName = "Referrals";

Referrals.propTypes = {
  canConsentOverride: PropTypes.bool,
  providedConsent: PropTypes.bool,
  record: PropTypes.object,
  recordType: PropTypes.string.isRequired,
  referralRef: PropTypes.object,
  setDisabled: PropTypes.func.isRequired,
  setPending: PropTypes.func.isRequired
};

export default Referrals;
