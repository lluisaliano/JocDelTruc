import { AuthenticationData } from "../types/api";

// TODO THIS SEEMS UNREACHABLE FROM OUTSIDE LOCALHOST
// TODO Define API URL
const API_URL = "http://localhost:3000/login";

const TOKEN_KEY = "jwt";

export class Authentication {
  static async getToken(authData?: AuthenticationData) {
    const existingToken = localStorage.getItem(TOKEN_KEY);
    if (existingToken || !authData) {
      return existingToken;
    }
    // We will cancel fetch if 5 seconds have passed
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(authData),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const message = await response.json();
      if (message) {
        return Promise.reject(message.responseMessage);
      }
    }

    const { responseMessage, token } = await response.json();
    localStorage.setItem(TOKEN_KEY, token);
    return responseMessage;
  }

  static recoverToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  static deleteToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  // TODO Improve this is currently not used
  static async accessProtectedPage(page: string, token: string) {
    const response = await fetch(`${API_URL}/${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.text();
  }

  static getUserName() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return "";
    }
    const [, payload] = token.split(".");
    const data = JSON.parse(atob(payload));
    return data.userName;
  }
}
