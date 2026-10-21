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

app.listen(env.sbiApiPort, () => {
    console.log(
        `SBI Foundation API running on port ${env.sbiApiPort}`
    );
});