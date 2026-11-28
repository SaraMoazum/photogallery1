import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Amplify } from "aws-amplify";
import "./index.css";
import App from "./App.jsx";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-south-1_zgWUPmT0J",
      userPoolClientId: "60feu5e6ptka4a0kjgsofddlkp",
      loginWith: {
        oauth: {
          domain: "ap-south-1zgwupmt0j.auth.ap-south-1.amazoncognito.com",
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [
            "http://localhost:5173/",
            "https://main.d1k8cqh8xrep15.amplifyapp.com/",
          ],
          redirectSignOut: [
            "http://localhost:5173/",
            "https://main.d1k8cqh8xrep15.amplifyapp.com/",
          ],
          responseType: "code",
        },
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
