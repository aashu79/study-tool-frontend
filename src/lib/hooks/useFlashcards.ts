import {
  flashcardService,
  type CreateFlashcardSetRequest,
  type FileFlashcardSetListResponse,
  type FlashcardSetDetails,
  type FlashcardSetListQueryParams,
  type FlashcardSetListResponse,
} from "../api/flashcard.service";
import { getApiErrorMessage } from "../api/error";

const toError = (error: unknown, fallback: string) =>
  new Error(getApiErrorMessage(error, fallback));

export const useFlashcards = () => {
  const createFlashcardSetFromFile = async (
    fileId: string,
    payload?: CreateFlashcardSetRequest,
  ): Promise<FlashcardSetDetails> => {
    try {
      return await flashcardService.createFlashcardSetFromFile(fileId, payload);
    } catch (error: unknown) {
      throw toError(error, "Failed to generate flashcard set");
    }
  };

  const listUserFlashcardSets = async (
    params?: FlashcardSetListQueryParams,
  ): Promise<FlashcardSetListResponse> => {
    try {
      return await flashcardService.listUserFlashcardSets(params);
    } catch (error: unknown) {
      throw toError(error, "Failed to load flashcard sets");
    }
  };

  const listFileFlashcardSets = async (
    fileId: string,
  ): Promise<FileFlashcardSetListResponse> => {
    try {
      return await flashcardService.listFileFlashcardSets(fileId);
    } catch (error: unknown) {
      throw toError(error, "Failed to load file flashcard sets");
    }
  };

  const getFlashcardSet = async (setId: string): Promise<FlashcardSetDetails> => {
    try {
      return await flashcardService.getFlashcardSet(setId);
    } catch (error: unknown) {
      throw toError(error, "Failed to load flashcard set details");
    }
  };

  const renameFlashcardSet = async (
    setId: string,
    title: string,
  ): Promise<FlashcardSetDetails> => {
    try {
      return await flashcardService.renameFlashcardSet(setId, title);
    } catch (error: unknown) {
      throw toError(error, "Failed to rename flashcard set");
    }
  };

  const deleteFlashcardSet = async (setId: string): Promise<void> => {
    try {
      await flashcardService.deleteFlashcardSet(setId);
    } catch (error: unknown) {
      throw toError(error, "Failed to delete flashcard set");
    }
  };

  return {
    createFlashcardSetFromFile,
    listUserFlashcardSets,
    listFileFlashcardSets,
    getFlashcardSet,
    renameFlashcardSet,
    deleteFlashcardSet,
  };
};

