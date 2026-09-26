import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import TextInput from "../components/TextInput";
import { fieldErrorsFromApiError } from "../utils/formErrors";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setPending(true);
    try {
      const { user, token } = await authApi.login(form);
      login(user, token);
      const redirectTo = location.state?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFieldErrors(fieldErrorsFromApiError(err));
      setFormError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">Đăng nhập</h1>
      <p className="mt-1 text-sm text-neutral-500">Chào mừng quay lại PinNest 👋</p>

      {formError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <FormField label="Email" error={fieldErrors.email}>
          <TextInput
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="ban@example.com"
            required
            autoFocus
          />
        </FormField>

        <FormField label="Mật khẩu" error={fieldErrors.password}>
          <TextInput
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            placeholder="••••••••"
            required
          />
        </FormField>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
