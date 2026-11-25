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
    return Response.json({ id: "test-message-id" });
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
  const previousToken = process.env.RESEND_API_KEY,
    previousSender = process.env.RESEND_FROM_EMAIL;
  try {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    assert.equal((await handleContact(request())).status, 503);
    process.env.RESEND_API_KEY = "unit-test-token";
    assert.equal((await handleContact(request())).status, 503);
    process.env.RESEND_FROM_EMAIL = "website@trickfilm.com";
    const transport: typeof fetch = async (url, init) => {
      assert.equal(url, "https://api.resend.com/emails");
      const payload = JSON.parse(String(init?.body));
      assert.equal(init?.method, "POST");
      assert.equal(
        new Headers(init?.headers).get("Authorization"),
        "Bearer unit-test-token",
      );
      assert.equal(payload.from, "Trickfilm website <website@trickfilm.com>");
      assert.deepEqual(payload.to, ["jeremy@trickfilm.com"]);
      assert.equal(payload.reply_to, "visitor@example.com");
      assert.match(payload.text, /new website project/);
      return Response.json({ id: "test-message-id" });
    };
    assert.equal((await handleContact(request(), transport)).status, 200);
    const nativeRequest = request();
    nativeRequest.headers.set("Accept", "text/html");
    const nativeResponse = await handleContact(nativeRequest, transport);
    assert.equal(nativeResponse.status, 200);
    assert.match(
      nativeResponse.headers.get("Content-Type") || "",
      /text\/html/,
    );
    assert.match(await nativeResponse.text(), /your message has been sent/);
    for (const body of [
      {},
      { id: "" },
      { id: 123 },
      null,
      { name: "validation_error", message: "Invalid sender" },
    ]) {
      assert.equal(
        (await handleContact(request(), async () => Response.json(body)))
          .status,
        502,
      );
    }
    assert.equal(
      (
        await handleContact(
          request(),
          async () => new Response("not json", { status: 200 }),
        )
      ).status,
      502,
    );
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
    if (previousToken === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousToken;
    if (previousSender === undefined) delete process.env.RESEND_FROM_EMAIL;
    else process.env.RESEND_FROM_EMAIL = previousSender;
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
