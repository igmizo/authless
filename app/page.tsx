"use client";

import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  generateWebAuthnLoginOptions,
  generateWebAuthnRegistrationOptions,
  verifyWebAuthnLogin,
  verifyWebAuthnRegistration,
} from "@/lib/webauthn";

export default function Home() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString();
    const type = formData.get("type")?.toString();

    if (!email) {
      return;
    }

    if (type === "register") {
      const response = await generateWebAuthnRegistrationOptions(email);

      if (!response.success || !response.data) {
        alert(response.message ?? "Something went wrong!");
        return;
      }

      const localResponse = await startRegistration({
        optionsJSON: response.data,
      });
      const verifyResponse = await verifyWebAuthnRegistration(localResponse);

      if (!verifyResponse.success) {
        alert(verifyResponse.message ?? "Something went wrong!");
        return;
      }

      alert("Registration successful!");
    } else {
      const response = await generateWebAuthnLoginOptions(email);

      if (!response.success || !response.data) {
        alert(response.message ?? "Something went wrong!");
        return;
      }

      const localResponse = await startAuthentication({
        optionsJSON: response.data,
      });
      const verifyResponse = await verifyWebAuthnLogin(localResponse);

      if (!verifyResponse.success) {
        alert(verifyResponse.message ?? "Something went wrong!");
        return;
      }

      alert("Login successful!");
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" />

        <div>
          <label>
            <input type="radio" name="type" value="register" defaultChecked />
            Register
          </label>

          <label>
            <input type="radio" name="type" value="login" />
            Login
          </label>
        </div>

        <input type="submit" value="Submit" />
      </form>
    </main>
  );
}
