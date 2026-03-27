import { Link } from "react-router-dom";
import LoginBg from "../assets/images/login-bg.png";

export const LoginPage = () => {
  return (
    <div className="flex w-full min-h-screen">
      <div className="hidden lg:flex w-1/2 relative">
        <div
          className="flex items-center justify-center h-screen w-full bg-center bg-cover"
          style={{ backgroundImage: `url(${LoginBg})` }}
        >
          <div className="">
            <h2 className="text-white font-roboto font-bold">
              Login into your account
            </h2>
            <p className="text-[#FFFFFF]/50">
              Welcome back! Pick up where you left off.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 bg-gray-900 shadow-2xl relative z-20">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Sign in to your account
            </h1>
            <p className="text-gray-400 font-medium text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-emerald-400 hover:text-emerald-300 hover:underline transition-all font-semibold"
              >
                Sign up today
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-5">
              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-500 shadow-inner"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-500 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-gray-800 border-gray-700 rounded text-emerald-500 focus:ring-emerald-500/50 cursor-pointer transition-colors"
                />
                <label
                  htmlFor="remember-me"
                  className="block text-sm text-gray-400 cursor-pointer select-none hover:text-gray-300 transition-colors"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/20 text-sm font-extrabold text-gray-950 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social login */}
          <div className="mt-6 flex gap-4">
            <button className="w-full flex justify-center px-4 py-2.5 border border-gray-700 rounded-xl shadow-sm bg-gray-800/50 text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all cursor-pointer">
              Google
            </button>
            <button className="w-full flex justify-center px-4 py-2.5 border border-gray-700 rounded-xl shadow-sm bg-gray-800/50 text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all cursor-pointer">
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
