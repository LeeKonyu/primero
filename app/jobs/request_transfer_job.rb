# frozen_string_literal: true

# Job to send out email for transfer requests
class RequestTransferJob < ApplicationJob
  queue_as :mailer

  def perform(transfer_request_id)
    transfer_request_notification = TransitionNotificationService.new(transfer_request_id)
    RecordActionMailer.transfer_request(transfer_request_notification).deliver_now
    RecordActionWebpushNotifier.transfer_request(transfer_request_notification)
  end
end
