import { FiAlertCircle } from "react-icons/fi";

export const FlashcardsTab = () => {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
          <FiAlertCircle className="text-amber-600" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Flashcards Feature Coming Soon
        </h3>
        <p className="text-slate-600">
          Create smart flashcards from your study materials for effective spaced
          repetition learning.
        </p>
      </div>
    </div>
  );
};
