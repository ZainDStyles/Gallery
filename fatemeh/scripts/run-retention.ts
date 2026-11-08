/** Runs the data-retention job once by hand: npm run retention:run */
import "dotenv/config";
import { runRetention } from "../src/lib/enquiries";
import { db } from "../src/lib/db";

runRetention()
  .then((s) => console.log("Retention complete:", s))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db().$disconnect());
