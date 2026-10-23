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

const port = Number(
    process.env.RELIANCE_API_PORT ||
    process.env.PORT ||
    env.relianceApiPort ||
    5003
);

app.listen(port, "0.0.0.0", () => {
    console.log(
        `Reliance Foundation API running on port ${port} (0.0.0.0)`
    );
});
