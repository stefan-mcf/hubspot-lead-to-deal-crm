import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const pipeline = await readJson(new URL("../contracts/pipeline.json", import.meta.url));
const model = await readJson(new URL("../contracts/associations.json", import.meta.url));
const dataset = await readJson(new URL("../examples/commissioning-records.json", import.meta.url));

assert.equal(pipeline.stages.length, 7, "The pipeline must contain seven stages");
assert.deepEqual(
  pipeline.stages.map((stage) => stage.order),
  [1, 2, 3, 4, 5, 6, 7],
  "Pipeline stage order must be contiguous",
);
assert.equal(new Set(pipeline.stages.map((stage) => stage.key)).size, 7);
assert.deepEqual(
  pipeline.stages.filter((stage) => stage.closed).map((stage) => stage.key),
  ["won", "lost"],
  "Only won and lost may be closed stages",
);

const expectedEdges = JSON.stringify(model.required_edges);
const objectKeys = new Set();
for (const record of dataset.records) {
  assert.equal(JSON.stringify(record.associations), expectedEdges, "Association set is incomplete");
  assert.equal(record.first_run, "created");
  assert.equal(record.second_run, model.rerun_result);
  assert(pipeline.stages.some((stage) => stage.key === record.deal.stage));
  for (const [objectType, key] of [
    ["company", "company_external_id"],
    ["contact", "contact_external_id"],
    ["deal", "sm_systems_deal_id"],
  ]) {
    const value = record[objectType][key];
    assert(!objectKeys.has(value), `Duplicate external key: ${value}`);
    objectKeys.add(value);
  }
}

console.log("HubSpot CRM contracts are valid.");

