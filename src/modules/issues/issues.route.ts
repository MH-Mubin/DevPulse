import { Router } from "express";

import auth from "../../middleware/auth.middleware";
import { issuesController } from "./issues.controller";

const router = Router();

router.post("/", auth, issuesController.createIssue);
router.get("/", issuesController.getAllIssues);
router.get("/:id", issuesController.getSingleIssue);
router.patch("/:id", auth, issuesController.updateIssue);
router.delete("/:id", auth, issuesController.deleteIssue);

export const issuesRoute = router;
