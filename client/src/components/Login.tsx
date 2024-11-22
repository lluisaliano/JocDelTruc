import { useState } from "react";

import { AuthenticationData } from "../types/api";
import { Authentication } from "../apis/auth";
import { toast } from "react-toastify";

import { PageProps } from "../types/params";

export function Login({ setAppPage }: PageProps) {
  const [formData, setFormData] = useState<AuthenticationData>({
    userName: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent Default Behavour
    e.preventDefault();
    // Generate JWT and notify with a toast
    await toast.promise(Authentication.getToken(formData), {
      pending: "Iniciant Sessió",
      // data property gets message from rejected o settled (Read React-toastify docs)
      success: {
        render({ data }) {
          return `${data}`;
        },
      },
      error: {
        render({ data }) {
          return `${data}`;
        },
      },
    });

    setAppPage("game");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="userName">Nom d'usuari</label>
          <input
            name="userName"
            id="userName"
            type="text"
            placeholder="Usuari"
            value={formData.userName}
            onChange={handleFormChange}
            required
          ></input>
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            name="password"
            id="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleFormChange}
            required
          ></input>
        </div>
        <button type="submit">Iniciar Sessió</button>
      </form>
    </>
  );
}
