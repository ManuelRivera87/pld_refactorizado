import axios from "axios";
import { Building2, Pencil, Save, Trash2, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  createCompanyRequest,
  deleteCompanyRequest,
  listCompaniesRequest,
  updateCompanyRequest,
  type CompanyItem
} from "../api/companiesApi";
import { FormError } from "../components/FormError";

type CompanyFormState = {
  id: string | null;
  name: string;
  rfc: string;
};

const emptyForm: CompanyFormState = {
  id: null,
  name: "",
  rfc: ""
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "No se pudo guardar la empresa.";
  }

  return "No se pudo guardar la empresa.";
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

export function CompanyCatalogPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [form, setForm] = useState<CompanyFormState>(emptyForm);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  const loadCompanies = async () => {
    setIsLoading(true);
    setError("");

    try {
      const nextCompanies = await listCompaniesRequest();
      setCompanies(nextCompanies);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCompanies();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const payload = {
      name: form.name,
      rfc: form.rfc || null
    };

    try {
      if (form.id) {
        await updateCompanyRequest(form.id, payload);
      } else {
        await createCompanyRequest(payload);
      }

      setForm(emptyForm);
      await loadCompanies();
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (company: CompanyItem) => {
    setError("");
    setForm({
      id: company.id,
      name: company.name,
      rfc: company.rfc ?? ""
    });
  };

  const handleDelete = async (company: CompanyItem) => {
    const confirmed = window.confirm(`Eliminar empresa ${company.name}?`);

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await deleteCompanyRequest(company.id);
      await loadCompanies();
      if (form.id === company.id) {
        setForm(emptyForm);
      }
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    }
  };

  return (
    <div className="admin-users-page">
      <section className="admin-form-panel">
        <div className="section-heading">
          <p className="eyebrow">Catalogos</p>
          <h2>{isEditing ? "Modificar empresa" : "Nueva empresa"}</h2>
          <p>Registra las empresas disponibles para los procesos PLD.</p>
        </div>

        <form className="admin-user-form" onSubmit={handleSubmit}>
          <label>
            <span>Nombre de empresa</span>
            <input
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Autocom Nissan"
              required
              type="text"
              value={form.name}
            />
          </label>

          <label>
            <span>RFC</span>
            <input
              maxLength={13}
              onChange={(event) =>
                setForm({ ...form, rfc: event.target.value.toUpperCase() })
              }
              placeholder="AUT000000XXX"
              type="text"
              value={form.rfc}
            />
          </label>

          <FormError message={error} />

          <div className="form-actions">
            <button className="primary-button" disabled={isSaving} type="submit">
              {isEditing ? (
                <Save aria-hidden="true" size={18} strokeWidth={2} />
              ) : (
                <Building2 aria-hidden="true" size={18} strokeWidth={2} />
              )}
              <span>{isSaving ? "Guardando..." : isEditing ? "Actualizar" : "Registrar"}</span>
            </button>

            {isEditing ? (
              <button
                className="ghost-button"
                type="button"
                onClick={() => setForm(emptyForm)}
              >
                <X aria-hidden="true" size={18} strokeWidth={2} />
                <span>Cancelar</span>
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="users-table-panel">
        <div className="section-heading section-heading-row">
          <div>
            <p className="eyebrow">Empresas</p>
            <h2>Empresas registradas</h2>
          </div>
          <span className="counter-badge">{companies.length}</span>
        </div>

        {isLoading ? (
          <p>Cargando empresas...</p>
        ) : companies.length === 0 ? (
          <p>No hay empresas registradas todavia.</p>
        ) : (
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>RFC</th>
                  <th>Creada</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.name}</td>
                    <td>
                      <span className="role-pill">{company.rfc || "Sin RFC"}</span>
                    </td>
                    <td>{formatDate(company.created_at)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          title="Modificar empresa"
                          type="button"
                          onClick={() => handleEdit(company)}
                        >
                          <Pencil aria-hidden="true" size={16} strokeWidth={2} />
                        </button>
                        <button
                          className="icon-button danger"
                          title="Eliminar empresa"
                          type="button"
                          onClick={() => void handleDelete(company)}
                        >
                          <Trash2 aria-hidden="true" size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
