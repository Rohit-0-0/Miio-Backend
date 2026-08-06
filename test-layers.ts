import { sanityClient } from "./src/integrations/sanity/client/sanity.client";
import { SanityEditorialRepository } from "./src/integrations/sanity/repositories/sanity-editorial.repository";
import { EditorialService } from "./src/integrations/sanity/services/editorial.service";
import { EditorialMapper } from "./src/modules/editorial/editorial.mapper";
import { aboutQuery } from "./src/integrations/sanity/queries/about.query";

async function run() {
  console.log("Query used:", aboutQuery);

  const raw = await sanityClient.fetch(`*[_id == "about"][0]`);
  console.log("\n--- Raw Fetch ---\n", raw?.hero?.title);

  const repo = new SanityEditorialRepository();
  const repoRes = await repo.getAbout();
  console.log("\n--- Repository ---\n", repoRes?.hero?.title);

  const service = new EditorialService();
  const serviceRes = await service.getAbout();
  console.log("\n--- Service ---\n", serviceRes?.hero?.title);

  const controllerRes = EditorialMapper.toAboutDto(serviceRes);
  console.log("\n--- Controller (Mapped DTO) ---\n", controllerRes?.hero?.title);

  const apiRes = await fetch("http://localhost:8000/api/v1/editorial/about").then(r => r.json());
  console.log("\n--- API HTTP Response ---\n", apiRes?.data?.hero?.title);
}

run().catch(console.error);
