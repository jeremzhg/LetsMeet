import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import emailLogo from "../assets/images/email-logo.png";
import passwordLogo from "../assets/images/password-logo.png";
import { InputField } from "../components/fields/InputField";
import { HeroSection } from "../components/sections/AuthSection";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<"org" | "corp">("org");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`http://localhost:3000/auth/${loginType}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Berhasil login:", data);
        const isCorp = data?.role === "corporation" || loginType === "corp";
        navigate(isCorp ? "/corp/dashboard" : "/org/dashboard");
      } else {
        setErrorMessage(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Kesalahan jaringan:", error);
      setErrorMessage("Unable to connect to the server. Please ensure the backend is running.");
    }
  };

  return (
    <div className="font-roboto flex min-h-screen w-full text-gray-800">
      <HeroSection />

      <div className="flex w-full flex-col justify-center bg-[#E6F6FF] p-8 sm:p-12 lg:w-1/2 xl:p-24">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#2563EB] sm:text-5xl mb-4 leading-tight">
              Login <br /> into your account
            </h1>
            <p className="text-lg font-semibold text-[#659BDF] sm:text-xl leading-snug">
              Welcome back! Pick up where you left off.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="flex flex-col rounded-[2.5rem] bg-white p-8 sm:p-10 shadow-sm"
          >
            <div className="relative mb-6 flex w-full rounded-full bg-gray-200 p-1">
              <div
                className={`absolute left-1 top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-[#2563EB] shadow-md transition-transform duration-300 ease-in-out ${
                  loginType === "corp" ? "translate-x-full" : "translate-x-0"
                }`}
              ></div>
              <button
                type="button"
                onClick={() => setLoginType("org")}
                className={`relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors duration-300 ${
                  loginType === "org"
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Organization
              </button>
              <button
                type="button"
                onClick={() => setLoginType("corp")}
                className={`relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors duration-300 ${
                  loginType === "corp"
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Corporation
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 text-center text-sm font-medium text-red-500">
                {errorMessage}
              </div>
            )}
            <InputField
              label="Email"
              type="email"
              placeholder="example.@gmail.com"
              iconSrc={emailLogo}
              iconAlt="Email icon"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Your password"
              iconSrc={passwordLogo}
              iconAlt="Password icon"
              containerClassName="mb-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              rightElement={
                <button type="button" className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              }
            />

            <div className="mb-8">
              <Link
                to={""}
                className="text-sm font-medium text-blue-500 underline transition-colors hover:text-blue-600"
              >
                Forgot password?
              </Link>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-800">
                Don't have an account?{" "}
                <Link
                  to={"/register"}
                  className="font-medium text-blue-500 underline transition-colors hover:text-blue-600"
                >
                  Sign Up
                </Link>
              </div>
              <button
                type="submit"
                className="rounded-full bg-[#005a8d] px-8 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#004a75] transition-all"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
