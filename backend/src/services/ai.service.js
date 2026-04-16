const Groq = require("groq-sdk");
const { z } = require("zod");
const puppeteer = require("puppeteer");



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

    
    const cleaned = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    
    const validated = preparationReportSchema.parse(parsed);

    return validated;
  });
}




// For Generating Resume
async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

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
    await browser.close();
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
    const cleaned = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    const pdfBuffer = await generatePdfFromHtml(parsed.html);

    return pdfBuffer;
  });
}


module.exports = {
  generatePreparationReport,
  generateResumePdf,
};
