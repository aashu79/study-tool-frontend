import DashboardLayout from "../components/common/DashboardLayout";
import { Card, Descriptions, Avatar, Spin, Tag } from "antd";
import { FiUser, FiMail, FiCalendar, FiBookOpen } from "react-icons/fi";
import { useAuthStore } from "../lib/store/auth.store";
import { useCurrentUser } from "../lib/hooks/useAuth";
import { useProfilePicture } from "../lib/hooks/useFile";

const Profile = () => {
  const { user } = useAuthStore();
  const { isLoading } = useCurrentUser();
  const { data: profilePicData } = useProfilePicture();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-slate-200">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <Avatar
              size={120}
              src={profilePicData?.url}
              className="bg-gradient-to-br from-teal-500 to-cyan-600 text-3xl font-bold border-4 border-teal-100"
            >
              {!profilePicData?.url && user?.full_name
                ? getInitials(user.full_name)
                : "U"}
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {user?.full_name || "User"}
              </h1>
              <p className="text-slate-600 flex items-center gap-2 justify-center md:justify-start">
                <FiMail className="text-teal-600" />
                {user?.email}
              </p>
              <Tag color="cyan" className="mt-2">
                <FiBookOpen className="inline mr-1" />
                {user?.educationLevel}
              </Tag>
            </div>
          </div>

          <Descriptions
            bordered
            column={{ xs: 1, sm: 1, md: 2 }}
            size="middle"
            className="[&_.ant-descriptions-item-label]:font-semibold [&_.ant-descriptions-item-label]:bg-slate-50"
          >
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <FiUser className="text-teal-600" />
                  Full Name
                </span>
              }
            >
              {user?.full_name}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <FiMail className="text-teal-600" />
                  Email Address
                </span>
              }
            >
              {user?.email}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <FiBookOpen className="text-teal-600" />
                  Education Level
                </span>
              }
            >
              {user?.educationLevel}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <FiCalendar className="text-teal-600" />
                  Member Since
                </span>
              }
            >
              {user?.created_at ? formatDate(user.created_at) : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <FiCalendar className="text-teal-600" />
                  Last Login
                </span>
              }
              span={2}
            >
              {user?.last_login ? formatDate(user.last_login) : "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
