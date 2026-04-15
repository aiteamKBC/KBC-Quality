import type { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import type { Plugin } from "vite";
import { getLearnerById, listLearners } from "./neonLearners";

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function getPathname(request: IncomingMessage) {
  const url = new URL(request.url || "/", "http://localhost");
  return url.pathname;
}

async function handleRequest(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const pathname = getPathname(request);

  try {
    if (pathname === "/api/learners") {
      const learners = await listLearners();
      sendJson(response, 200, learners);
      return;
    }

    const learnerMatch = pathname.match(/^\/api\/learners\/([^/]+)$/);
    if (learnerMatch) {
      const learner = await getLearnerById(decodeURIComponent(learnerMatch[1]));

      if (!learner) {
        sendJson(response, 404, { error: "Learner not found" });
        return;
      }

      sendJson(response, 200, learner);
      return;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    sendJson(response, 500, { error: message });
    return;
  }
}

function attachMiddleware(middlewares: {
  use: (handler: (request: IncomingMessage, response: ServerResponse, next: () => void) => void) => void;
}) {
  middlewares.use((request, response, next) => {
    const pathname = getPathname(request);
    if (!pathname.startsWith("/api/learners")) {
      next();
      return;
    }

    void handleRequest(request, response);
  });
}

export function neonApiPlugin(): Plugin {
  return {
    name: "neon-api-plugin",
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

