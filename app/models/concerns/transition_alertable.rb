# frozen_string_literal: true

# Copyright (c) 2014 - 2023 UNICEF. All rights reserved.

# Alerts support for Transitions
module TransitionAlertable
  extend ActiveSupport::Concern

  included do
    after_create :add_alert_on_record
    after_update :remove_alert_on_record
  end

  def alert_form_unique_id
    raise NotImplementedError
  end

  def was_resolved?
    saved_changes['status'].present? && [
      Transition::STATUS_ACCEPTED, Transition::STATUS_REJECTED, Transition::STATUS_DONE, Transition::STATUS_REVOKED
    ].include?(saved_changes['status'].last)
  end

  def remove_alert_on_record
    return unless remove_alert?

    record.remove_alert(self.class.alert_type)
  end

  def add_alert_on_record
    return unless generate_alert?

    record.add_transition_alert(transitioned_to_user, self.class)
  end

  def remove_alert?
    record.present? && was_resolved? && !remote
  end

  def generate_alert?
    record.present? && in_progress? && !remote
  end

  # Class methods to indicate specific configuration for Transition Alerts
  module ClassMethods
    def alert_form_unique_id
      raise NotImplementedError
    end

    def alert_type
      name.downcase
    end
  end
end
