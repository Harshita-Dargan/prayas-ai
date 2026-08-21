const fetch = require('node-fetch') || globalThis.fetch;

// Ephemeral in-memory fallback for local demos
let fallbackStore = {
  reports: [
    { id: 1, disease: "Late Blight", crop: "टमाटर / आलू", conf: "high", confPct: "91%", alt: "संभावित अन्य कारण: जीवाणु धब्बा रोग (कम संभावना)।", created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
    { id: 2, disease: "Powdery Mildew", crop: "सरसों", conf: "high", confPct: "89%", alt: "संभावित अन्य कारण: डाउनी मिल्ड्यू (कम संभावना)।", created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString() }
  ],
  expertCases: [
    { id: 1, disease: 'पत्ता झुलसा रोग (Late Blight)', crop: 'टमाटर', village: 'रामपुर, ग्रिड B4', reports: 6, confPct: '91%', status: 'pending', note: '6 किसानों से मिलती-जुलती रिपोर्ट, 48 घंटे में — रेड-टियर अलर्ट का प्रस्ताव' },
    { id: 2, disease: 'तना छेदक कीट (संभावित)', crop: 'धान', village: 'सोहनपुर, ग्रिड C2', reports: 2, confPct: '64%', status: 'pending', note: 'AI भरोसा कम — किसान ने खुद विशेषज्ञ के पास भेजा' },
    { id: 3, disease: 'चूर्णिल आसिता', crop: 'सरसों', village: 'गोपालगढ़, grid A1', reports: 3, confPct: '85%', status: 'pending', note: '3 रिपोर्ट, बढ़ती प्रवृत्ति — निगरानी सुझाई गई' }
  ],
  sensors: [
    { timestamp: new Date().toISOString(), trap_count: 14, soil_moisture: 32, leaf_wetness: 82 }
  ]
};

exports.handler = async (event, context) => {
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  const { type } = event.queryStringParameters || {};
  if (!type || !["reports", "expert", "sensors"].includes(type)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Missing or invalid 'type' parameter. Use 'reports', 'expert', or 'sensors'." })
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
  const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

  try {
    // ----------------------------------------------------
    // GET OPERATIONS
    // ----------------------------------------------------
    if (event.httpMethod === "GET") {
      if (isSupabaseConfigured) {
        let tableName = type === "expert" ? "expert_cases" : (type === "sensors" ? "sensor_metrics" : "reports");
        let orderCol = tableName === "reports" || tableName === "sensor_metrics" ? "created_at" : "id";
        
        const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*&order=${orderCol}.desc`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
          }
        });
        
        if (!res.ok) {
          throw new Error(`Supabase GET error: ${await res.text()}`);
        }
        
        const data = await res.json();
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(data) };
      } else {
        // Return local mock storage
        let list = type === "expert" ? fallbackStore.expertCases : (type === "sensors" ? fallbackStore.sensors : fallbackStore.reports);
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(list) };
      }
    }

    // ----------------------------------------------------
    // POST / PUT OPERATIONS
    // ----------------------------------------------------
    if (event.httpMethod === "POST" || event.httpMethod === "PUT") {
      const bodyData = JSON.parse(event.body || "{}");

      if (isSupabaseConfigured) {
        let tableName = type === "expert" ? "expert_cases" : (type === "sensors" ? "sensor_metrics" : "reports");
        
        // Handle Upsert for expert cases updates
        const headers = {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        };
        
        let fetchUrl = `${supabaseUrl}/rest/v1/${tableName}`;
        let method = "POST";

        if (type === "expert" && bodyData.id) {
          // Update existing expert case
          fetchUrl = `${supabaseUrl}/rest/v1/expert_cases?id=eq.${bodyData.id}`;
          method = "PATCH";
        }

        const res = await fetch(fetchUrl, {
          method: method,
          headers: headers,
          body: JSON.stringify(bodyData)
        });

        if (!res.ok) {
          throw new Error(`Supabase POST/PATCH error: ${await res.text()}`);
        }

        const data = await res.json();
        return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(data) };
      } else {
        // Ephemeral memory mutation
        if (type === "reports") {
          const newReport = { id: Date.now(), created_at: new Date().toISOString(), ...bodyData };
          fallbackStore.reports.unshift(newReport);
          return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(newReport) };
        } else if (type === "expert") {
          if (bodyData.id) {
            const idx = fallbackStore.expertCases.findIndex(c => c.id === Number(bodyData.id));
            if (idx !== -1) {
              fallbackStore.expertCases[idx] = { ...fallbackStore.expertCases[idx], ...bodyData };
              return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(fallbackStore.expertCases[idx]) };
            }
          }
          const newCase = { id: Date.now(), ...bodyData };
          fallbackStore.expertCases.unshift(newCase);
          return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(newCase) };
        } else if (type === "sensors") {
          const newSensors = { timestamp: new Date().toISOString(), ...bodyData };
          fallbackStore.sensors.unshift(newSensors);
          return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(newSensors) };
        }
      }
    }

    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};
