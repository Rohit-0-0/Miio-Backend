import { BookingEngineClient } from './src/integrations/booking-engine/client/booking-engine.client';
async function test() {
    try {
        const res = await BookingEngineClient.get('/api/reservations/quotes/6a7984477333658d43211c0e');
        console.log(JSON.stringify(res, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
