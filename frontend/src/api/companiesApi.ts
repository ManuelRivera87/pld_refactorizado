import { http } from "./http";

export type CompanyItem = {
  id: string;
  name: string;
  rfc: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveCompanyPayload = {
  name: string;
  rfc?: string | null;
};

export const listCompaniesRequest = async () => {
  const { data } = await http.get<{ companies: CompanyItem[] }>("/empresas");

  return data.companies;
};

export const createCompanyRequest = async (payload: SaveCompanyPayload) => {
  const { data } = await http.post<{ company: CompanyItem }>("/empresas", payload);

  return data.company;
};

export const updateCompanyRequest = async (
  id: string,
  payload: SaveCompanyPayload
) => {
  const { data } = await http.put<{ company: CompanyItem }>(
    `/empresas/${id}`,
    payload
  );

  return data.company;
};

export const deleteCompanyRequest = async (id: string) => {
  await http.delete(`/empresas/${id}`);
};
