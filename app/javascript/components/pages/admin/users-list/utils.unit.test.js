import { fromJS } from "immutable";

import { FILTER_TYPES } from "../../../index-filters";

import { DISABLED, AGENCY } from "./constants";
import * as helper from "./utils";

describe("<AuditLogs /> - Helpers", () => {
  describe("with exposed properties", () => {
    it("should have known methods", () => {
      const clone = { ...helper };

      ["getFilters", "buildUsersQuery"].forEach(property => {
        expect(clone).to.have.property(property);
        expect(clone[property]).to.be.a("function");
        delete clone[property];
      });
      expect(clone).to.be.empty;
    });
  });

  describe("buildUsersQuery", () => {
    it("should convert the data to filter users", () => {
      const data = {
        agency: { id: 1, display_name: "agency_test" }
      };

      const expected = {
        agency: 1
      };

      const converted = helper.buildUsersQuery(data);

      expect(converted).to.deep.equal(expected);
    });
  });

  describe("getFilters", () => {
    it("should return the correct object to build users filters", () => {
      const i18n = { t: value => value };
      const options = fromJS([{ id: 1, name: "Agency 1" }]);

      const expected = [
        {
          name: "cases.filter_by.enabled_disabled",
          field_name: DISABLED,
          type: FILTER_TYPES.MULTI_TOGGLE,
          option_strings_source: null,
          options: {
            [i18n.locale]: [
              { id: "false", display_name: i18n.t("disabled.status.enabled") },
              { id: "true", display_name: i18n.t("disabled.status.disabled") }
            ]
          }
        },
        {
          name: "cases.filter_by.agency",
          field_name: AGENCY,
          options: [
            {
              id: 1,
              display_name: "Agency 1"
            }
          ],
          type: FILTER_TYPES.MULTI_SELECT,
          multiple: false
        }
      ];

      expect(helper.getFilters(i18n, options)).to.deep.equal(expected);
    });
  });
});
