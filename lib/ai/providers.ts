import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// Determine which API provider to use based on environment variables
const useOpenAI = !!process.env.OPENAI_API_KEY;
const useXAI = !!process.env.XAI_API_KEY;

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': useOpenAI 
          ? openai('gpt-4.1')
          : xai('grok-2-vision-1212'),
        'chat-model-reasoning': wrapLanguageModel({
          model: useOpenAI 
            ? openai('gpt-4.1')
            : xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': useOpenAI 
          ? openai('gpt-4.1-mini')
          : xai('grok-2-1212'),
        'artifact-model': useOpenAI 
          ? openai('gpt-4.1-mini')
          : xai('grok-2-1212'),
      },
      imageModels: {
        'small-model': useOpenAI 
          ? openai.image('dall-e-3')
          : xai.image('grok-2-image'),
      },
    });
