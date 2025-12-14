import { getStore } from "@netlify/blobs";

type LogData = Record<string, unknown> & { date?: unknown };

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const getStoreName = () => {
  const context = (globalThis as any)?.Netlify?.env?.get?.("CONTEXT") ?? "unknown";
  return context === "production" ? "daily-logs" : `daily-logs-${String(context)}`.slice(0, 64);
};

const getStorage = () => {
  try {
    const store = getStore(getStoreName(), { consistency: "strong" });
    return {
      async get(key: string) {
        return (await store.get(key, { type: "json" })) as unknown | null;
      },
      async set(key: string, value: unknown) {
        await store.setJSON(key, value);
      },
    };
  } catch {
    const g = globalThis as any;
    g.__dailyLogsMemoryStore ??= new Map<string, unknown>();
    const mem: Map<string, unknown> = g.__dailyLogsMemoryStore;
    return {
      async get(key: string) {
        return mem.get(key) ?? null;
      },
      async set(key: string, value: unknown) {
        mem.set(key, value);
      },
    };
  }
};

export default async (req: Request) => {
  const url = new URL(req.url);
  const basePath = "/api/logs";

  if (!url.pathname.startsWith(basePath)) {
    return json({ message: "Not found" }, { status: 404 });
  }

  const storage = getStorage();

  if (req.method === "GET") {
    const maybeDate = url.pathname.slice(basePath.length).replace(/^\//, "");
    if (!maybeDate) {
      return json({ message: "Date is required" }, { status: 400 });
    }

    if (!isIsoDate(maybeDate)) {
      return json({ message: "Invalid date format (expected YYYY-MM-DD)" }, { status: 400 });
    }

    const data = await storage.get(`logs/${maybeDate}`);
    if (data == null) {
      return json({ message: "Log not found" }, { status: 404 });
    }

    return json(data, { status: 200 });
  }

  if (req.method === "POST") {
    let payload: LogData;
    try {
      payload = (await req.json()) as LogData;
    } catch {
      return json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const date = typeof payload.date === "string" ? payload.date : "";
    if (!date) {
      return json({ message: "Date is required" }, { status: 400 });
    }
    if (!isIsoDate(date)) {
      return json({ message: "Invalid date format (expected YYYY-MM-DD)" }, { status: 400 });
    }

    await storage.set(`logs/${date}`, payload);
    return json({ message: "Log saved successfully" }, { status: 200 });
  }

  return json({ message: "Method Not Allowed" }, { status: 405 });
};

export const config = {
  path: ["/api/logs", "/api/logs/*"],
};
