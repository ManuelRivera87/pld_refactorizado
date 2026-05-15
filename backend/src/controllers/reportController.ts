import type { Response } from "express";
import type { AuthenticatedRequest } from "../models/auth.js";
import { uploadCreditReport } from "../services/creditReportService.js";
import {
  generateCreditXml,
  getCreditXmlExportForDownload
} from "../services/creditXmlService.js";
import {
  getUserUploadDashboard,
  listReportUploads
} from "../services/reportUploadService.js";
import { HttpError } from "../utils/httpError.js";

type UploadRequest = AuthenticatedRequest & {
  file?: Express.Multer.File;
};

export const uploadCreditReportController = async (
  request: UploadRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  if (!request.file) {
    throw new HttpError(400, "XLS file is required");
  }

  const summary = await uploadCreditReport({
    anioAfectacion: String(request.body.anioAfectacion ?? ""),
    companyId: String(request.body.companyId ?? ""),
    file: request.file,
    mesAfectacion: String(request.body.mesAfectacion ?? ""),
    uploadedByUserId: request.user.id
  });

  response.status(201).json({ summary });
};

export const generateCreditXmlController = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  const summary = await generateCreditXml(
    String(request.params.uploadId ?? ""),
    request.user.id
  );

  response.status(201).json({ summary });
};

export const downloadCreditXmlController = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  const xmlExport = await getCreditXmlExportForDownload(
    String(request.params.xmlExportId ?? "")
  );
  const safeFileName = xmlExport.fileName.replace(/[\r\n"]/g, "");

  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeFileName}"`
  );
  response.send(xmlExport.xmlContent);
};

export const listReportUploadsController = async (
  _request: AuthenticatedRequest,
  response: Response
) => {
  const uploads = await listReportUploads();

  response.json({ uploads });
};

export const getMyUploadDashboardController = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  const dashboard = await getUserUploadDashboard(request.user.id);

  response.json({ dashboard });
};
