import { motion } from "framer-motion";
import {
  NotebookTabs,
  Eye,
  EyeOff,
  Disc,
  FolderTree,
  Repeat,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import { useAppContext } from "../hooks/useAppContext";

export default function AuthPage({ mode = "login" }) {
  const isLogin = mode === "login";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup, user } = useAppContext();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      addToast("Please fill in all fields", "error");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (!isLogin && password.length < 6) {
      addToast("Password must be at least 6 characters", "error");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        addToast("Welcome back!");
      } else {
        await signup(email, password, fullName);
        addToast("Account created successfully!");
      }
      navigate("/");
    } catch (error) {
      addToast(error.message || "Authentication failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComingSoon = (e) => {
    e.preventDefault();
    addToast("🚧 This feature is coming soon!");
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-gray-900">
      {/* LEFT PANEL - ILLUSTRATION */}
      <div className="hidden w-[40%] flex-col justify-between border-r border-gray-100 bg-gray-50/50 p-12 lg:flex xl:w-[45%]">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-violet-600 text-white shadow-sm">
              <NotebookTabs className="size-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Notebook</span>
          </Link>
          <div className="mt-16 max-w-md">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Your ideas, <br />
              <span className="text-violet-600">
                {isLogin ? "always with you." : "beautifully organized."}
              </span>
            </h1>
            <p className="mt-4 text-[1.1rem] leading-relaxed text-gray-600">
              {isLogin
                ? "Capture your thoughts, organize seamlessly, and never lose what matters."
                : "Create your free account and start capturing what matters."}
            </p>
          </div>
        </div>

        <div className="relative flex-1 flex items-center justify-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            src="/hero-writing.png"
            alt="Notebook illustration"
            className="w-full max-w-sm drop-shadow-2xl"
            style={{ filter: "drop-shadow(0 20px 40px rgba(139, 92, 246, 0.15))" }}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600">
              <Disc className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {isLogin ? "Write without limits" : "Capture instantly"}
              </h3>
              <p className="text-sm text-gray-500">
                {isLogin ? "Jot down anything, anytime." : "Quickly write down ideas."}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600">
              <FolderTree className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {isLogin ? "Stay organized" : "Organize effortlessly"}
              </h3>
              <p className="text-sm text-gray-500">
                {isLogin ? "Find, sort and structure with ease." : "Keep everything in one place."}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600">
              <Repeat className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {isLogin ? "Access anywhere" : "Sync everywhere"}
              </h3>
              <p className="text-sm text-gray-500">Your notes, across all your devices.</p>
            </div>
          </div>
          <p className="mt-8 text-xs font-medium text-gray-400">
            © 2024 Notebook. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex flex-1 flex-col justify-center px-8 sm:px-16 lg:px-24">
        {/* Mobile Header Logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-violet-600 text-white shadow-sm">
              <NotebookTabs className="size-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Notebook</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {isLogin ? "Welcome back 👋" : "Create your account ✨"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {isLogin ? "Login to continue to your account" : "Sign up to get started with Notebook"}
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-violet-400 focus:ring-3 focus:ring-violet-100"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-violet-400 focus:ring-3 focus:ring-violet-100"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                {isLogin && (
                  <button type="button" onClick={handleComingSoon} className="text-sm font-semibold text-violet-600 hover:text-violet-700">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  className="h-11 w-full rounded-lg border border-gray-200 pl-4 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-violet-400 focus:ring-3 focus:ring-violet-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500">Use 8+ characters with a mix of letters, numbers & symbols</p>
              )}
            </div>

            {!isLogin && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="h-11 w-full rounded-lg border border-gray-200 pl-4 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-violet-400 focus:ring-3 focus:ring-violet-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            )}

            {isLogin ? (
              <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" id="remember" className="rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                <label htmlFor="remember" className="text-sm font-medium text-gray-700">Remember me</label>
              </div>
            ) : (
              <div className="flex items-start gap-2 mt-1">
                <input type="checkbox" id="terms" className="mt-1 rounded border-gray-300 text-violet-600 focus:ring-violet-500" required />
                <label htmlFor="terms" className="text-sm font-medium text-gray-700">
                  I agree to the <button type="button" onClick={handleComingSoon} className="text-violet-600 hover:underline">Terms of Service</button> and <button type="button" onClick={handleComingSoon} className="text-violet-600 hover:underline">Privacy Policy</button>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="size-5 animate-spin" /> : (isLogin ? "Log in" : "Create account")}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500 font-medium">
                or {isLogin ? "continue with" : "sign up with"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={handleComingSoon} className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="size-5" />
              Continue with Google
            </button>
            <button onClick={handleComingSoon} className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              <svg viewBox="0 0 384 512" className="size-5 text-black" fill="currentColor">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
              Continue with Apple
            </button>
            <button onClick={handleComingSoon} className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              <svg viewBox="0 0 23 23" className="size-5" fill="none">
                <path d="M11.4 0H0V11.4H11.4V0Z" fill="#f35325"/>
                <path d="M23 0H11.6V11.4H23V0Z" fill="#81bc06"/>
                <path d="M11.4 11.6H0V23H11.4V11.6Z" fill="#05a6f0"/>
                <path d="M23 11.6H11.6V23H23V11.6Z" fill="#ffba08"/>
              </svg>
              Continue with Microsoft
            </button>
          </div>

          <div className="mt-8 text-center text-sm font-medium text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link to={isLogin ? "/signup" : "/login"} className="text-violet-600 hover:underline">
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
