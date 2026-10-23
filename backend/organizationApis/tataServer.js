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

const port = Number(
    process.env.TATA_API_PORT ||
    process.env.PORT ||
    env.tataApiPort ||
    5002
);

app.listen(port, "0.0.0.0", () => {
    console.log(
        `Tata Capital API running on port ${port} (0.0.0.0)`
    );
});
