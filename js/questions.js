/**
 * Question engine for the wizard mode.
 * Derives sequential yes/no questions from provider feature data modules.
 * Groups sub-features (DNS, Cloud Forwarding) under parent questions.
 */

import { AWS_FEATURES } from './data/aws.js';
import { AZURE_FEATURES } from './data/azure.js';
import { GCP_FEATURES } from './data/gcp.js';

const PROVIDER_FEATURES = {
  aws: AWS_FEATURES,
  azure: AZURE_FEATURES,
  gcp: GCP_FEATURES
};

/**
 * Exclusive sub-question groups by provider.
 * If a question text is listed here, its sub-questions are radio-style (pick one).
 * If not listed, sub-questions are toggle-style (can multi-select).
 */
const EXCLUSIVE_GROUPS = {
  aws: [
    'Sync DNS zones?',
    'Route 53 Resolver endpoint management?'
  ],
  azure: [
    'Sync public DNS zones?',
    'Manage Azure DNS Private Resolvers?'
  ],
  gcp: [
    'Sync Cloud DNS zones?'
    // 'Manage DNS forwarding?' is NOT exclusive for GCP — inbound + outbound can both be selected
  ]
};

/**
 * Derive wizard questions from a provider's feature data.
 *
 * Groups features sharing the same `question` string under a single parent question
 * with sub-questions. Features with unique question strings become standalone questions.
 *
 * @param {string} providerId - One of 'aws', 'azure', 'gcp'.
 * @returns {Array<object>} Array of question objects for the wizard.
 */
export function getQuestionsForProvider(providerId) {
  const features = PROVIDER_FEATURES[providerId];
  if (!features) return [];

  const exclusiveTexts = EXCLUSIVE_GROUPS[providerId] || [];
  const questions = [];
  const questionMap = new Map(); // question text -> question object

  for (const [featureId, feature] of Object.entries(features)) {
    const questionText = feature.question;
    if (!questionText) continue;

    if (feature.subQuestion) {
      // This is a sub-feature — group under parent question
      let parent = questionMap.get(questionText);
      if (!parent) {
        parent = {
          id: makeQuestionId(providerId, questionText),
          text: questionText,
          featureIds: [],
          subQuestions: []
        };
        questionMap.set(questionText, parent);
        questions.push(parent);
      }
      parent.subQuestions.push({
        id: makeSubQuestionId(providerId, featureId),
        text: feature.subQuestion,
        featureId: featureId,
        exclusive: exclusiveTexts.includes(questionText)
      });
    } else {
      // Standalone question
      const question = {
        id: makeQuestionId(providerId, questionText),
        text: questionText,
        featureIds: [featureId]
      };
      questionMap.set(questionText, question);
      questions.push(question);
    }
  }

  return questions;
}

/**
 * Create a URL-safe question ID from provider and question text.
 * @param {string} provider
 * @param {string} text
 * @returns {string}
 */
function makeQuestionId(provider, text) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${provider}-${slug}`;
}

/**
 * Create a sub-question ID from provider and feature ID.
 * @param {string} provider
 * @param {string} featureId
 * @returns {string}
 */
function makeSubQuestionId(provider, featureId) {
  const slug = featureId
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  return `${provider}-${slug}`;
}
