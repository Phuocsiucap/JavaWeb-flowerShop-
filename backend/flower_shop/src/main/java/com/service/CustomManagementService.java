package com.service;

import com.dto.request.UserSearchRequest;
import com.model.User;

import java.util.List;
import java.util.Optional;

public interface CustomManagementService {

   

    /**
     * Lấy danh sách người dùng, có thể áp dụng bộ lọc theo tên, email, vai trò,...
     *
     * @param searchRequest Tiêu chí tìm kiếm người dùng.
     * @return Danh sách người dùng thỏa mãn điều kiện lọc.
     */
    List<User> getUsers(UserSearchRequest searchRequest);

    /**
     * Lấy thông tin người dùng theo ID.
     *
     * @param userId ID của người dùng.
     * @return Optional chứa người dùng nếu tìm thấy.
     */
    Optional<User> getUserById(String userId);

    /**
     * Tạo một người dùng mới.
     *
     * @param user Đối tượng người dùng cần tạo.
     * @return Người dùng sau khi được lưu và gán ID.
     */
    User createUser(User user);

    /**
     * Cập nhật thông tin người dùng hiện có.
     *
     * @param user Đối tượng người dùng chứa thông tin cần cập nhật.
     * @return true nếu cập nhật thành công, ngược lại false.
     */
    boolean updateUser(User user);

    /**
     * Xóa người dùng theo ID.
     *
     * @param userId ID của người dùng cần xóa.
     * @return true nếu xóa thành công, ngược lại false.
     */
    boolean deleteUser(String userId);
}
