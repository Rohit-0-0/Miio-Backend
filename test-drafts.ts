import { sanityClient } from "./src/integrations/sanity/client/sanity.client";
async function run() {
  const doc = await sanityClient.fetch(`*[_id == "drafts.about"][0]`);
  console.log("DRAFT TITLE:", doc?.hero?.title);
  const all = await sanityClient.fetch(`*[_type == "about"]{_id, "title": hero.title}`);
  console.log("ALL ABOUTS:", JSON.stringify(all, null, 2));
}
run();
