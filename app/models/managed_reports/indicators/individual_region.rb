# frozen_string_literal: true

# An indicator that returns the individual region
class ManagedReports::Indicators::IndividualRegion < ManagedReports::SqlReportIndicator
  include ManagedReports::MRMIndicatorHelper

  class << self
    def id
      'individual_region'
    end

    # rubocop:disable Metrics/MethodLength
    # rubocop:disable Metrics/CyclomaticComplexity
    # rubocop:disable Metrics/AbcSize
    def sql(current_user, params = {})
      %{
       select
       incidents.data ->> 'incident_location' as name, 'total' as key,
       #{grouped_date_query(params['grouped_by'],
                            filter_date(params),
                            table_name_for_query(params))&.concat(' as group_id,')}
       count(*) as sum
       from
       violations violations
       inner join individual_victims_violations on violations.id = individual_victims_violations.violation_id
       inner join individual_victims on individual_victims.id = individual_victims_violations.individual_victim_id
       inner join incidents on violations.incident_id = incidents.id
       #{user_scope_query(current_user, 'incidents')&.prepend('and ')}
       where #{date_range_query(params['incident_date'], 'incidents')}
       #{date_range_query(params['date_of_first_report'], 'incidents')&.prepend('and ')}
       #{date_range_query(params['ctfmr_verified_date'], 'violations')&.prepend('and ')}
       #{equal_value_query(params['ctfmr_verified'], 'violations')&.prepend('and ')}
       #{equal_value_query_multiple(params['violation_type'], 'violations', 'type')&.prepend('and ')}
       group by incidents.data ->> 'incident_location', name
       #{grouped_date_query(params['grouped_by'], filter_date(params), table_name_for_query(params))&.prepend(', ')}
       order by name
      }
    end
    # rubocop:enable Metrics/AbcSize
    # rubocop:enable Metrics/MethodLength
    # rubocop:enable Metrics/CyclomaticComplexity
  end
end