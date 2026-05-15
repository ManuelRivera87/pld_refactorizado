import { database } from "../config/database.js";
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput
} from "../models/company.js";
import { HttpError } from "../utils/httpError.js";

const companyFields = `
  id,
  name,
  rfc,
  created_at,
  updated_at
`;

const normalizeName = (name: unknown) => {
  if (typeof name !== "string") {
    return "";
  }

  return name.trim();
};

const normalizeRfc = (rfc: unknown) => {
  if (typeof rfc !== "string") {
    return null;
  }

  const value = rfc.trim().toUpperCase();

  return value || null;
};

export const listCompanies = async (): Promise<Company[]> => {
  const result = await database.query<Company>(
    `SELECT ${companyFields} FROM companies ORDER BY name ASC`
  );

  return result.rows;
};

export const getCompanyById = async (id: string): Promise<Company> => {
  const result = await database.query<Company>(
    `SELECT ${companyFields} FROM companies WHERE id = $1 LIMIT 1`,
    [id]
  );
  const company = result.rows[0];

  if (!company) {
    throw new HttpError(404, "Company not found");
  }

  return company;
};

export const createCompany = async (input: CreateCompanyInput): Promise<Company> => {
  const name = normalizeName(input.name);
  const rfc = normalizeRfc(input.rfc);

  if (!name) {
    throw new HttpError(400, "Company name is required");
  }

  try {
    const result = await database.query<Company>(
      `INSERT INTO companies (name, rfc)
       VALUES ($1, $2)
       RETURNING ${companyFields}`,
      [name, rfc]
    );

    return result.rows[0];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "23505") {
      throw new HttpError(409, "Company name already exists");
    }

    throw error;
  }
};

export const updateCompany = async (
  id: string,
  input: UpdateCompanyInput
): Promise<Company> => {
  const currentCompany = await getCompanyById(id);
  const name = input.name === undefined ? currentCompany.name : normalizeName(input.name);
  const rfc = input.rfc === undefined ? currentCompany.rfc : normalizeRfc(input.rfc);

  if (!name) {
    throw new HttpError(400, "Company name is required");
  }

  try {
    const result = await database.query<Company>(
      `UPDATE companies
       SET name = $1, rfc = $2
       WHERE id = $3
       RETURNING ${companyFields}`,
      [name, rfc, id]
    );

    return result.rows[0];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "23505") {
      throw new HttpError(409, "Company name already exists");
    }

    throw error;
  }
};

export const deleteCompany = async (id: string): Promise<void> => {
  const result = await database.query("DELETE FROM companies WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    throw new HttpError(404, "Company not found");
  }
};
