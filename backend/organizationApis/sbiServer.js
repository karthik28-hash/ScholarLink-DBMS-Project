import orgADb from "../config/dbOrgA.js";
import env from "../config/env.js";

import {
    createOrganizationApp
} from "./createOrganizationApp.js";

const app = createOrganizationApp({
    db: orgADb,
    organizationId: "ORG001",
    organizationName: "SBI Foundation"
});

const port = Number(
    process.env.SBI_API_PORT ||
    process.env.PORT ||
    env.sbiApiPort ||
    5001
);

app.listen(port, "0.0.0.0", () => {
    console.log(
        `SBI Foundation API running on port ${port} (0.0.0.0)`
    );
});
