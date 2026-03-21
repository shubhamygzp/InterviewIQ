const pdfParse = require("pdf-parse");
const { generatePreparationReport } = require("../services/ai.service.js");
const preparationReportModel = require("../models/preparationReport.model.js");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

  const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
  const { selfDescription, jobDescription } = req.body;

  const interViewReportByAi = await generatePreparationReport({
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
  });

  const interviewReport = await preparationReportModel.create({
    user: req.user.id,
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
    ...interViewReportByAi,
  });

  res.status(201).json({
    message: "Interview report generated successfully",
    interviewReport,
  });
}

module.exports = { generateInterViewReportController };
