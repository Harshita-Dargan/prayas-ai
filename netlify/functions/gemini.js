// Using global fetch (native in Node 18+)


exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Gemini API key is not configured on the server." })
      };
    }

    const { image, mimeType, lang } = JSON.parse(event.body);
    if (!image) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Missing image data." })
      };
    }

    const targetLang = lang || 'hi';
    let langInstruction = 'Hindi';
    if (targetLang === 'en') {
      langInstruction = 'English';
    } else if (targetLang === 'mr') {
      langInstruction = 'Marathi';
    }

    const promptText = `You are an expert crop pathologist advising farmers in Maharashtra, India.
Analyze this image and identify the crop disease or pest infestation. 
Return a JSON object that strictly adheres to the following schema:
{
  "disease": "Name of disease/pest in ${langInstruction} (with English name in parentheses, or 'Healthy Crop' in ${langInstruction} if healthy)",
  "crop": "Crop Name in ${langInstruction}",
  "conf": "high" or "med" or "low" based on diagnostic certainty,
  "confPct": "Confidence percentage, e.g. 92%",
  "alt": "Possible alternate causes or lookalike symptoms in ${langInstruction}",
  "plan": [
    { "k": "Action", "v": "Specific biological, chemical, or integrated pest management (IPM) action in ${langInstruction}" },
    { "k": "Timing", "v": "Timeline for treatment in ${langInstruction} (e.g. today evening, before rains)" },
    { "k": "Cost", "v": "Estimated treatment cost range per acre in Rupees in ${langInstruction}" },
    { "k": "Required", "v": "List of recommended safe pesticides, bio-control inputs, or tools in ${langInstruction}" },
    { "k": "Alternative", "v": "Low-cost/organic substitute (e.g., Neem oil, ash spray, hand-picking) in ${langInstruction}" },
    { "k": "Source", "v": "Type of shop or service provider to consult in ${langInstruction} (e.g., Krishi Kendra, seed dealer)" },
    { "k": "Reinspection", "v": "Days to wait before re-inspection in ${langInstruction}" }
  ]
}

Ensure the text is natural, friendly, and extension-worker aligned in ${langInstruction}. Return only the JSON object.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: image
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: `Gemini API error: ${errorText}` })
      };
    }

    const result = await response.json();
    let textResponse = "";

    if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts[0]) {
      textResponse = result.candidates[0].content.parts[0].text;
    }

    // Try parsing the text response as JSON to make sure it's valid, otherwise throw an error
    const parsedData = JSON.parse(textResponse.trim());

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsedData)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
