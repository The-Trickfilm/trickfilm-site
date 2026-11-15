// Server-only delivery configuration is read inside the request handler.
const RECIPIENT = "jeremy@trickfilm.com";
const attempts = new Map<string, { count: number; expires: number }>();
const errorMessage =
  "Your message couldn’t be sent. Please email jeremy@trickfilm.com.";

function reply(request: Request, status: number, message: string) {
  if (request.headers.get("accept")?.includes("application/json")) {
    return Response.json(
      { message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
  // Messages are fixed application strings, never user input.
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trickfilm — Contact</title><body style="font:20px/1.5 system-ui;max-width:640px;margin:15vh auto;padding:24px;color:#252525"><h1>Trickfilm</h1><p>${message}</p><p><a href="/#contact">Back to the website</a> · <a href="mailto:${RECIPIENT}">Email Jeremy</a></p></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function handleContact(
  request: Request,
  send: typeof fetch = fetch,
) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return reply(request, 403, errorMessage);
  if (Number(request.headers.get("content-length")) > 24000)
    return reply(
      request,
      413,
      "Please keep your message under 5,000 characters.",
    );
  let form: FormData;
  try {
    // Bound the body before parsing, including chunked requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader)
      return reply(request, 400, "Please check your form and try again.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 24000) {
        await reader.cancel();
        return reply(
          request,
          413,
          "Please keep your message under 5,000 characters.",
        );
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    form = await new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": request.headers.get("content-type") || "" },
      body: bytes,
    }).formData();
  } catch {
    return reply(request, 400, "Please check your form and try again.");
  }
  const field = (key: string) =>
    typeof form.get(key) === "string" ? String(form.get(key)).trim() : "";
  if (field("website"))
    return reply(request, 400, "Please check your form and try again.");
  const name = field("name"),
    email = field("email"),
    company = field("company"),
    message = field("message");
  if (
    !name ||
    name.length > 100 ||
    /[\r\n]/.test(name) ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    company.length > 120 ||
    message.length < 10 ||
    message.length > 5000
  ) {
    return reply(
      request,
      400,
      "Please enter your name, a valid email, and a message between 10 and 5,000 characters.",
    );
  }
  // Best-effort per-instance throttling; Vercel WAF can provide a shared production limit.
  const now = Date.now();
  for (const [key, bucket] of attempts)
    if (bucket.expires < now) attempts.delete(key);
  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const bucket = attempts.get(key);
  if (bucket && bucket.count >= 5)
    return reply(
      request,
      429,
      "Please wait a few minutes before trying again, or email Jeremy directly.",
    );
  if (attempts.size >= 1000) attempts.delete(attempts.keys().next().value!);
  attempts.set(key, {
    count: (bucket?.count || 0) + 1,
    expires: bucket?.expires || now + 600000,
  });
  const token = process.env.MAILTRAP_API_TOKEN,
    sender = process.env.MAILTRAP_FROM_EMAIL;
  if (!token || !sender) return reply(request, 503, errorMessage);
  try {
    const response = await send("https://send.api.mailtrap.io/api/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: sender, name: "Trickfilm website" },
        to: [{ email: RECIPIENT }],
        reply_to: { email, name },
        subject: "New Trickfilm project enquiry",
        text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || "Not provided"}\n\n${message}`,
        category: "Website enquiry",
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return reply(request, 502, errorMessage);
    const accepted = await response.json();
    if (accepted.success !== true) return reply(request, 502, errorMessage);
    return reply(
      request,
      200,
      "Thanks — your message has been sent. We’ll be in touch.",
    );
  } catch {
    return reply(request, 502, errorMessage);
  }
}
