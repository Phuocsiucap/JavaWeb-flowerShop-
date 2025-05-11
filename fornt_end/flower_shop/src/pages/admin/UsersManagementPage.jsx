// pages/admin/users/index.js
import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import AppLayout from '../../components/admin/Layout';
import PageHeader from '../../components/admin/PageHeader';
import UserTable from '../../components/admin/users/UserTable';
import UserFilters from '../../components/admin/users/UserFilters';
import UserActionButtons from '../../components/admin/users/UserActionButtons';
import AddUserModal from '../../components/admin/users/AddUserModal';
import EditUserModal from '../../components/admin/users/EditUserModal';
import DeleteConfirmModal from '../../components/admin/users/DeleteConfirmModal';

const UsersManagement = () => {
  const { verifyTokenAdmin, getAllUsers, createUser, updateUser, deleteUser } = useAdmin();
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const valid = await verifyTokenAdmin();
        setIsTokenValid(valid);
        if (valid) {
          fetchUsers();
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsTokenValid(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkToken();
  }, [verifyTokenAdmin ]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers || []);
      setFilteredUsers(fetchedUsers || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters whenever filter conditions change
    filterUsers();
  }, [searchTerm, roleFilter, statusFilter, users]);

  const filterUsers = () => {
    let result = [...users];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(user => 
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }
    
    // Filter by user role
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(result);
  };  
  const handleAddUser = async (newUser) => {
    try {
      const result = await createUser(newUser);
      
      if (result.success) {
        // Đợi fetchUsers hoàn thành trước khi return kết quả
        await fetchUsers();
        return {
          success: true,
          message: "Thêm người dùng thành công!",
          user: result.user
        };
      } else {
        return {
          success: false,
          message: result.message || "Có lỗi xảy ra khi thêm người dùng!"
        };
      }
    } catch (error) {
      console.error("Error adding user:", error);
      return { 
        success: false, 
        message: "Có lỗi xảy ra khi thêm người dùng!" 
      };
    }
  };
  const handleEditUser = async (updatedUser) => {
    try {
      const result = await updateUser(updatedUser.id, updatedUser);
      if (result.success) {
        await fetchUsers();
        setTimeout(() => {
          setIsEditModalOpen(false);
        }, 3000);
        return { success: true, message: "Cập nhật người dùng thành công!" };
      } else {
        return { success: false, message: result.message || "Có lỗi xảy ra khi cập nhật người dùng!" };
      }
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, message: "Có lỗi xảy ra khi cập nhật người dùng!" };
    }
  };
  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        const result = await deleteUser(selectedUser.id);
        if (result.success) {
          await fetchUsers();
          setTimeout(() => {
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
          }, 3000);
          return { success: true, message: "Xóa người dùng thành công!" };
        } else {
          return { success: false, message: result.message || "Có lỗi xảy ra khi xóa người dùng!" };
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, message: "Có lỗi xảy ra khi xóa người dùng!" };
      }
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader 
          title="Quản lý người dùng" 
          description="Quản lý thông tin tài khoản người dùng trong hệ thống"
        />
        
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <UserFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
            
            <UserActionButtons 
              onAddUser={() => setIsAddModalOpen(true)}
            />
          </div>
          
          <UserTable 
            users={filteredUsers}
            onEditUser={openEditModal}
            onDeleteUser={openDeleteModal}
          />
        </div>
      </div>
      
      {/* Modals */}
      <AddUserModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddUser={handleAddUser}
      />
      
      <EditUserModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onEditUser={handleEditUser}
      />
      
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteUser}
        userName={selectedUser?.fullName}
      />
    </AppLayout>
  );
};

export default UsersManagement;