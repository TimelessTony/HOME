#!/usr/bin/env node
// MCP server exposing Sage Intacct + Sage Construction Management tools.
// Run via stdio (how Claude Code launches MCP servers).

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import * as intacct from "./intacct.js";
import * as scm from "./sageCm.js";

const tools = [
  // -------------- Sage Intacct --------------
  {
    name: "intacct_query",
    description:
      "Run an Intacct readByQuery. Use for listing records of any object " +
      "(PROJECT, VENDOR, GLACCOUNT, CUSTOMER, APBILL, etc.). " +
      "Query syntax is Intacct's (e.g. \"STATUS = 'active' AND WHENMODIFIED > '01/01/2025'\").",
    inputSchema: {
      type: "object",
      properties: {
        object: {
          type: "string",
          description: "Intacct object name, e.g. PROJECT, VENDOR, GLACCOUNT.",
        },
        fields: {
          type: "string",
          description:
            "Comma-separated field list, or '*' for all. Prefer a narrow list.",
          default: "*",
        },
        query: {
          type: "string",
          description: "Intacct query filter (optional).",
        },
        pageSize: { type: "integer", default: 100, minimum: 1, maximum: 1000 },
      },
      required: ["object"],
    },
    handler: (args) => intacct.readByQuery(args),
  },
  {
    name: "intacct_read_more",
    description: "Fetch the next page of an Intacct readByQuery result set.",
    inputSchema: {
      type: "object",
      properties: { resultId: { type: "string" } },
      required: ["resultId"],
    },
    handler: (args) => intacct.readMore(args.resultId),
  },
  {
    name: "intacct_read",
    description:
      "Read one or more Intacct records by key (RECORDNO or NAME depending on object).",
    inputSchema: {
      type: "object",
      properties: {
        object: { type: "string" },
        keys: {
          oneOf: [
            { type: "string" },
            { type: "array", items: { type: "string" } },
          ],
          description: "Single key or list of keys.",
        },
        fields: { type: "string", default: "*" },
      },
      required: ["object", "keys"],
    },
    handler: (args) => intacct.readByName(args),
  },
  {
    name: "intacct_inspect_object",
    description:
      "Return the field list / metadata for an Intacct object. " +
      "Use this before writing queries to confirm field names.",
    inputSchema: {
      type: "object",
      properties: { object: { type: "string" } },
      required: ["object"],
    },
    handler: (args) => intacct.inspectObject(args.object),
  },

  // -------------- Sage Construction Management --------------
  {
    name: "sagecm_list_projects",
    description: "List Sage Construction Management projects.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "integer", default: 1 },
        pageSize: { type: "integer", default: 50 },
        status: { type: "string" },
      },
    },
    handler: (args) => scm.listProjects(args),
  },
  {
    name: "sagecm_get_project",
    description: "Get a single Sage CM project by id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
    handler: (args) => scm.getProject(args.id),
  },
  {
    name: "sagecm_list_rfis",
    description: "List RFIs, optionally scoped to a project.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        status: { type: "string" },
        page: { type: "integer", default: 1 },
        pageSize: { type: "integer", default: 50 },
      },
    },
    handler: (args) => scm.listRfis(args),
  },
  {
    name: "sagecm_get_rfi",
    description: "Get a single RFI by id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
    handler: (args) => scm.getRfi(args.id),
  },
  {
    name: "sagecm_list_daily_logs",
    description: "List daily logs within an optional date range.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        from: { type: "string", description: "ISO date (YYYY-MM-DD)" },
        to: { type: "string", description: "ISO date (YYYY-MM-DD)" },
      },
    },
    handler: (args) => scm.listDailyLogs(args),
  },
  {
    name: "sagecm_list_commitments",
    description: "List commitments (POs / subcontracts) for a project.",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        page: { type: "integer", default: 1 },
        pageSize: { type: "integer", default: 50 },
      },
    },
    handler: (args) => scm.listCommitments(args),
  },
  {
    name: "sagecm_raw_request",
    description:
      "Escape hatch: call any Sage CM endpoint we haven't wrapped. " +
      "Use this only when a dedicated tool doesn't exist.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path relative to SAGECM_BASE_URL (e.g. 'contacts').",
        },
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
          default: "GET",
        },
        query: { type: "object", additionalProperties: true },
        body: {},
      },
      required: ["path"],
    },
    handler: ({ path, method, query, body }) =>
      scm.rawRequest(path, { method, query, body }),
  },
];

const byName = new Map(tools.map((t) => [t.name, t]));

const server = new Server(
  { name: "sage-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = byName.get(req.params.name);
  if (!tool) {
    return {
      isError: true,
      content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }],
    };
  }
  try {
    const result = await tool.handler(req.params.arguments ?? {});
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const detail =
      err && typeof err === "object"
        ? {
            name: err.name,
            message: err.message,
            status: err.status,
            body: err.body,
            errors: err.errors,
          }
        : { message: String(err) };
    return {
      isError: true,
      content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
