const http = require("http");

// Port matches the running Next.js dev server
const PORT = 3000;

function sendPost(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: "localhost",
      port: PORT,
      path: path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body ? JSON.parse(body) : null
        });
      });
    });

    req.on("error", (e) => reject(e));
    req.write(data);
    req.end();
  });
}

function sendMalformedPost(path, rawString) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: PORT,
      path: path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(rawString)
      }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          body: body ? JSON.parse(body) : null
        });
      });
    });

    req.on("error", (e) => reject(e));
    req.write(rawString);
    req.end();
  });
}

async function runTests() {
  console.log("==========================================");
  console.log("⚙️ REALTIME EHS WEBHOOK OPTIMIZATION TEST");
  console.log("==========================================\n");

  // Test 1: Valid Ingestion
  console.log("🧪 [Test 1] Dispatching a valid Google Sheets webhook payload...");
  try {
    const res = await sendPost("/api/update", {
      sheetName: "EHS KPI Stats",
      sheetData: [
        { title: "Total Incidents", value: 10, change: "15% decrease", changeType: "decrease" }
      ]
    });
    console.log(`  -> Status: ${res.statusCode} (Expected: 200)`);
    console.log(`  -> Response:`, res.body);
  } catch (err) {
    console.error("  -> Failed Test 1:", err.message);
  }

  // Test 2: Validation Schema Failure
  console.log("\n🧪 [Test 2] Dispatching a payload with illegal keys (Validation Failure)...");
  try {
    const res = await sendPost("/api/update", {
      invalidKeyName: "malicious payload",
      attackVector: true
    });
    console.log(`  -> Status: ${res.statusCode} (Expected: 400)`);
    console.log(`  -> Response:`, res.body);
  } catch (err) {
    console.error("  -> Failed Test 2:", err.message);
  }

  // Test 3: Malformed JSON Syntax Failure
  console.log("\n🧪 [Test 3] Sending malformed JSON syntax...");
  try {
    const res = await sendMalformedPost("/api/update", "{ invalidJsonString: true ");
    console.log(`  -> Status: ${res.statusCode} (Expected: 400)`);
    console.log(`  -> Response:`, res.body);
  } catch (err) {
    console.error("  -> Failed Test 3:", err.message);
  }

  // Test 4: Rate Limiting Stress Test
  console.log("\n🧪 [Test 4] Dispatching rapid updates to test the sliding-window Rate Limiter...");
  console.log("  (Max limit: 30 requests per minute. Spamming 35 requests...)");
  
  let successCount = 0;
  let rateLimitedCount = 0;
  
  const promises = [];
  for (let i = 0; i < 35; i++) {
    promises.push(
      sendPost("/api/update", {
        sheetName: "EHS KPI Stats",
        sheetData: [{ title: "Total Incidents", value: 10 + i }]
      })
    );
  }

  const results = await Promise.all(promises);
  for (const r of results) {
    if (r.statusCode === 200) {
      successCount++;
    } else if (r.statusCode === 429) {
      rateLimitedCount++;
    }
  }

  console.log(`  -> Results:`);
  console.log(`     - Processed requests (200 OK): ${successCount}`);
  console.log(`     - Blocked requests (429 Rate Limited): ${rateLimitedCount}`);
  console.log(`  -> Rate Limiter active: ${rateLimitedCount > 0 ? "YES (PASSED)" : "NO (FAILED)"}`);

  console.log("\n==========================================");
  console.log("🏁 TELEMETRY SYSTEM Hardening Test Done.");
  console.log("==========================================");
}

runTests();
