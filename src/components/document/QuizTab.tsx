import { FiAlertCircle } from "react-icons/fi";

export const QuizTab = () => {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
          <FiAlertCircle className="text-purple-600" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Quiz Feature Coming Soon
        </h3>
        <p className="text-slate-600">
          Generate interactive quizzes from your documents to test your
          knowledge and reinforce learning.
        </p>
      </div>
    </div>
  );
};
