/**
 * DQI (Data Quality Index) Utility Functions
 * Provides color coding and categorization for DQI scores
 */

export type DQICategory = 'Excellent' | 'Good' | 'Acceptable' | 'Needs Attention' | 'Critical';

export interface DQIConfig {
  category: DQICategory;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
}

/**
 * Get DQI category based on score
 * @param score - DQI score (0-100)
 * @returns Category name
 */
export function getDQICategory(score: number): DQICategory {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Acceptable';
  if (score >= 40) return 'Needs Attention';
  return 'Critical';
}

/**
 * Get DQI configuration with colors and styling
 * @param score - DQI score (0-100)
 * @returns Configuration object with colors and description
 */
export function getDQIConfig(score: number): DQIConfig {
  const category = getDQICategory(score);

  const configs: Record<DQICategory, DQIConfig> = {
    'Excellent': {
      category: 'Excellent',
      color: 'green',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      textColor: 'text-green-800',
      description: 'Submission ready'
    },
    'Good': {
      category: 'Good',
      color: 'lime',
      bgColor: 'bg-lime-100',
      borderColor: 'border-lime-300',
      textColor: 'text-lime-800',
      description: 'Minor cleanup required'
    },
    'Acceptable': {
      category: 'Acceptable',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-800',
      description: 'Action plan needed'
    },
    'Needs Attention': {
      category: 'Needs Attention',
      color: 'orange',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-800',
      description: 'Delay risk'
    },
    'Critical': {
      category: 'Critical',
      color: 'red',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
      description: 'Major intervention required'
    }
  };

  return configs[category];
}

/**
 * Get clean status configuration
 * @param isClean - Whether subject is clean (true) or unclean (false)
 * @returns Configuration object with colors
 */
export function getCleanStatusConfig(isClean: boolean) {
  return isClean
    ? {
        label: 'Clean',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-800',
        borderColor: 'border-emerald-300',
        icon: '✓'
      }
    : {
        label: 'Unclean',
        bgColor: 'bg-rose-100',
        textColor: 'text-rose-800',
        borderColor: 'border-rose-300',
        icon: '✗'
      };
}

/**
 * Format DQI score for display
 * @param score - DQI score
 * @returns Formatted string
 */
export function formatDQIScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'N/A';
  return `${Math.round(score)}`;
}
