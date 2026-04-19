// Sage Intacct XML gateway client.
// Docs: https://developer.intacct.com/api/
//
// Auth model: every request wraps a <control> block (sender credentials) and
// an <operation> block (per-company user credentials). We reuse a session id
// returned by getAPISession so subsequent calls don't re-auth each time.

import { XMLParser, XMLBuilder } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  format: false,
  suppressEmptyNode: false,
  cdataPropName: "__cdata",
});

class IntacctError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = "IntacctError";
    this.errors = errors;
  }
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function controlBlock() {
  return {
    senderid: requireEnv("INTACCT_SENDER_ID"),
    password: requireEnv("INTACCT_SENDER_PASSWORD"),
    controlid: `rom-${Date.now()}`,
    uniqueid: "false",
    dtdversion: "3.0",
    includewhitespace: "false",
  };
}

function loginAuth() {
  const auth = {
    login: {
      userid: requireEnv("INTACCT_USER_ID"),
      companyid: requireEnv("INTACCT_COMPANY_ID"),
      password: requireEnv("INTACCT_USER_PASSWORD"),
    },
  };
  if (process.env.INTACCT_ENTITY_ID) {
    auth.login.locationid = process.env.INTACCT_ENTITY_ID;
  }
  return auth;
}

function sessionAuth(sessionId) {
  return { sessionid: sessionId };
}

async function postXml(body) {
  const endpoint =
    process.env.INTACCT_ENDPOINT || "https://api.intacct.com/ia/xml/xmlgw.phtml";
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    builder.build({ request: body });
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body: xml,
  });
  if (!res.ok) {
    throw new IntacctError(
      `Intacct HTTP ${res.status}: ${await res.text()}`,
      [],
    );
  }
  const parsed = parser.parse(await res.text());
  const response = parsed.response;
  if (!response) throw new IntacctError("Malformed Intacct response", []);

  const ctrlStatus = response?.control?.status;
  if (ctrlStatus && ctrlStatus !== "success") {
    throw new IntacctError(
      "Intacct control-level failure",
      response?.errormessage?.error ?? [],
    );
  }
  const ops = toArray(response.operation);
  for (const op of ops) {
    if (op?.authentication?.status === "failure") {
      throw new IntacctError(
        "Intacct authentication failed",
        op.errormessage?.error ?? [],
      );
    }
    const results = toArray(op?.result);
    for (const r of results) {
      if (r.status !== "success") {
        throw new IntacctError(
          `Intacct function '${r.function}' failed`,
          r.errormessage?.error ?? [],
        );
      }
    }
  }
  return ops;
}

function toArray(x) {
  if (x === undefined || x === null) return [];
  return Array.isArray(x) ? x : [x];
}

let cachedSession = null;

async function getSession() {
  if (cachedSession) return cachedSession;
  const ops = await postXml({
    control: controlBlock(),
    operation: {
      authentication: loginAuth(),
      content: {
        function: {
          "@_controlid": "getSession",
          getAPISession: {},
        },
      },
    },
  });
  const api = ops[0]?.result?.data?.api;
  if (!api?.sessionid) {
    throw new IntacctError("getAPISession returned no sessionid", []);
  }
  cachedSession = api.sessionid;
  return cachedSession;
}

async function callFunction(fn) {
  const sessionid = await getSession();
  const ops = await postXml({
    control: controlBlock(),
    operation: {
      authentication: sessionAuth(sessionid),
      content: { function: fn },
    },
  });
  return ops[0]?.result;
}

// Public API --------------------------------------------------------------

export async function readByQuery({ object, fields = "*", query, pageSize = 100 }) {
  const result = await callFunction({
    "@_controlid": `rbq-${object}`,
    readByQuery: {
      object,
      fields,
      query: query ?? "",
      pagesize: String(pageSize),
    },
  });
  return {
    totalCount: Number(result?.data?.["@_totalcount"] ?? 0),
    numRemaining: Number(result?.data?.["@_numremaining"] ?? 0),
    resultId: result?.data?.["@_resultId"] ?? null,
    records: toArray(result?.data?.[object]),
  };
}

export async function readMore(resultId) {
  const result = await callFunction({
    "@_controlid": `rmore-${resultId}`,
    readMore: { resultId },
  });
  const objectKey = Object.keys(result?.data ?? {}).find(
    (k) => !k.startsWith("@_"),
  );
  return {
    numRemaining: Number(result?.data?.["@_numremaining"] ?? 0),
    resultId,
    records: objectKey ? toArray(result.data[objectKey]) : [],
  };
}

export async function readByName({ object, keys, fields = "*" }) {
  const result = await callFunction({
    "@_controlid": `rbn-${object}`,
    read: {
      object,
      keys: Array.isArray(keys) ? keys.join(",") : keys,
      fields,
      docparid: "",
      returnFormat: "xml",
    },
  });
  return toArray(result?.data?.[object]);
}

export async function inspectObject(object) {
  const result = await callFunction({
    "@_controlid": `inspect-${object}`,
    lookup: { object },
  });
  return result?.data;
}

export function _resetSessionForTests() {
  cachedSession = null;
}
