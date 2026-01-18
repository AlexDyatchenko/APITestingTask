import { test, expect } from "@playwright/test";

test("/v2/locations", { tag: ["@ci", "@api"] }, async ({ request }) => {
  const url = "/v2/locations";
  const baseURL = test.info().project.use.baseURL;

  const response = await request.get(url, {
    headers: {
        'Accept': '*/*'
    },
    params: {
      locationStatuses: "Active",
      metro: "Singapore",
    },
  });
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body?.message).toContain("List all public locations");
});
