// Utility to generate quiz questions (and illustrative images) using OpenAI APIs
// IMPORTANT: Set your OpenAI API key in an environment variable named OPENAI_API_KEY
// The function returns an array of question objects: { id, question, options: [], correct, visual? }
// Local SVG helpers for shapes / counting etc.
import { makeShapeSvg, makeCountingSvg, makePatternSvg, makeAdditionSvg, makeClockSvg } from './graphics';
// Generate an illustrative image via DALL·E for a prompt (fallback only)
const generateImage = async (prompt, apiKey) => {
  try {
    const res = await fetch('/openai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-2',
        prompt,
        n: 1,
        size: '1024x1024'
      })
    });
    if (!res.ok) return null;
    const imgData = await res.json();
    return imgData.data?.[0]?.url || null;
  } catch (err) {
    console.error('Image generation failed', err);
    return null;
  }
};

export const generateOpenAIQuestions = async (topicName, difficulty = 'easy') => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key is missing. Set VITE_OPENAI_API_KEY in your .env file.');
    return [];
  }

  const systemPrompt = `You are an expert Grade-1 math tutor creating engaging quiz questions.\n` +
    `Return ONLY valid JSON that matches the following JavaScript schema:\n` +
    `[{ id: number, question: string, options: string[], correct: string }]\n` +
    `Do NOT include emojis or any decorative symbols.\n` +
    `Each question must be multiple-choice with exactly 4 options and a single correct answer.\n` +
    `NO markdown, no commentary—just raw JSON.`;

  const userPrompt = `Create 15 '${difficulty}' level questions for the Grade-1 math sub-topic “${topicName}”.\n` +
    `Use the curriculum highlights below as guidance. Do NOT include emojis.\n` +
    `Curriculum Highlights:\n` +
    `• Recognize and write numbers 0–10\n• Identify and draw 2D shapes (circle, square, triangle, rectangle)\n• Understand comparisons (big/small, long/short, heavy/light)\n• Identify colours (red, blue, yellow, green)\n• Count, sort, and match items with numerals\n• Recognize time concepts (day/night, morning/afternoon)\n• Perform basic addition (within 10)\n• Understand ordinal numbers (1st to 5th)\n• Identify money coins (1c to Rs 10)\n• Recognize and complete patterns`;

  try {
    const response = await fetch('/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error', await response.text());
      return [];
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;
    if (!assistantMessage) return [];

    // Attempt to parse JSON from the assistant's response
    let parsed;
    try {
      parsed = JSON.parse(assistantMessage);
    } catch (err) {
      console.error('Failed to parse OpenAI JSON', err, assistantMessage);
      return [];
    }

        // Ensure each question has an id (fallback index) and attach image
        // Decide if this topic should have generated images
    const withImages = [];

    for (const q of parsed) {
      let imgUrl = null;
      const qText = q.question.toLowerCase();

      // Shapes
      const shapeMatch = qText.match(/(square|triangle|circle|rectangle)/);
      if (shapeMatch) {
        imgUrl = makeShapeSvg(shapeMatch[1]);
      }

      // Counting ("How many" and numeric answer)
      if (!imgUrl && /how many/.test(qText)) {
        const num = parseInt(q.correct, 10);
        if (!isNaN(num) && num > 0 && num <= 20) {
          imgUrl = makeCountingSvg(num);
        }
      }

      // Addition / grouping visuals (e.g., "6 and 1 make", "4 + 3")
      if (!imgUrl) {
        const addMatch = qText.match(/(\d+)\s*(?:\+|and)\s*(\d+)/);
        if (addMatch) {
          const a = parseInt(addMatch[1], 10);
          const b = parseInt(addMatch[2], 10);
          if (a <= 10 && b <= 10) imgUrl = makeAdditionSvg(a, b);
        }
      }

      // Simple pattern detection
      if (!imgUrl && /pattern/.test(qText)) {
        imgUrl = makePatternSvg(['🔴', '🔵', '🔴', '🔵', '?']);
      }

      withImages.push({ ...q, id: q.id || withImages.length + 1, image: imgUrl });
    }
    return withImages;
  } catch (err) {
    console.error('OpenAI fetch error', err);
    return [];
  }
};
