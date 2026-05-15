const autocomDomain = "@autocom.mx";

export const normalizeEmail = (email: unknown) => {
  if (typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
};

export const isAutocomEmail = (email: string) => email.endsWith(autocomDomain);
