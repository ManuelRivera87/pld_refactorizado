import type { Request, Response } from "express";
import {
  createCompany,
  deleteCompany,
  getCompanyById,
  listCompanies,
  updateCompany
} from "../services/companyService.js";

export const listCompaniesController = async (_request: Request, response: Response) => {
  const companies = await listCompanies();

  response.json({ companies });
};

export const getCompanyController = async (request: Request, response: Response) => {
  const company = await getCompanyById(request.params.id);

  response.json({ company });
};

export const createCompanyController = async (request: Request, response: Response) => {
  const company = await createCompany(request.body);

  response.status(201).json({ company });
};

export const updateCompanyController = async (request: Request, response: Response) => {
  const company = await updateCompany(request.params.id, request.body);

  response.json({ company });
};

export const deleteCompanyController = async (request: Request, response: Response) => {
  await deleteCompany(request.params.id);

  response.status(204).send();
};
