import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext"; // <- use context

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login, register } = useAuth(); // <- use context functions

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let success = false;
    if (mode === "login") {
      success = await login(form.email, form.password);
    } else {
      success = await register(form.name, form.email, form.password);
    }

    setLoading(false);

    if (success) {
      toast.success(
        mode === "login" ? "Login successful!" : "Account created and logged in!"
      );
      navigate("/dashboard"); // reactive redirect
    } else {
      toast.error("Authentication failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-xl rounded-2xl bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            {mode === "login" ? "Login" : "Register"}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            {mode === "login"
              ? "Sign in to your account"
              : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "login"
                ? "Login"
                : "Register"}
            </Button>
            <p className="text-xs text-center text-gray-500">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() =>
                  setMode(mode === "login" ? "register" : "login")
                }
              >
                {mode === "login" ? "Register" : "Login"}
              </span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
