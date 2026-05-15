import axios from "axios";
import { Pencil, Save, Trash2, UserPlus, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  createUserRequest,
  deleteUserRequest,
  listUsersRequest,
  updateUserRequest,
  type UserItem
} from "../api/usersApi";
import { FormError } from "../components/FormError";

type UserFormState = {
  id: string | null;
  email: string;
  password: string;
  role: string;
};

const emptyForm: UserFormState = {
  id: null,
  email: "",
  password: "",
  role: "user"
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "No se pudo guardar el usuario.";
  }

  return "No se pudo guardar el usuario.";
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

export function UserAdministrationPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");

    try {
      const nextUsers = await listUsersRequest();
      setUsers(nextUsers);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const payload = {
      email: form.email,
      password: form.password || undefined,
      role: form.role
    };

    try {
      if (form.id) {
        await updateUserRequest(form.id, payload);
      } else {
        await createUserRequest(payload);
      }

      setForm(emptyForm);
      await loadUsers();
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (user: UserItem) => {
    setError("");
    setForm({
      id: user.id,
      email: user.email,
      password: "",
      role: user.role
    });
  };

  const handleDelete = async (user: UserItem) => {
    const confirmed = window.confirm(`Eliminar usuario ${user.email}?`);

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await deleteUserRequest(user.id);
      await loadUsers();
      if (form.id === user.id) {
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
          <p className="eyebrow">Usuarios</p>
          <h2>{isEditing ? "Modificar usuario" : "Registro nuevo"}</h2>
          <p>
            Solo se permiten cuentas con dominio corporativo
            <strong> @autocom.mx</strong>.
          </p>
        </div>

        <form className="admin-user-form" onSubmit={handleSubmit}>
          <label>
            <span>Correo</span>
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="usuario@autocom.mx"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              autoComplete={isEditing ? "new-password" : "new-password"}
              minLength={6}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              placeholder={isEditing ? "Dejar en blanco para conservar" : "Password"}
              required={!isEditing}
              type="password"
              value={form.password}
            />
          </label>

          <label>
            <span>Rol</span>
            <select
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              value={form.role}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </label>

          <FormError message={error} />

          <div className="form-actions">
            <button className="primary-button" disabled={isSaving} type="submit">
              {isEditing ? (
                <Save aria-hidden="true" size={18} strokeWidth={2} />
              ) : (
                <UserPlus aria-hidden="true" size={18} strokeWidth={2} />
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
            <p className="eyebrow">Registrados</p>
            <h2>Usuarios del sistema</h2>
          </div>
          <span className="counter-badge">{users.length}</span>
        </div>

        {isLoading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>
                      <span className="role-pill">{user.role}</span>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          title="Modificar usuario"
                          type="button"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil aria-hidden="true" size={16} strokeWidth={2} />
                        </button>
                        <button
                          className="icon-button danger"
                          title="Eliminar usuario"
                          type="button"
                          onClick={() => void handleDelete(user)}
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
