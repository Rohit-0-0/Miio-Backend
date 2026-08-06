import { sanityClient } from "./src/integrations/sanity/client/sanity.client";
async function run() {
  const raw = await sanityClient.fetch(`*[_id == "about"][0]`);
  console.log("RAW SANITY RESPONSE");
  console.log(JSON.stringify(raw, null, 2));
}
run();
