import orgCDb from "../config/dbOrgC.js";
import env from "../config/env.js";

import {
    createOrganizationApp
} from "./createOrganizationApp.js";

const app = createOrganizationApp({
    db: orgCDb,
    organizationId: "ORG003",
    organizationName: "Reliance Foundation"
});

app.listen(env.relianceApiPort, () => {
    console.log(
        `Reliance Foundation API running on port ${env.relianceApiPort}`
    );
});