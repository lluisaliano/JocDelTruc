import { AuthenticationData } from "../types/api";

// TODO THIS SEEMS UNREACHABLE FROM OUTSIDE LOCALHOST
// TODO Define API URL
const API_URL = "http://192.168.1.62:3000/login";

const TOKEN_KEY = "jwt";

export class Authentication {
  static async getToken(authData?: AuthenticationData) {
    if (localStorage.getItem(TOKEN_KEY) || !authData) {
      return localStorage.getItem(TOKEN_KEY);
    }
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(authData),
    });

    // Parse the response
    const data = await response.json();

    if (!response.ok) {
      console.log(data.responseMessage);
      return Promise.reject(data.responseMessage);
    }

    const { responseMessage, token } = data;
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
}
