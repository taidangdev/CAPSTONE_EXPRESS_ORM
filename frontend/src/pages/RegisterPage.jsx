import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import TextInput from "../components/TextInput";
import { fieldErrorsFromApiError } from "../utils/formErrors";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", fullName: "", age: "" });
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
      const payload = { ...form, age: form.age ? Number(form.age) : undefined };
      const { user, token } = await authApi.register(payload);
      login(user, token);
      navigate("/", { replace: true });
    } catch (err) {
      setFieldErrors(fieldErrorsFromApiError(err));
      setFormError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">Tạo tài khoản</h1>
      <p className="mt-1 text-sm text-neutral-500">Tham gia PinNest để lưu và chia sẻ ảnh ✨</p>

      {formError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <FormField label="Họ tên" error={fieldErrors.fullName}>
          <TextInput
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            error={fieldErrors.fullName}
            placeholder="Nguyễn Văn A"
            required
            autoFocus
          />
        </FormField>

        <FormField label="Email" error={fieldErrors.email}>
          <TextInput
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="ban@example.com"
            required
          />
        </FormField>

        <FormField label="Mật khẩu" error={fieldErrors.password}>
          <TextInput
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            placeholder="Tối thiểu 6 ký tự"
            required
          />
        </FormField>

        <FormField label="Tuổi (không bắt buộc)" error={fieldErrors.age}>
          <TextInput
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            error={fieldErrors.age}
            min={1}
            max={150}
          />
        </FormField>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
