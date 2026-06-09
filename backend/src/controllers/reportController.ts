import type { Response } from "express";
import type { AuthenticatedRequest } from "../models/auth.js";
import { uploadCreditReport } from "../services/creditReportService.js";
import {
  generateCreditXml,
  generateSalesXml,
  getCreditXmlExportForDownload,
  getSalesXmlExportForDownload
} from "../services/creditXmlService.js";
import { uploadLeaseReport } from "../services/leaseReportService.js";
import {
  generateLeaseXml,
  getLeaseXmlExportForDownload
} from "../services/leaseXmlService.js";
import { uploadSalesReport } from "../services/salesReportService.js";
import {
  getReportDashboardMetrics,
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

export const uploadSalesReportController = async (
  request: UploadRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  if (!request.file) {
    throw new HttpError(400, "XLS file is required");
  }

  const summary = await uploadSalesReport({
    anioAfectacion: String(request.body.anioAfectacion ?? ""),
    companyId: String(request.body.companyId ?? ""),
    file: request.file,
    mesAfectacion: String(request.body.mesAfectacion ?? ""),
    uploadedByUserId: request.user.id
  });

  response.status(201).json({ summary });
};

export const uploadLeaseReportController = async (
  request: UploadRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  if (!request.file) {
    throw new HttpError(400, "XLS file is required");
  }

  const summary = await uploadLeaseReport({
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
    request.user.id,
    request.user.role
  );

  response.status(201).json({ summary });
};

export const generateSalesXmlController = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  const summary = await generateSalesXml(
    String(request.params.uploadId ?? ""),
    request.user.id,
    request.user.role
  );

  response.status(201).json({ summary });
};

export const generateLeaseXmlController = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  const summary = await generateLeaseXml(
    String(request.params.uploadId ?? ""),
    request.user.id,
    request.user.role
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
    String(request.params.xmlExportId ?? ""),
    {
      userId: request.user.id,
      role: request.user.role
    }
  );
  const safeFileName = xmlExport.fileName.replace(/[\r\n"]/g, "");

  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeFileName}"`
  );
  response.send(xmlExport.xmlContent);
};

export const downloadSalesXmlController = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  const xmlExport = await getSalesXmlExportForDownload(
    String(request.params.xmlExportId ?? ""),
    {
      userId: request.user.id,
      role: request.user.role
    }
  );
  const safeFileName = xmlExport.fileName.replace(/[\r\n"]/g, "");

  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeFileName}"`
  );
  response.send(xmlExport.xmlContent);
};

export const downloadLeaseXmlController = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  const xmlExport = await getLeaseXmlExportForDownload(
    String(request.params.xmlExportId ?? ""),
    {
      userId: request.user.id,
      role: request.user.role
    }
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
  request: AuthenticatedRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  const uploads = await listReportUploads({
    userId: request.user.id,
    role: request.user.role
  });

  response.json({ uploads });
};

export const getReportDashboardMetricsController = async (
  request: AuthenticatedRequest,
  response: Response
) => {
  if (!request.user) {
    throw new HttpError(401, "Authenticated user is required");
  }

  const dashboard = await getReportDashboardMetrics({
    userId: request.user.id,
    role: request.user.role
  });

  response.json({ dashboard });
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
