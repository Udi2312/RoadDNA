// ─── Generic Zod validation middleware ───
// Usage in routes:
//   router.post("/", validate(mySchema), controller.handler);
//   router.get("/",  validate(querySchema, "query"), controller.handler);

import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validate(
  schema: z.ZodType<any>,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Pass ZodError to the global error handler
      next(result.error);
      return;
    }

    // In Express 5, req.query is read-only. Only overwrite req.body.
    // For query/params, the controller casts req.query with the inferred type.
    if (source === "body") {
      req.body = result.data;
    }

    next();
  };
}
