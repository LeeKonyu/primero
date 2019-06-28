import React, { useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Tabs, Tab } from "@material-ui/core";
import { FiltersBuilder } from "components/filters-builder";
import {
  setUpCheckBoxes,
  setupSelect,
  setupRangeButton,
  setUpChips,
  setupRadioButtons
} from "components/filters-builder/filter-controls";
import filterTypes from "./mocked-filters";
import styles from "./styles.css";
import * as actions from "./action-creators";
import * as Selectors from "./selectors";

const Filters = ({
  tabValue,
  setTabValue,
  setCheckBoxes,
  setSelect,
  setRangeButton,
  setRadioButtons,
  setChips
}) => {
  const css = makeStyles(styles)();

  useEffect(() => {
    // TODO: Make an action from this component
    filterTypes.map(filter => {
      switch (filter.type) {
        case "checkbox":
          return setCheckBoxes(filter.id);
        case "multi_select":
        case "select":
          return setSelect(filter.id);
        case "multi_toogle":
          return setRangeButton(filter.id);
        case "radio":
          return setRadioButtons(filter.id);
        case "chips":
          return setChips(filter.id);
        default:
          return null;
      }
    });
  }, []);

  return (
    <div className={css.root}>
      <AppBar position="static" color="default" classes={{ root: css.appbar }}>
        <Tabs
          value={tabValue}
          onChange={(e, value) => setTabValue(value)}
          TabIndicatorProps={{
            style: {
              backgroundColor: "transparent"
            }
          }}
          variant="fullWidth"
        >
          <Tab
            label="Filters"
            classes={{ root: css.tab, selected: css.tabselected }}
            selected
          />
          <Tab
            label="Saved Searches"
            classes={{ root: css.tab, selected: css.tabselected }}
          />
        </Tabs>
      </AppBar>
      {tabValue === 0 && <FiltersBuilder filters={filterTypes} />}
      {tabValue === 1 && <h1 style={{ textAlign: "center" }}>NYI</h1>}
    </div>
  );
};

Filters.propTypes = {
  tabValue: PropTypes.number.isRequired,
  setTabValue: PropTypes.func,
  setCheckBoxes: PropTypes.func,
  setSelect: PropTypes.func,
  setRangeButton: PropTypes.func,
  setRadioButtons: PropTypes.func,
  setChips: PropTypes.func
};

const mapStateToProps = state => ({
  tabValue: Selectors.getTab(state)
});

const mapDispatchToProps = {
  setTabValue: actions.setTab,
  setCheckBoxes: setUpCheckBoxes,
  setSelect: setupSelect,
  setRangeButton: setupRangeButton,
  setRadioButtons: setupRadioButtons,
  setChips: setUpChips
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Filters);
