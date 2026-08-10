export interface BookingEngineTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope: string;
}
