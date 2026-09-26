import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as userApi from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FormField from "../components/FormField";
import TextInput from "../components/TextInput";
import Avatar from "../components/Avatar";
import { fieldErrorsFromApiError } from "../utils/formErrors";

export default function ProfileEditPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ fullName: user?.fullName ?? "", age: user?.age ?? "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setPending(true);
    try {
      const updated = await userApi.updateMe({ ...form, avatarFile });
      updateUser(updated);
      toast.success("Cập nhật thông tin thành công");
      navigate("/profile");
    } catch (err) {
      setFieldErrors(fieldErrorsFromApiError(err));
      setFormError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-bold text-neutral-900">Sửa thông tin cá nhân</h1>

      {formError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar user={preview ? { avatar: preview, fullName: user?.fullName } : user} size={72} />
          <label className="cursor-pointer rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
            Đổi ảnh đại diện
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        <FormField label="Họ tên" error={fieldErrors.fullName}>
          <TextInput
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            error={fieldErrors.fullName}
            required
          />
        </FormField>

        <FormField label="Tuổi" error={fieldErrors.age}>
          <TextInput
            type="number"
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            error={fieldErrors.age}
            min={1}
            max={150}
          />
        </FormField>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
