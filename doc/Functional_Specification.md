Yêu cầu chỉ tạo API Back End (có thể code luôn Front End để nâng cao năng lực bản thân) dựa theo các layout đã có ở phía dưới:
Bạn có thể tạo database theo mô hình ERD phía dưới, hoặc tự mình phân tích.
Ngoài các tính năng yêu cầu, có thể thêm và mở rộng các tính năng mà bạn muốn (khuyến khích).
Tạo các API để thao tác dữ liệu tương ứng các trang phía dưới:
      + POST trang đăng ký.
      + POST trang đăng nhập.
   * Trang chủ:
      + GET danh sách ảnh về.
      + GET tìm kiếm danh sách ảnh theo tên. 
   * Trang chi tiết:
      + GET thông tin ảnh và người tạo ảnh bằng id ảnh.
      + GET thông tin bình luận theo id ảnh.
      + GET thông tin đã lưu hình này chưa theo id ảnh (dùng để kiểm tra ảnh đã lưu hay chưa ở nút Save).
      + POST để lưu thông tin bình luận của người dùng với hình ảnh.
  * Trang quản lý ảnh:
      + GET thông tin user 
      + GET danh sách ảnh đã lưu theo user id.
      + GET danh sách ảnh đã tạo theo user id.
      + DELETE xóa ảnh đã tạo theo id ảnh.
      *Trang thêm ảnh:
     + POST thêm một ảnh của user. 
  *Chỉnh sửa thông tin cá nhân:
     + PUT thông tin cá nhân của user.

Các API phải gắn token jwt để bảo mật thông tin.
Các API lấy thông tin cá nhân từ user thì nên lấy từ token để xử lý.

Làm xong export file json từ Postman ra và nộp chung với source của mình. (Phần này để sau, k lan man vào )
Bài làm phải được up lên Git và nộp link public.