import OpenAI from "openai";

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const imageBase64 = body.image;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.responses.create({
      model: "gpt-5",
      input: [
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
              type: "input_text",
              text: "Device: Flashlight. Input 100 J. Outputs 80 J light, 20 J heat."
            },
            {
              type: "input_image",
              image_base64: imageBase64
            }
          ]
        }
      ]
    });

    return {
      statusCode: 200,
      body: response.output_text
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI analysis failed" })
    };
  }
}
