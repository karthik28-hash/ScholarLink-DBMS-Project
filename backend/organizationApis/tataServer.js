import orgBDb from "../config/dbOrgB.js";
import env from "../config/env.js";

import {
    createOrganizationApp
} from "./createOrganizationApp.js";

const app = createOrganizationApp({
    db: orgBDb,
    organizationId: "ORG002",
    organizationName: "Tata Capital"
});

app.listen(env.tataApiPort, () => {
    console.log(
        `Tata Capital API running on port ${env.tataApiPort}`
    );
});