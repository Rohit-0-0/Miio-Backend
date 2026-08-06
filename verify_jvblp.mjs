import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "jvblp287",
  dataset: "development",
  useCdn: false,
  apiVersion: "2024-01-01"
});

async function run() {
  console.log("1. Direct Sanity Query - _id == \"about\"");
  const doc = await client.fetch("*[_id == \"about\"][0]");
  console.log(JSON.stringify(doc, null, 2));

  console.log("\n2. Direct Sanity Query - all abouts");
  const all = await client.fetch("*[_type == \"about\"]{_id, _updatedAt, hero}");
  console.log(JSON.stringify(all, null, 2));

  console.log("\n3. Drafts");
  const drafts = await client.fetch("*[_id match \"drafts.*\"]{_id, _type}");
  console.log(JSON.stringify(drafts, null, 2));
}

run();
