import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, X } from "lucide-react";
import * as imageApi from "../api/imageApi";
import { useToast } from "../context/ToastContext";
import FormField from "../components/FormField";
import TextInput from "../components/TextInput";
import { fieldErrorsFromApiError } from "../utils/formErrors";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function UploadPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ name: "", description: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(false);

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFormError("Chỉ chấp nhận file ảnh định dạng JPEG, PNG, WEBP hoặc GIF");
      return;
    }
    if (selected.size > MAX_SIZE) {
      setFormError("File ảnh vượt quá dung lượng cho phép (tối đa 5MB)");
      return;
    }

    setFormError("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setFormError("Vui lòng chọn ảnh để đăng");
      return;
    }

    setFormError("");
    setFieldErrors({});
    setPending(true);
    setProgress(0);

    try {
      const image = await imageApi.createImage({
        ...form,
        file,
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      toast.success("Đăng ảnh thành công");
      navigate(`/images/${image.id}`);
    } catch (err) {
      setFieldErrors(fieldErrorsFromApiError(err));
      setFormError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-bold text-neutral-900">Đăng ảnh mới</h1>
      <p className="mt-1 text-sm text-neutral-500">Chia sẻ khoảnh khắc của bạn với mọi người.</p>

      {formError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {preview ? (
          <div className="relative overflow-hidden rounded-2xl bg-neutral-100">
            <img src={preview} alt="Xem trước" className="max-h-96 w-full object-contain" />
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Bỏ chọn ảnh"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 py-12 text-neutral-500 hover:border-brand-400 hover:text-brand-600">
            <UploadCloud size={32} />
            <span className="text-sm font-medium">Bấm để chọn ảnh</span>
            <span className="text-xs text-neutral-400">JPEG, PNG, WEBP, GIF — tối đa 5MB</span>
            <input
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        <FormField label="Tên ảnh" error={fieldErrors.name}>
          <TextInput
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={fieldErrors.name}
            placeholder="Đặt tên cho ảnh của bạn"
            required
          />
        </FormField>

        <FormField label="Mô tả (không bắt buộc)" error={fieldErrors.description}>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            placeholder="Vài dòng về bức ảnh này..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </FormField>

        {pending && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full bg-brand-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? `Đang đăng... ${progress}%` : "Đăng ảnh"}
        </button>
      </form>
    </div>
  );
}
