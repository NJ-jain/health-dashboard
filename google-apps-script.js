/**
 * Google Apps Script Webhook Integration for EHS Dashboard
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any code in the editor and paste this script.
 * 4. Replace WEBHOOK_URL with your actual production domain URL:
 *    e.g., 'https://your-domain.vercel.app/api/update'
 * 5. Save the project (click the floppy disk icon).
 * 6. Set up an installable trigger (onEdit trigger) if you want it to run
 *    automatically on every edit, or use the simple trigger provided.
 */

// CHANGE THIS to your deployed Next.js EHS Dashboard domain
const WEBHOOK_URL = 'https://YOUR_DOMAIN/api/update';

/**
 * Simple trigger that runs automatically when a user changes a value in any cell.
 * @param {Object} e The event object provided by Google Sheets on edit.
 */
function onEdit(e) {
  try {
    if (!e) {
      Logger.log("No event object found. Run triggerEHSWebhook manually for testing.");
      return;
    }
    
    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();
    
    Logger.log(`Edit detected on sheet: ${sheetName} at range ${e.range.getA1Notation()}`);
    
    // Process the data and send the webhook
    processAndSendWebhook(sheet);
    
  } catch (error) {
    Logger.log(`Error in onEdit trigger: ${error.toString()}`);
  }
}

/**
 * Manual test function. You can click 'Run' on this function in the Apps Script console.
 */
function testWebhookTrigger() {
  const activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log(`Manually triggering webhook for sheet: ${activeSheet.getName()}`);
  processAndSendWebhook(activeSheet);
}

/**
 * Reads all rows from the active sheet, converts them into a structured JSON payload,
 * and sends it to the EHS Dashboard API.
 * 
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet to read data from.
 */
function processAndSendWebhook(sheet) {
  const sheetName = sheet.getName();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  if (values.length < 2) {
    Logger.log("Sheet does not contain enough data (needs at least a header row and one data row).");
    return;
  }
  
  // Headers (Row 1) - converted to lowercase, space-stripped keys for safety
  const headers = values[0].map(function(header) {
    return header.toString().trim();
  });
  
  // Data Rows (Row 2 onwards)
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const row = {};
    let hasContent = false;
    
    for (let j = 0; j < headers.length; j++) {
      const cellValue = values[i][j];
      const key = headers[j];
      
      if (key) {
        row[key] = cellValue;
        if (cellValue !== "" && cellValue !== null && cellValue !== undefined) {
          hasContent = true;
        }
      }
    }
    
    // Only include rows that have actual content
    if (hasContent) {
      rows.push(row);
    }
  }
  
  // Formulate standard structured payload
  const payload = {
    sheetName: sheetName,
    lastUpdatedBy: Session.getActiveUser().getEmail() || "Google Sheet Editor",
    timestamp: new Date().toISOString(),
    // Standard rows mapped directly from sheet columns
    sheetData: rows
  };

  // ADVANCED: Smart mapping for EHS Dashboard structure based on sheet name
  // If the sheet name corresponds to one of the dashboard components, map it directly!
  const lowerSheetName = sheetName.toLowerCase();
  
  if (lowerSheetName.includes("kpi") || lowerSheetName.includes("stats")) {
    payload.kpiStats = mapKPICards(rows);
  } else if (lowerSheetName.includes("breakdown") || lowerSheetName.includes("pie")) {
    payload.incidentBreakdown = mapIncidentBreakdown(rows);
  } else if (lowerSheetName.includes("trend") || lowerSheetName.includes("line")) {
    payload.incidentTrend = mapIncidentTrend(rows);
  } else if (lowerSheetName.includes("critical") || lowerSheetName.includes("issue")) {
    payload.criticalIssues = mapCriticalIssues(rows);
  } else if (lowerSheetName.includes("msi") || lowerSheetName.includes("parameter")) {
    // If we are updating the total score
    const scoreRow = rows.find(r => r.msiScore !== undefined);
    if (scoreRow) {
      payload.msiScore = Number(scoreRow.msiScore);
    }
    payload.msiParameters = mapMSIParameters(rows);
  } else if (lowerSheetName.includes("gemba")) {
    payload.gembaData = mapGembaData(rows);
  } else if (lowerSheetName.includes("training") || lowerSheetName.includes("learn")) {
    payload.trainingSessions = mapTraining(rows);
  } else if (lowerSheetName.includes("drill")) {
    payload.mockDrills = mapDrills(rows);
  } else if (lowerSheetName.includes("milestone")) {
    payload.milestones = rows.map(r => r.milestone || r.text || r.title).filter(Boolean);
  }

  // Execute Webhook POST operation
  sendHttpPost(WEBHOOK_URL, payload);
}

