export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const imageBase64 = body.image;

    const response = await fetch("https://api.poe.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.POE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5",   // ⚠️改成 Poe 上真正支援 Vision 的模型名稱
        messages: [
          {
            role: "system",
            content: `
You are a diagram structure extractor.

The student drew a Sankey diagram on grid paper.
Each grid square equals 10 J.

Extract:
- Input arrow direction and width
- Output arrows direction and width
- Any numbers written near arrows

Return JSON only.
Do NOT judge correctness.
`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract only what you can see in the image."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                  
                }
              }
            ]
          }
        ],
        temperature: 0
      })
    });

    const data = await response.json();

    // ✅ 取出模型文字回應
    const outputText = data.choices?.[0]?.message?.content;

    // ✅ 嘗試轉成 JSON
    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Model did not return valid JSON",
          raw: outputText
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(parsed)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Poe Vision API failed",
        details: error.message
      })
    };
  }
}
