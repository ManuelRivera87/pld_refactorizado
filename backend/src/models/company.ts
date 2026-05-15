export type Company = {
  id: string;
  name: string;
  rfc: string | null;
  created_at: Date;
  updated_at: Date;
};

export type CreateCompanyInput = {
  name?: string;
  rfc?: string | null;
};

export type UpdateCompanyInput = {
  name?: string;
  rfc?: string | null;
};
