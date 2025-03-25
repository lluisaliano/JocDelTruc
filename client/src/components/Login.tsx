import { useState } from "react";

import { AuthenticationData } from "../types/api";
import { Authentication } from "../apis/auth";
import { toast } from "react-toastify";

import { PageProps } from "../types/params";

import "../styles/Login.css";

export function Login({ setAppPage }: PageProps) {
  const [formData, setFormData] = useState<AuthenticationData>({
    userName: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent Default Behavour
    e.preventDefault();
    // Generate JWT and notify with a toast
    await toast
      .promise(Authentication.getToken(formData), {
        pending: "Iniciant Sessió",
        // data property gets message from rejected o settled (Read React-toastify docs)
        success: {
          render({ data }) {
            setAppPage("gameManager");
            return `${data}`;
          },
        },
        error: {
          render({ data }) {
            return `${data}`;
          },
        },
      })
      .catch((e) => console.log(e)); // This will jump if server is down or unreachable
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      return {
        ...prevData,
        [name]: value.trim(),
      };
    });
  };

  return (
    <div className="backgroundLogin">
      <div className="loginWrapper">
        <form className="loginForm" onSubmit={handleSubmit}>
          <h2>Truc Menorquí</h2>
          <div className="inputGroup">
            <input
              name="userName"
              id="userName"
              type="text"
              placeholder=" "
              value={formData.userName}
              onChange={handleFormChange}
              required
            />
            <label htmlFor="userName">Nom d'usuari</label>
          </div>
          <div className="inputGroup">
            <input
              name="password"
              id="password"
              type="password"
              placeholder=" "
              value={formData.password}
              onChange={handleFormChange}
              required
            />
            <label htmlFor="password">Contraseña</label>
          </div>
          <button type="submit">Iniciar Sessió</button>
        </form>
      </div>
    </div>
  );
}
