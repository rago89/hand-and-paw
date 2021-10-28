/* eslint-disable no-undefined */
import state from "../../data-access/state/state.js";
import { loginUser } from "../../data-access/login/login.js";
import { navbar } from "../components/layout/navbar.js";

export const loginAuthHandler = async (event) => {
  event.preventDefault();
  const form = document.getElementById("login-form");
  const formData = new FormData(form);
  const userObj = {};
  for (const key of formData.keys()) {
    userObj[key] = formData.get(key);
  }
  state.email = userObj.email;
  state.password = userObj.password;
  const userLog = await loginUser();
  if (userLog.user.token) {
    state.token = userLog.user.token;
    state.userId = userLog.user.userId;
    state.password = undefined;
    state.isLoggedIn = true;
    localStorage.setItem("token", state.token);
    localStorage.setItem("userId", state.userId);
    localStorage.setItem("isLoggedIn", state.isLoggedIn);
    const header = document.getElementById("menu");
    const navbarEl = document.getElementById("main-navbar");
    header.removeChild(navbarEl);
    header.appendChild(navbar());
  }
  form.innerHTML = userLog.message;
};