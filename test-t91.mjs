import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "t91gtjin",
  dataset: "development",
  useCdn: false,
  apiVersion: "2024-01-01"
});

async function run() {
  const doc = await client.fetch("*[_id == \"about\"][0]");
  console.log(JSON.stringify(doc?.hero?.title, null, 2));
}

run();
