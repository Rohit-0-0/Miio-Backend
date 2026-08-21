import { GuestyClient } from './src/integrations/guesty/client/guesty.client';
import { config } from 'dotenv';
config();
GuestyClient.get('/v1/reviews?listingId=69d546d26109a000139a739a&includeCustomChannels=false')
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error);
