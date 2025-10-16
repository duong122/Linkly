import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;
const API_URL = `${API_BASE_URL}/api/users/me`; // Sử dụng biến môi trường

// 1. Định nghĩa Interface (kiểu dữ liệu) cho dữ liệu người dùng trả về từ API
interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number; // Đã sửa lỗi chính tả: 'followingsCount' -> 'followingCount'
  postsCount: number;
  isFollowing: boolean;
  createdAt: string;
}

// Định nghĩa Union Type cho state: UserProfile | null
type UserState = UserProfile | null;

export default function ProfileHeader() {
  // 2. Khai báo state với kiểu dữ liệu đã định nghĩa (UserState)
  const [user, setUser] = useState<UserState>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Khai báo kiểu dữ liệu cho error (string hoặc null)
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
            const response = await fetch(API_URL, {
            method: "GET",
            headers: {
              "Authorization" : `Bearer ${localStorage.getItem('authToken')}` 
            },
          });
          
        console.log("Fetch profile response: ", response);
        if (!response.ok) {
          // err đã được đổi tên thành error trong setError(err.message) ở code gốc, 
          // nhưng trong khối catch nó là một Error object, ta có thể dùng response.statusText
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UserProfile = await response.json();
        setUser(data);
      } catch (err) {
        // 3. Xử lý lỗi (err) - Ép kiểu cho err để truy cập message an toàn
        // (Đây là nơi lỗi 'err' thường xảy ra trong TS nếu không được khai báo kiểu)
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Failed to fetch user profile:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-8 mb-8 bg-card text-card-foreground border-border text-center">
        <p className="text-lg font-medium">Đang tải dữ liệu...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 mb-8 bg-card text-card-foreground border-border text-center text-red-500">
        <p className="text-lg font-medium">Lỗi khi tải hồ sơ: {error}</p>
        <p className="text-sm">Vui lòng kiểm tra API server.</p>
      </Card>
    );
  }

  if (!user) {
    // Trường hợp hiếm: isLoading=false, error=null nhưng user=null (nên không xảy ra)
    return null;
  }
  
  const getInitials = (fullName: string) => { // Định nghĩa kiểu string cho tham số
    if (!fullName) return 'NA';
    const parts = fullName.split(' ');
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  };

  return (
    <Card className="p-8 mb-8 bg-card text-card-foreground border-border">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <Avatar className="w-32 h-32">
          <AvatarImage src={user.avatarUrl} alt={`${user.fullName}'s profile picture`} /> 
          <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
             {getInitials(user.fullName)} 
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            {/* Sửa lỗi fullName */}
            <h1 className="text-2xl font-bold text-foreground">{user.fullName}</h1> 
            <Button className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground font-normal">
              Edit Profile
            </Button>
          </div>

          <div className="flex gap-8 justify-center md:justify-start mb-4">
            <div>
              <p className="font-semibold text-foreground">{user.postsCount}</p> 
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div>
              {/* Sửa lỗi followersCount */}
              <p className="font-semibold text-foreground">{user.followersCount}</p> 
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              {/* Sửa lỗi followingCount */}
              <p className="font-semibold text-foreground">{user.followingCount}</p> 
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>

          {/* Sửa lỗi bio */}
          <p className="text-foreground font-body">
            {user.bio} 
          </p>
        </div>
      </div>
    </Card>
  );
}