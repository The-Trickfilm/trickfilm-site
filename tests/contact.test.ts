import { test } from "node:test";
import assert from "node:assert/strict";
import { handleContact } from "../src/lib/contact.ts";
let index = 0;
function request(
  values: Record<string, string> = {},
  origin = "https://trickfilm.com",
) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    name: "Test Visitor",
    email: "visitor@example.com",
    company: "Example",
    message: "A new website project enquiry.",
    ...values,
  }))
    form.set(key, value);
  return new Request("https://trickfilm.com/api/contact", {
    method: "POST",
    headers: {
      Origin: origin,
      Accept: "application/json",
      "x-forwarded-for": `test-${index++}`,
    },
    body: form,
  });
}
test("rejects invalid and cross-origin submissions before delivery", async () => {
  let sent = false;
  const transport: typeof fetch = async () => {
    sent = true;
    return Response.json({ success: true });
  };
  for (const values of [
    { email: "invalid" },
    { message: "short" },
    { website: "spam" },
    { name: "a".repeat(101) },
  ] as Record<string, string>[])
    assert.equal((await handleContact(request(values), transport)).status, 400);
  assert.equal(
    (await handleContact(request({}, "https://other.example"), transport))
      .status,
    403,
  );
  assert.equal(sent, false);
});
test("delivery succeeds only after provider acceptance; failure is not reported as sent", async () => {
  const previousToken = process.env.MAILTRAP_API_TOKEN,
    previousSender = process.env.MAILTRAP_FROM_EMAIL;
  try {
    delete process.env.MAILTRAP_API_TOKEN;
    delete process.env.MAILTRAP_FROM_EMAIL;
    assert.equal((await handleContact(request())).status, 503);
    process.env.MAILTRAP_API_TOKEN = "unit-test-token";
    process.env.MAILTRAP_FROM_EMAIL = "website@trickfilm.com";
    const transport: typeof fetch = async (url, init) => {
      assert.equal(url, "https://send.api.mailtrap.io/api/send");
      const payload = JSON.parse(String(init?.body));
      assert.equal(payload.to[0].email, "jeremy@trickfilm.com");
      assert.equal(payload.reply_to.email, "visitor@example.com");
      assert.match(payload.text, /new website project/);
      return Response.json({ success: true });
    };
    assert.equal((await handleContact(request(), transport)).status, 200);
    assert.equal(
      (
        await handleContact(
          request(),
          async () => new Response("", { status: 500 }),
        )
      ).status,
      502,
    );
    assert.equal(
      (
        await handleContact(request(), async () => {
          throw new Error("Network failure");
        })
      ).status,
      502,
    );
  } finally {
    if (previousToken === undefined) delete process.env.MAILTRAP_API_TOKEN;
    else process.env.MAILTRAP_API_TOKEN = previousToken;
    if (previousSender === undefined) delete process.env.MAILTRAP_FROM_EMAIL;
    else process.env.MAILTRAP_FROM_EMAIL = previousSender;
  }
});
test("oversized submissions and repeated attempts are bounded", async () => {
  const large = new Request("https://trickfilm.com/api/contact", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "message=" + "a".repeat(25000),
  });
  assert.equal((await handleContact(large)).status, 413);
  const make = () => {
    const r = request();
    r.headers.set("x-forwarded-for", "rate-limit-test");
    return r;
  };
  for (let i = 0; i < 5; i++)
    assert.notEqual((await handleContact(make())).status, 429);
  assert.equal((await handleContact(make())).status, 429);
});
