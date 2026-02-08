import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiTarget, FiLayers, FiMessageCircle } from "react-icons/fi";

interface ActionButton {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  type?: "primary" | "default";
}

const QuickActions = () => {
  const navigate = useNavigate();

  const actions: ActionButton[] = [
    {
      icon: <FiUpload size={18} />,
      label: "Upload New",
      onClick: () => navigate("/upload"),
      type: "primary",
    },
    {
      icon: <FiTarget size={18} />,
      label: "Start Quiz",
      onClick: () => console.log("Start Quiz"),
    },
    {
      icon: <FiLayers size={18} />,
      label: "Review Flashcards",
      onClick: () => console.log("Review Flashcards"),
    },
    {
      icon: <FiMessageCircle size={18} />,
      label: "Ask AI Tutor",
      onClick: () => console.log("Ask AI Tutor"),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Quick Actions
      </h3>

      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            type={action.type || "default"}
            size="large"
            icon={action.icon}
            onClick={action.onClick}
            className={`flex items-center gap-2 ${
              action.type === "primary"
                ? "!bg-primary-600 hover:!bg-primary-700"
                : "hover:!text-primary-600 hover:!border-primary-600"
            }`}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
