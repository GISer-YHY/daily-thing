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

type MysqlPool = {
  query: (sql: string, params?: any[]) => Promise<[any[], any]>;
};

const getEnv = (name: string) =>
  process.env[name] ?? (globalThis as any)?.Netlify?.env?.get?.(name) ?? undefined;

const getMysqlConfig = () => {
  const host = getEnv("DB_HOST") ?? getEnv("MYSQL_HOST") ?? "8.148.218.240";
  const portRaw = getEnv("DB_PORT") ?? getEnv("MYSQL_PORT") ?? "3306";
  const user = getEnv("DB_USER") ?? getEnv("MYSQL_USER") ?? "";
  const password = getEnv("DB_PASSWORD") ?? getEnv("MYSQL_PASSWORD") ?? "";
  const database = getEnv("DB_NAME") ?? getEnv("MYSQL_DATABASE") ?? "userdb";
  const port = Number(portRaw);

  if (!user || !password) return null;
  if (!Number.isFinite(port) || port <= 0) return null;
  return { host, port, user, password, database };
};

const getPool = async (): Promise<MysqlPool | null> => {
  const g = globalThis as any;
  if (g.__dailyLogsMysqlPool) return g.__dailyLogsMysqlPool as MysqlPool;

  const config = getMysqlConfig();
  if (!config) return null;

  const mysql = (await import("mysql2/promise")) as any;
  g.__dailyLogsMysqlPool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return g.__dailyLogsMysqlPool as MysqlPool;
};

export default async (req: Request) => {
  const url = new URL(req.url);
  const basePath = "/api/logs";

  if (!url.pathname.startsWith(basePath)) {
    return json({ message: "Not found" }, { status: 404 });
  }

  const pool = await getPool();
  if (!pool) {
    return json(
      { message: "MySQL is not configured. Set DB_USER and DB_PASSWORD (and optionally DB_HOST/DB_NAME/DB_PORT)." },
      { status: 500 },
    );
  }

  if (req.method === "GET") {
    const maybeDate = url.pathname.slice(basePath.length).replace(/^\//, "");
    if (!maybeDate) {
      return json({ message: "Date is required" }, { status: 400 });
    }

    if (!isIsoDate(maybeDate)) {
      return json({ message: "Invalid date format (expected YYYY-MM-DD)" }, { status: 400 });
    }

    const [rows] = await pool.query("SELECT content FROM daily_logs WHERE date = ?", [maybeDate]);
    if (!rows?.length) {
      return json({ message: "Log not found" }, { status: 404 });
    }

    const raw = rows[0]?.content;
    if (raw == null) return json({ message: "Log not found" }, { status: 404 });

    if (typeof raw === "string") {
      try {
        return json(JSON.parse(raw), { status: 200 });
      } catch {
        return json(raw, { status: 200 });
      }
    }

    return json(raw, { status: 200 });
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

    await pool.query(
      `
      INSERT INTO daily_logs (date, content)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE content = VALUES(content)
    `.trim(),
      [date, JSON.stringify(payload)],
    );
    return json({ message: "Log saved successfully" }, { status: 200 });
  }

  return json({ message: "Method Not Allowed" }, { status: 405 });
};

export const config = {
  path: ["/api/logs", "/api/logs/*"],
};
