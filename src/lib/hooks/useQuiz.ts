import {
  quizService,
  type CreateQuizRequest,
  type QuizAttemptDetails,
  type QuizAttemptsResponse,
  type QuizDetails,
  type QuizListQueryParams,
  type QuizListResponse,
  type QuizSubmissionResult,
  type SubmitQuizAnswersRequest,
} from "../api/quiz.service";
import { getApiErrorMessage } from "../api/error";

const toError = (error: unknown, fallback: string) =>
  new Error(getApiErrorMessage(error, fallback));

export const useQuiz = () => {
  const createQuizFromFile = async (
    fileId: string,
    payload?: CreateQuizRequest,
  ): Promise<QuizDetails> => {
    try {
      return await quizService.createQuizFromFile(fileId, payload);
    } catch (error: unknown) {
      throw toError(error, "Failed to generate quiz");
    }
  };

  const getUserQuizzes = async (
    params?: QuizListQueryParams,
  ): Promise<QuizListResponse> => {
    try {
      return await quizService.getUserQuizzes(params);
    } catch (error: unknown) {
      throw toError(error, "Failed to load quizzes");
    }
  };

  const getQuizDetails = async (quizId: string): Promise<QuizDetails> => {
    try {
      return await quizService.getQuizDetails(quizId);
    } catch (error: unknown) {
      throw toError(error, "Failed to load quiz details");
    }
  };

  const submitQuizAnswers = async (
    quizId: string,
    payload: SubmitQuizAnswersRequest,
  ): Promise<QuizSubmissionResult> => {
    try {
      return await quizService.submitQuizAnswers(quizId, payload);
    } catch (error: unknown) {
      throw toError(error, "Failed to submit quiz answers");
    }
  };

  const getQuizAttempts = async (quizId: string): Promise<QuizAttemptsResponse> => {
    try {
      return await quizService.getQuizAttempts(quizId);
    } catch (error: unknown) {
      throw toError(error, "Failed to load quiz attempts");
    }
  };

  const getQuizAttemptDetails = async (
    attemptId: string,
  ): Promise<QuizAttemptDetails> => {
    try {
      return await quizService.getQuizAttemptDetails(attemptId);
    } catch (error: unknown) {
      throw toError(error, "Failed to load attempt details");
    }
  };

  return {
    createQuizFromFile,
    getUserQuizzes,
    getQuizDetails,
    submitQuizAnswers,
    getQuizAttempts,
    getQuizAttemptDetails,
  };
};

