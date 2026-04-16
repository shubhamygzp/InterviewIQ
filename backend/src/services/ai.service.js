const Groq = require("groq-sdk");
const { z } = require("zod");
const puppeteer = require("puppeteer");
const puppeteerCore = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");



const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});



const preparationReportSchema = z.object({
  matchScore: z.number().min(0).max(100),

  technicalQuestions: z
    .array(
      z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string(),
      }),
    )
    .min(3),

  behavioralQuestions: z
    .array(
      z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string(),
      }),
    )
    .min(3),

  skillGaps: z
    .array(
      z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"]),
      }),
    )
    .min(2),

  preparationPlan: z
    .array(
      z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string()).min(2),
      }),
    )
    .min(5),

  title: z.string(),
});




async function generateWithRetry(fn, retries = 2) {
  try {
    return await fn();
  } catch(err) {
    if (retries === 0) throw err;
    console.log("Retrying AI call...");
    return generateWithRetry(fn, retries - 1);
  }
}

function parseModelJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("Model did not return valid JSON content.");
    }

    const jsonSlice = cleaned.slice(firstBrace, lastBrace + 1);
    return JSON.parse(jsonSlice);
  }
}

async function generatePreparationReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert interview coach.

Generate a COMPLETE and DETAILED interview preparation report.

STRICT RULES:
- Return ONLY valid JSON (no markdown, no explanation)
- DO NOT leave any field empty
- Follow minimum counts:
  - ≥5 technical questions
  - ≥5 behavioral questions
  - ≥3 skill gaps
  - ≥7 days preparation plan
- matchScore must be between 0 to 100
- Answers must be detailed and practical


TITLE RULE (VERY IMPORTANT):
- Extract the job role STRICTLY from the job description
- Title MUST be a standard role like:
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Flutter Developer", "Web Developer", "Cloud Engineer", etc.
- DO NOT generate random or generic titles like "Software Role" or "Engineer Position"



JSON FORMAT:
{
  "title": "string",
  "matchScore": number,
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "behavioralQuestions": [],
  "skillGaps": [
    {
      "skill": "string",
      "severity": "low | medium | high"
    }
  ],
  "preparationPlan": [
    {
      "day": number,
      "focus": "string",
      "tasks": ["string"]
    }
  ]
}

Candidate Details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

  return generateWithRetry(async () => {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You generate strict JSON output only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
    const parsed = parseModelJson(text);

    
    const validated = preparationReportSchema.parse(parsed);

    return validated;
  });
}




// For Generating Resume
async function generatePdfFromHtml(htmlContent) {
  let browser = null;

  const localLaunchOptions = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  };

  try {
    if (process.env.NODE_ENV === "production") {
      const executablePath =
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        (await chromium.executablePath());

      browser = await puppeteerCore.launch({
        args: [...chromium.args, ...localLaunchOptions.args],
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
      });
    } else {
      browser = await puppeteer.launch({
        ...localLaunchOptions,
        executablePath:
          process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
      });
    }
  } catch (launchError) {
    console.error("Puppeteer launch failed:", launchError.message);
    browser = await puppeteer.launch(localLaunchOptions);
  }

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}



async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `
Generate a professional ATS-friendly resume.

STRICT RULES:
- Return ONLY JSON with "html" field
- Clean HTML
- 1 to 2 pages
- No AI tone

JSON FORMAT:
{
  "html": "<html>...</html>"
}

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

  return generateWithRetry(async () => {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Return only JSON output.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
    const parsed = parseModelJson(text);

    if (!parsed.html || typeof parsed.html !== "string") {
      throw new Error("Model response missing HTML payload.");
    }

    const pdfBuffer = await generatePdfFromHtml(parsed.html);

    return pdfBuffer;
  });
}


module.exports = {
  generatePreparationReport,
  generateResumePdf,
};