/**
 * Send HTTP POST request with UrlFetchApp
 */
function sendHttpPost(url, payload) {
  if (url.indexOf("YOUR_DOMAIN") > -1) {
    Logger.log("[WARNING] Webhook URL is not configured. Please set a valid domain URL.");
    return;
  }

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // Enable parsing error response codes safely
  };

  Logger.log(`Sending POST request to: ${url}`);
  Logger.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode >= 200 && responseCode < 300) {
      Logger.log(`[Success] Webhook sent successfully! Status: ${responseCode}`);
      Logger.log(`Response: ${responseBody}`);
    } else {
      Logger.log(`[Failure] Webhook returned status code: ${responseCode}`);
      Logger.log(`Response body: ${responseBody}`);
    }
  } catch (error) {
    Logger.log(`[Error] Failed to execute UrlFetchApp HTTP request: ${error.toString()}`);
  }
}

// =========================================================================
// EHS DATA MAPPING HELPERS
// =========================================================================

function mapKPICards(rows) {
  return rows.map(function(r) {
    return {
      title: r.title || r.name,
      value: r.value !== undefined ? r.value : 0,
      change: r.change || "",
      changeType: r.changeType || "decrease",
      comparisonText: r.comparisonText || "vs last month",
      isGoodTrend: r.isGoodTrend || "positive",
      iconColorClass: r.iconColorClass || "text-cyan-400",
      iconBgClass: r.iconBgClass || "bg-cyan-950/20 border-cyan-500/20"
    };
  });
}

function mapIncidentBreakdown(rows) {
  return rows.map(function(r) {
    return {
      name: r.name || r.category,
      value: Number(r.value || 0),
      color: r.color || "#06B6D4"
    };
  });
}

function mapIncidentTrend(rows) {
  return rows.map(function(r) {
    return {
      name: r.name || r.month || r.timeline,
      Fatality: Number(r.Fatality || 0),
      LTI: Number(r.LTI || 0),
      FirstAid: Number(r.FirstAid || 0),
      NearMiss: Number(r.NearMiss || 0),
      UnsafeAct: Number(r.UnsafeAct || r.unsafe_act || 0),
      UnsafeCond: Number(r.UnsafeCond || r.unsafe_cond || 0)
    };
  });
}

function mapCriticalIssues(rows) {
  return rows.map(function(r, index) {
    return {
      id: Number(r.id || index + 1),
      issue: r.issue || r.title || "Safety concern",
      area: r.area || r.location || "General Area",
      status: r.status || "Open"
    };
  });
}

function mapMSIParameters(rows) {
  return rows.map(function(r) {
    return {
      title: r.title || r.parameter || "",
      score: r.score || "10/10",
      percentage: Number(r.percentage || 100)
    };
  });
}

function mapGembaData(rows) {
  // If there's a summary row and a list of trend rows
  const summary = rows.find(r => r.walksCount !== undefined) || {};
  const trendRows = rows.filter(r => r.Observations !== undefined);
  
  return {
    walksCount: Number(summary.walksCount || 24),
    compliance: Number(summary.compliance || 95),
    mtdObs: Number(summary.mtdObs || 12),
    ytdObs: Number(summary.ytdObs || 110),
    closurePct: Number(summary.closurePct || 91),
    trend: trendRows.map(function(t) {
      return {
        name: t.name || t.month || "",
        Observations: Number(t.Observations || 0),
        Closed: Number(t.Closed || t.closed || 0)
      };
    })
  };
}

function mapTraining(rows) {
  return rows.map(function(r) {
    return {
      type: r.type || r.session_type || "",
      sessions: Number(r.sessions || 0),
      headcount: Number(r.headcount || 0)
    };
  });
}

function mapDrills(rows) {
  return rows.map(function(r) {
    return {
      label: r.label || r.title || "",
      val: r.val || r.value || "",
      valClass: r.valClass || r.class || "text-slate-300 font-semibold"
    };
  });
}
