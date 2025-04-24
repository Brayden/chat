import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthResponse {
  success: boolean;
  message?: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  session: {
    id: string;
    expires_at: number;
  };
}

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("https://group-chat.brayden-b8b.workers.dev/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });

      const data: AuthResponse = await response.json();

      if (!data.success) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // Store the session and user data
      localStorage.setItem("session", data.session.id);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Direct navigation with page reload
      window.location.href = "/channel/0";
    } catch (error) {
      setError("Failed to sign in");
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white text-black p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Sign in to Chat
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                required
                className="relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="relative block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
