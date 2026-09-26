import cloudinary from "../config/cloudinary.js";

// Nhận buffer từ multer (memoryStorage) và đẩy lên Cloudinary bằng luồng
// (stream), không cần ghi file tạm ra ổ đĩa.
export const uploadImage = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      });
    });
    uploadStream.end(buffer);
  });
};

// Xoá không lỗi nếu publicId không tồn tại nữa (Cloudinary trả result "not
// found" thay vì ném lỗi), nên chỗ gọi hàm này không cần try/catch riêng.
export const deleteImage = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

export default { uploadImage, deleteImage };
