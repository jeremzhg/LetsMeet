import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import emailLogo from "../assets/images/email-logo.png";
import passwordLogo from "../assets/images/password-logo.png";
import { InputField } from "../components/fields/InputField";
import { HeroSection } from "../components/sections/AuthSection";
import { AuthButton } from "../components/buttons/AuthButton";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Memanggil API login dari folder backend (Asumsi di port 3000)
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Berhasil login:", data);
        // opsional: localStorage.setItem("token", data.token);
        navigate("/home");
      } else {
        alert(data.message || "Gagal login. Periksa kembali data Anda.");
      }
    } catch (error) {
      console.error("Kesalahan jaringan:", error);
      alert(
        "Tidak dapat terhubung ke server backend (Pastikan backend sudah nyala).",
      );
    }
  };

  return (
    <div className="font-roboto flex min-h-screen w-full text-gray-800">
      <HeroSection />

      <div className="flex w-full flex-col items-center justify-center bg-[#E6F6FF] p-8 sm:p-12 lg:w-1/2 xl:p-24">
        <form
          onSubmit={handleLogin}
          className="flex w-full max-w-md flex-col rounded-3xl border border-gray-100 bg-white p-8 drop-shadow-sm sm:p-10"
        >
          <InputField
            label="Email"
            type="email"
            placeholder="Enter your email"
            iconSrc={emailLogo}
            iconAlt="Email icon"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            iconSrc={passwordLogo}
            iconAlt="Password icon"
            containerClassName="mb-3"
            inputClassName="py-2.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Link
            to={""}
            className="mb-8 self-end text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Forgot your password?
          </Link>

          <AuthButton type="submit" text="Login" />

          <div className="mt-auto flex items-center justify-center gap-1.5 text-sm">
            <p className="text-gray-500">Don't have an account?</p>
            <Link
              to={"/register"}
              className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
