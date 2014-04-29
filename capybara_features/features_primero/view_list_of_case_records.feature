# JIRA PRIMERO-48
@javascript @primero
Feature: Primero View List of Case Records
  I want to be able to access the record of a registered child (or other individual) so that I can find and
  update my case records with information about my interactions with the cases in my care after registration

  Scenario: I want to see my cases and update them
    Given I am logged in as an admin with username "primero" and password "primero"
    And the following cases exist in the system:
      | name     | created_by | age | sex    | registration_date      | status | unique_identifier                    |
      | andreas  | primero    | 10  | male   | 2004-02-03 04:05:06UTC | open   | 21c4cba8-b410-4af6-b349-68c557af3aa9 |
      | zak      | primero    | 11  | female | 2004-02-03 04:05:06UTC | closed | 31c4cba8-b410-4af6-b349-68c557af3aa8 |
      | jaco     | primero    | 12  | male   | 2004-02-03 04:05:06UTC | open   | 41c4cba8-b410-4af6-b349-68c557af3aa7 |
      | meredith | primero    | 13  | female | 2004-02-03 04:05:06UTC | closed | 51c4cba8-b410-4af6-b349-68c557af3aa6 |
      | jane     | primero    | 14  | male   | 2004-02-03 04:05:06UTC | open   | 61c4cba8-b410-4af6-b349-68c557af3aa5 |
    When I press the "CASES" button
    Then I should see "Cases"
    And I should see "Displaying all 5 children"
    And I should see an id "7af3aa9" link on the page
    And I press the "7af3aa9" link
    And I should see "Cases > 7af3aa9"
    And I should see an "Edit" button on the page
    And I press the "Edit" button
    And I should see the "child_name" field
    And I should see a "Save" button on the page

  Scenario: I want to see my cases but I do not have any
    Given I am logged in as an admin with username "primero" and password "primero"
    When I press the "CASES" button
    Then I should see "Cases"
    And I should see "No entries found"