import { Component } from '@angular/core';

/**
 * =============================================================================
 * ПСИХОДІАГНОСТИКА - CSV Data Analysis Application
 * =============================================================================
 *
 * This application analyzes psychological test results from a CSV file.
 * It processes 5 different psychological questionnaires:
 *
 * CSV STRUCTURE (233 columns total):
 * ----------------------------------
 * Columns 1-3:     Timestamp, Email, Age
 * Columns 4-33:    САН (30 questions)
 * Columns 34-100:  Штепа (67 questions)
 * Columns 101-136: Basic Ph (36 questions)
 * Columns 137-149: Особистісні ресурси (13 questions)
 * Columns 150-233: Ryff Psychological Well-being (84 questions)
 *
 * =============================================================================
 * TEST 1: САН (Самопочуття, Активність, Настрій)
 * =============================================================================
 * - 30 questions with a 7-point bipolar scale
 * - Answer format: "3 (positive text)" to "3 (negative text)" with 0 in middle
 * - Special Unicode character (ㅤ) distinguishes left-side values ("2ㅤ", "1ㅤ")
 *   from right-side values ("1", "2")
 *
 * Scoring conversion:
 *   "3 (positive text)" → 7    "3 (negative text)" → 1
 *   "2ㅤ" → 6                   "2" → 2
 *   "1ㅤ" → 5                   "1" → 3
 *   "0" → 4 (center)
 *
 * Some questions have REVERSED scoring (negative first):
 *   Questions: 3, 4, 9, 10, 13, 15, 16, 21, 22, 27, 28
 *
 * Three scales (average of 10 questions each):
 *   - Самопочуття (Well-being): Q1, 2, 7, 8, 13, 14, 19, 20, 25, 26
 *   - Активність (Activity):    Q3, 4, 9, 10, 15, 16, 21, 22, 27, 28
 *   - Настрій (Mood):           Q5, 6, 11, 12, 17, 18, 23, 24, 29, 30
 *
 * =============================================================================
 * TEST 2: Опитувальник О.С. Штепи (Psychological Resourcefulness)
 * =============================================================================
 * - 67 questions with binary answers: "Так" (+) or "Ні" (-)
 * - 14 categories, each worth 8 points max
 * - Score 1 point when answer matches expected value (e.g., "9-" means Ні to Q9)
 *
 * Total score levels:
 *   0-56:   Психологічна ресурсність не діагностується
 *   57-69:  Низький рівень
 *   70-92:  Середній рівень
 *   93-106: Високий рівень
 *   107-112: Сумнівні дані
 *
 * =============================================================================
 * TEST 3: Basic Ph (Coping Resources)
 * =============================================================================
 * - 36 questions with 7 frequency options (0-6 scale)
 * - Answer options:
 *   0 = "Ніколи не користуюся цим способом..."
 *   1 = "Рідко користуюся..."
 *   2 = "Іноді користуюся..."
 *   3 = "Періодично користуюся..."
 *   4 = "Часто користуюся..."
 *   5 = "Майже завжди користуюся..."
 *   6 = "Завжди користуюся..."
 *
 * 6 categories (6 questions each, max 36 points per category):
 *   B (Віра, переконання):      Q1, 7, 13, 19, 25, 31
 *   A (Емоції, почуття):        Q2, 8, 14, 20, 26, 32
 *   S (Соціальні зв'язки):      Q3, 9, 15, 21, 27, 33
 *   I (Уява, мрії):             Q4, 10, 16, 22, 28, 34
 *   C (Когнітивні стратегії):   Q5, 11, 17, 23, 29, 35
 *   Ph (Тілесні ресурси):       Q6, 12, 18, 24, 30, 36
 *
 * =============================================================================
 * TEST 4: Особистісні ресурси (О. Савченко, С. Сукач)
 * =============================================================================
 * - 13 questions with 5-point agreement scale:
 *   1 = "Повністю не погоджуюсь"
 *   2 = "Частково не погоджусь"
 *   3 = "Важко визначитися"
 *   4 = "Частково погоджуюсь"
 *   5 = "Повністю погоджуюсь"
 *
 * 3 categories:
 *   - Достатність (Sufficiency):           Q1, 2, 4, 5, 9, 10 (max 30)
 *     Levels: <13 низький, 13-21 середній, >21 високий
 *
 *   - Стратегії подолання (Coping):        Q3, 6, 8, 12 (max 20)
 *     Levels: <13 низький, 13-18 середній, >18 високий
 *
 *   - Емоційна спустошеність (Exhaustion): Q7, 11, 13 (max 15)
 *     Levels: <8 низький, 8-12 середній, >12 високий
 *     NOTE: For exhaustion, LOWER is BETTER (colors inverted in UI)
 *
 * Total formula: Достатність + Стратегії подолання - Емоційна спустошеність
 * Total levels: <15 низький, 15-30 середній, >30 високий
 *
 * =============================================================================
 * TEST 5: Психологічне благополуччя (Ryff)
 * =============================================================================
 * - 84 questions with 6-point agreement scale:
 *   1 = "Повністю не згоден"
 *   2 = "Здебільшого не згоден"
 *   3 = "Де в чому не згоден"
 *   4 = "Де в чому згоден"
 *   5 = "Швидше згоден"
 *   6 = "Повністю згоден"
 *
 * - Some questions are REVERSED (marked with "(t)"):
 *   For reversed questions: 1→6, 2→5, 3→4, 4→3, 5→2, 6→1
 *
 * 6 categories (14 questions each, max 84 points per category):
 *   - Відносини:      Q1, 7(t), 13(t), 19, 25, 31(t), 37, 43(t), 49, 55(t), 61(t), 67, 73(t), 79
 *     Levels: <53 низький, 53-74 середній, >74 високий
 *
 *   - Автономія:      Q2(t), 8, 14, 20(t), 26, 32(t), 38, 44(t), 50, 56(t), 62(t), 68, 74(t), 80
 *     Levels: <48 низький, 48-62 середній, >62 високий
 *
 *   - Середовище:     Q3, 9(t), 15(t), 21, 27(t), 33, 39, 45(t), 51, 57, 63(t), 69, 75(t), 81
 *     Levels: <51 низький, 51-71 середній, >71 високий
 *
 *   - Зростання:      Q4(t), 10, 16, 22(t), 28, 34(t), 40, 46, 52, 58(t), 64, 70, 76(t), 82(t)
 *     Levels: <53 низький, 53-71 середній, >71 високий
 *
 *   - Цілі:           Q5, 11(t), 17(t), 23, 29(t), 35(t), 41(t), 47, 53, 59, 65(t), 71, 77, 83(t)
 *     Levels: <54 низький, 54-75 середній, >75 високий
 *
 *   - Самосприйняття: Q6, 12, 18(t), 24(t), 30, 36, 42(t), 48, 54(t), 60(t), 66(t), 72, 78, 84(t)
 *     Levels: <49 низький, 49-71 середній, >71 високий
 *
 * Total (sum of all 6): max 504
 *   Levels: <315 низький, 315-413 середній, >413 високий
 *
 * =============================================================================
 */

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * САН test result - three scale averages (1-7 range)
 */
interface SanResult {
  wellbeing: number; // Самопочуття - average of 10 questions
  activity: number; // Активність - average of 10 questions
  mood: number; // Настрій - average of 10 questions
}

/**
 * Single category result for Штепа test
 */
interface ShtepaCategory {
  name: string;
  score: number; // Points earned (0-8)
  maxScore: number; // Always 8 (questions per category)
}

/**
 * Штепа test result - 14 categories + total
 */
interface ShtepaResult {
  categories: ShtepaCategory[];
  totalScore: number; // Sum of all category scores (0-112)
  totalLevel: string; // Interpreted level in Ukrainian
  totalLevelClass: string; // CSS class for styling
}

/**
 * Single category result for Basic Ph test
 */
interface BasicPhCategory {
  code: string; // B, A, S, I, C, Ph
  name: string; // Full Ukrainian name
  score: number; // Sum of 6 questions (0-36)
  maxScore: number; // Always 36 (6 questions × 6 max points)
}

/**
 * Basic Ph test result - 6 categories
 */
interface BasicPhResult {
  categories: BasicPhCategory[];
  totalScore: number; // Sum of all (0-216)
}

/**
 * Single category result for Personal Resources test
 */
interface PersonalResourceCategory {
  name: string;
  score: number;
  maxScore: number;
  level: string; // Низький/Середній/Високий
  levelClass: string; // low/medium/high
}

/**
 * Personal Resources test result - 3 categories + calculated total
 */
interface PersonalResourceResult {
  sufficiency: PersonalResourceCategory; // Достатність
  copingStrategies: PersonalResourceCategory; // Стратегії подолання
  emotionalExhaustion: PersonalResourceCategory; // Емоційна спустошеність
  totalScore: number; // Formula: sufficiency + coping - exhaustion
  totalLevel: string;
  totalLevelClass: string;
}

/**
 * Single category result for Ryff Psychological Well-being test
 */
interface RyffCategory {
  name: string;
  score: number; // Sum of 14 questions (14-84)
  maxScore: number; // Always 84 (14 questions × 6 max points)
  level: string; // Низький/Середній/Високий
  levelClass: string; // low/medium/high
}

/**
 * Ryff test result - 6 categories + total
 */
interface RyffResult {
  relationships: RyffCategory; // Відносини
  autonomy: RyffCategory; // Автономія
  environment: RyffCategory; // Середовище
  growth: RyffCategory; // Зростання
  purpose: RyffCategory; // Цілі
  selfAcceptance: RyffCategory; // Самосприйняття
  totalScore: number; // Sum of all 6 (84-504)
  totalLevel: string;
  totalLevelClass: string;
}

/**
 * Complete respondent data with all test results
 */
interface Respondent {
  timestamp: string;
  email: string;
  age: string;
  sanAnswers: number[]; // 30 converted answers (1-7 scale)
  san: SanResult;
  shtepaAnswers: boolean[]; // 67 answers (true = Так, false = Ні)
  shtepa: ShtepaResult;
  basicPhAnswers: number[]; // 36 answers (0-6 scale)
  basicPh: BasicPhResult;
  personalResourceAnswers: number[]; // 13 answers (1-5 scale)
  personalResource: PersonalResourceResult;
  ryffAnswers: number[]; // 84 answers (1-6 scale, some reversed)
  ryff: RyffResult;
}

/**
 * Штепа category definition - question number + expected answer
 * Format from original: "9-" means Q9 expects "Ні" (false)
 */
interface CategoryDefinition {
  name: string;
  questions: { num: number; expected: boolean }[];
}

/**
 * Basic Ph category definition - simpler, just question numbers
 */
interface BasicPhCategoryDefinition {
  code: string;
  name: string;
  questions: number[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // ============================================================================
  // STATE
  // ============================================================================
  respondents: Respondent[] = []; // All parsed respondent data
  fileName: string = ''; // Current CSV filename
  isDragging: boolean = false; // Drag & drop state
  isLoading: boolean = false; // File processing state
  errorMessage: string = ''; // Error display

  // Ryff detail modal state
  showRyffDetailModal: boolean = false;
  ryffDetailRespondent: Respondent | null = null;
  ryffDetailCategory: string = '';
  ryffDetailQuestions: {
    num: number;
    rawAnswer: number;
    finalAnswer: number;
    isReversed: boolean;
  }[] = [];
  activeTab: 'san' | 'shtepa' | 'basicph' | 'personalresource' | 'ryff' = 'san';

  // ============================================================================
  // САН CONFIGURATION
  // ============================================================================

  /**
   * САН questions with REVERSED scoring (negative adjective listed first)
   * For these questions, the scale direction is flipped:
   * - "3 (negative)" = 1 point, "3 (positive)" = 7 points
   * Regular questions: positive first = 7, negative last = 1
   */
  reversedQuestions: number[] = [3, 4, 9, 10, 13, 15, 16, 21, 22, 27, 28];

  /**
   * САН scale groupings - each scale averages 10 questions
   * All question numbers are 1-indexed as per original questionnaire
   */
  wellbeingQuestions = [1, 2, 7, 8, 13, 14, 19, 20, 25, 26]; // Самопочуття
  activityQuestions = [3, 4, 9, 10, 15, 16, 21, 22, 27, 28]; // Активність
  moodQuestions = [5, 6, 11, 12, 17, 18, 23, 24, 29, 30]; // Настрій

  // ============================================================================
  // ШТЕПА CONFIGURATION
  // ============================================================================

  /**
   * Штепа questionnaire - 14 categories
   * Format: { num: questionNumber, expected: true/false }
   * - expected: true = "Так" (+), false = "Ні" (-)
   * - Score 1 point if respondent's answer matches expected value
   * - Each category has 8 questions = max 8 points
   *
   * Original notation example: "2+ 3+ 9– 11+ 12–"
   * Means: Q2 expects Так, Q3 expects Так, Q9 expects Ні, etc.
   */
  shtepaCategories: CategoryDefinition[] = [
    {
      name: 'Упевненість у собі',
      questions: [
        { num: 2, expected: true },
        { num: 3, expected: true },
        { num: 9, expected: false },
        { num: 11, expected: true },
        { num: 12, expected: false },
        { num: 21, expected: false },
        { num: 22, expected: false },
        { num: 55, expected: true },
      ],
    },
    {
      name: 'Доброта до людей',
      questions: [
        { num: 4, expected: true },
        { num: 5, expected: true },
        { num: 15, expected: false },
        { num: 16, expected: false },
        { num: 17, expected: false },
        { num: 26, expected: false },
        { num: 27, expected: false },
        { num: 28, expected: true },
      ],
    },
    {
      name: 'Допомога іншим',
      questions: [
        { num: 4, expected: true },
        { num: 6, expected: true },
        { num: 10, expected: false },
        { num: 17, expected: false },
        { num: 18, expected: false },
        { num: 36, expected: true },
        { num: 37, expected: true },
        { num: 38, expected: true },
      ],
    },
    {
      name: 'Успіх',
      questions: [
        { num: 1, expected: true },
        { num: 12, expected: false },
        { num: 14, expected: true },
        { num: 29, expected: true },
        { num: 34, expected: true },
        { num: 40, expected: true },
        { num: 42, expected: false },
        { num: 55, expected: true },
      ],
    },
    {
      name: 'Любов',
      questions: [
        { num: 7, expected: false },
        { num: 8, expected: false },
        { num: 11, expected: true },
        { num: 30, expected: true },
        { num: 33, expected: false },
        { num: 51, expected: true },
        { num: 52, expected: true },
        { num: 53, expected: true },
      ],
    },
    {
      name: 'Творчість',
      questions: [
        { num: 23, expected: false },
        { num: 24, expected: false },
        { num: 25, expected: false },
        { num: 31, expected: true },
        { num: 37, expected: true },
        { num: 40, expected: true },
        { num: 53, expected: true },
        { num: 54, expected: true },
      ],
    },
    {
      name: 'Віра у добро',
      questions: [
        { num: 1, expected: true },
        { num: 6, expected: true },
        { num: 7, expected: false },
        { num: 13, expected: false },
        { num: 16, expected: false },
        { num: 28, expected: true },
        { num: 34, expected: true },
        { num: 35, expected: true },
      ],
    },
    {
      name: 'Прагнення до мудрості',
      questions: [
        { num: 33, expected: false },
        { num: 36, expected: true },
        { num: 39, expected: true },
        { num: 45, expected: false },
        { num: 46, expected: false },
        { num: 47, expected: false },
        { num: 54, expected: true },
        { num: 55, expected: true },
      ],
    },
    {
      name: 'Робота над собою',
      questions: [
        { num: 11, expected: true },
        { num: 41, expected: true },
        { num: 43, expected: false },
        { num: 48, expected: false },
        { num: 49, expected: false },
        { num: 50, expected: false },
        { num: 52, expected: true },
        { num: 54, expected: true },
      ],
    },
    {
      name: 'Самореалізація у професії',
      questions: [
        { num: 11, expected: true },
        { num: 23, expected: false },
        { num: 24, expected: false },
        { num: 40, expected: true },
        { num: 42, expected: false },
        { num: 44, expected: false },
        { num: 47, expected: false },
        { num: 53, expected: true },
      ],
    },
    {
      name: 'Відповідальність',
      questions: [
        { num: 8, expected: false },
        { num: 10, expected: false },
        { num: 19, expected: false },
        { num: 20, expected: true },
        { num: 22, expected: false },
        { num: 32, expected: true },
        { num: 51, expected: true },
        { num: 52, expected: true },
      ],
    },
    {
      name: 'Знання власних ресурсів',
      questions: [
        { num: 57, expected: false },
        { num: 59, expected: false },
        { num: 60, expected: true },
        { num: 61, expected: true },
        { num: 62, expected: false },
        { num: 63, expected: false },
        { num: 66, expected: false },
        { num: 67, expected: true },
      ],
    },
    {
      name: 'Уміння оновлювати власні ресурси',
      questions: [
        { num: 56, expected: true },
        { num: 58, expected: true },
        { num: 60, expected: true },
        { num: 61, expected: true },
        { num: 62, expected: false },
        { num: 63, expected: false },
        { num: 64, expected: false },
        { num: 66, expected: false },
      ],
    },
    {
      name: 'Уміння використовувати власні ресурси',
      questions: [
        { num: 58, expected: true },
        { num: 59, expected: false },
        { num: 61, expected: true },
        { num: 63, expected: false },
        { num: 64, expected: false },
        { num: 65, expected: true },
        { num: 66, expected: false },
        { num: 67, expected: true },
      ],
    },
  ];

  // ============================================================================
  // BASIC PH CONFIGURATION
  // ============================================================================

  /**
   * Basic Ph - 6 coping resource categories
   * Questions are distributed in a pattern: Q1,7,13,19,25,31 for B, etc.
   * Each category sums 6 questions (0-6 scale each) = max 36 points
   * Total max: 216 points
   */
  basicPhCategories: BasicPhCategoryDefinition[] = [
    { code: 'B', name: 'Віра, переконання', questions: [1, 7, 13, 19, 25, 31] },
    { code: 'A', name: 'Емоції, почуття', questions: [2, 8, 14, 20, 26, 32] },
    { code: 'S', name: "Соціальні зв'язки", questions: [3, 9, 15, 21, 27, 33] },
    { code: 'I', name: 'Уява, мрії', questions: [4, 10, 16, 22, 28, 34] },
    {
      code: 'C',
      name: 'Когнітивні стратегії',
      questions: [5, 11, 17, 23, 29, 35],
    },
    { code: 'Ph', name: 'Тілесні ресурси', questions: [6, 12, 18, 24, 30, 36] },
  ];

  // ============================================================================
  // PERSONAL RESOURCES CONFIGURATION (О. Савченко, С. Сукач)
  // ============================================================================

  /**
   * Personal Resources - 3 categories with different question counts
   *
   * IMPORTANT: Total formula is:
   *   Достатність + Стратегії подолання - Емоційна спустошеність
   *
   * For "Емоційна спустошеність" - LOWER score is BETTER
   * (it's subtracted from total, and UI shows inverted colors)
   */
  personalResourceSufficiencyQuestions = [1, 2, 4, 5, 9, 10]; // Достатність (6 Q × 5 max = 30)
  personalResourceCopingQuestions = [3, 6, 8, 12]; // Стратегії подолання (4 Q × 5 max = 20)
  personalResourceExhaustionQuestions = [7, 11, 13]; // Емоційна спустошеність (3 Q × 5 max = 15)

  // ============================================================================
  // RYFF PSYCHOLOGICAL WELL-BEING CONFIGURATION
  // ============================================================================

  /**
   * Ryff's Psychological Well-being Scale - 6 categories
   * - 84 questions total (14 per category)
   * - 6-point agreement scale (1-6)
   * - Some questions are REVERSED (marked with isReversed: true)
   *   For reversed: answer is transformed: 7 - answer (so 1→6, 2→5, etc.)
   *
   * Format: { num: questionNumber, isReversed: boolean }
   * (t) in original notation means reversed
   */
  ryffCategories = {
    // Відносини: 1, 7(t), 13(t), 19, 25, 31(t), 37, 43(t), 49, 55(t), 61(t), 67, 73(t), 79
    // Levels: <53 низький, 53-74 середній, >74 високий
    relationships: {
      name: 'Відносини',
      questions: [
        { num: 1, isReversed: false },
        { num: 7, isReversed: true },
        { num: 13, isReversed: true },
        { num: 19, isReversed: false },
        { num: 25, isReversed: false },
        { num: 31, isReversed: true },
        { num: 37, isReversed: false },
        { num: 43, isReversed: true },
        { num: 49, isReversed: false },
        { num: 55, isReversed: true },
        { num: 61, isReversed: true },
        { num: 67, isReversed: false },
        { num: 73, isReversed: true },
        { num: 79, isReversed: false },
      ],
      lowThreshold: 53, // <53 = низький
      highThreshold: 74, // >74 = високий, 53-74 = середній
    },
    // Автономія: 2(t), 8, 14, 20(t), 26, 32(t), 38, 44(t), 50, 56(t), 62(t), 68, 74(t), 80
    // Levels: <48 низький, 48-62 середній, >62 високий
    autonomy: {
      name: 'Автономія',
      questions: [
        { num: 2, isReversed: true },
        { num: 8, isReversed: false },
        { num: 14, isReversed: false },
        { num: 20, isReversed: true },
        { num: 26, isReversed: false },
        { num: 32, isReversed: true },
        { num: 38, isReversed: false },
        { num: 44, isReversed: true },
        { num: 50, isReversed: false },
        { num: 56, isReversed: true },
        { num: 62, isReversed: true },
        { num: 68, isReversed: false },
        { num: 74, isReversed: true },
        { num: 80, isReversed: false },
      ],
      lowThreshold: 48,
      highThreshold: 62,
    },
    // Середовище: 3, 9(t), 15(t), 21, 27(t), 33, 39, 45(t), 51, 57, 63(t), 69, 75(t), 81
    // Levels: <51 низький, 51-71 середній, >71 високий
    environment: {
      name: 'Середовище',
      questions: [
        { num: 3, isReversed: false },
        { num: 9, isReversed: true },
        { num: 15, isReversed: true },
        { num: 21, isReversed: false },
        { num: 27, isReversed: true },
        { num: 33, isReversed: false },
        { num: 39, isReversed: false },
        { num: 45, isReversed: true },
        { num: 51, isReversed: false },
        { num: 57, isReversed: false },
        { num: 63, isReversed: true },
        { num: 69, isReversed: false },
        { num: 75, isReversed: true },
        { num: 81, isReversed: false },
      ],
      lowThreshold: 51,
      highThreshold: 71,
    },
    // Зростання: 4(t), 10, 16, 22(t), 28, 34(t), 40, 46, 52, 58(t), 64, 70, 76(t), 82(t)
    // Levels: <53 низький, 53-71 середній, >71 високий
    growth: {
      name: 'Зростання',
      questions: [
        { num: 4, isReversed: true },
        { num: 10, isReversed: false },
        { num: 16, isReversed: false },
        { num: 22, isReversed: true },
        { num: 28, isReversed: false },
        { num: 34, isReversed: true },
        { num: 40, isReversed: false },
        { num: 46, isReversed: false },
        { num: 52, isReversed: false },
        { num: 58, isReversed: true },
        { num: 64, isReversed: false },
        { num: 70, isReversed: false },
        { num: 76, isReversed: true },
        { num: 82, isReversed: true },
      ],
      lowThreshold: 53,
      highThreshold: 71,
    },
    // Цілі: 5, 11(t), 17(t), 23, 29(t), 35(t), 41(t), 47, 53, 59, 65(t), 71, 77, 83(t)
    // Levels: <54 низький, 54-75 середній, >75 високий
    purpose: {
      name: 'Цілі',
      questions: [
        { num: 5, isReversed: false },
        { num: 11, isReversed: true },
        { num: 17, isReversed: true },
        { num: 23, isReversed: false },
        { num: 29, isReversed: true },
        { num: 35, isReversed: true },
        { num: 41, isReversed: true },
        { num: 47, isReversed: false },
        { num: 53, isReversed: false },
        { num: 59, isReversed: false },
        { num: 65, isReversed: true },
        { num: 71, isReversed: false },
        { num: 77, isReversed: false },
        { num: 83, isReversed: true },
      ],
      lowThreshold: 54,
      highThreshold: 75,
    },
    // Самосприйняття: 6, 12, 18(t), 24(t), 30, 36, 42(t), 48, 54(t), 60(t), 66(t), 72, 78, 84(t)
    // Levels: <49 низький, 49-71 середній, >71 високий
    selfAcceptance: {
      name: 'Самосприйняття',
      questions: [
        { num: 6, isReversed: false },
        { num: 12, isReversed: false },
        { num: 18, isReversed: true },
        { num: 24, isReversed: true },
        { num: 30, isReversed: false },
        { num: 36, isReversed: false },
        { num: 42, isReversed: true },
        { num: 48, isReversed: false },
        { num: 54, isReversed: true },
        { num: 60, isReversed: true },
        { num: 66, isReversed: true },
        { num: 72, isReversed: false },
        { num: 78, isReversed: false },
        { num: 84, isReversed: true },
      ],
      lowThreshold: 49,
      highThreshold: 71,
    },
  };

  // Total Ryff thresholds: <315 низький, 315-413 середній, >413 високий
  ryffTotalLowThreshold = 315;
  ryffTotalHighThreshold = 413;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    if (!file.name.endsWith('.csv')) {
      this.errorMessage = 'Please upload a CSV file';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.parseAndTransformCSV(content);
      this.isLoading = false;
    };
    reader.onerror = () => {
      this.errorMessage = 'Error reading file';
      this.isLoading = false;
    };
    reader.readAsText(file);
  }

  // ============================================================================
  // CSV PARSING
  // ============================================================================

  /**
   * Main CSV parsing and transformation method
   *
   * CSV Column Layout (0-indexed):
   *   0:       Timestamp
   *   1:       Email
   *   2:       Age
   *   3-32:    САН questions (30 questions)
   *   33-99:   Штепа questions (67 questions)
   *   100-135: Basic Ph questions (36 questions)
   *   136-148: Особистісні ресурси questions (13 questions)
   *   149-232: Ryff questions (84 questions)
   *
   * Total: 233 columns required
   */
  parseAndTransformCSV(content: string): void {
    const lines = content.split('\n').filter((line) => line.trim() !== '');

    if (lines.length < 2) {
      this.errorMessage =
        'CSV file must have a header and at least one data row';
      return;
    }

    // Skip header row, process data rows
    const dataRows = lines.slice(1);
    this.respondents = [];

    // Expected columns: 3 + 30 + 67 + 36 + 13 + 84 = 233
    const minColumns = 3 + 30 + 67 + 36 + 13 + 84; // 233

    for (const line of dataRows) {
      const columns = this.parseCSVLine(line);

      if (columns.length < minColumns) {
        console.warn(
          `Row has insufficient columns: ${columns.length}, expected ${minColumns}`
        );
        continue;
      }

      const timestamp = columns[0];
      const email = columns[1];
      const age = columns[2];

      // === САН Processing (columns 3-32, 30 questions) ===
      const sanAnswers: number[] = [];
      for (let i = 0; i < 30; i++) {
        const questionNum = i + 1;
        const rawValue = columns[3 + i];
        const isReversed = this.reversedQuestions.includes(questionNum);
        const convertedValue = this.convertSanAnswer(
          rawValue,
          isReversed,
          questionNum,
          email
        );
        sanAnswers.push(convertedValue);
      }

      const san: SanResult = {
        wellbeing: this.calculateAverage(sanAnswers, this.wellbeingQuestions),
        activity: this.calculateAverage(sanAnswers, this.activityQuestions),
        mood: this.calculateAverage(sanAnswers, this.moodQuestions),
      };

      // === Штепа Processing (columns 33-99, 67 questions) ===
      const shtepaAnswers: boolean[] = [];
      for (let i = 0; i < 67; i++) {
        const questionNum = i + 1;
        const rawValue = columns[33 + i];
        const answer = this.convertShtepaAnswer(rawValue, questionNum, email);
        shtepaAnswers.push(answer);
      }

      const shtepa = this.calculateShtepaResults(shtepaAnswers);

      // === Basic Ph Processing (columns 100-135, 36 questions) ===
      const basicPhAnswers: number[] = [];
      for (let i = 0; i < 36; i++) {
        const questionNum = i + 1;
        const rawValue = columns[100 + i];
        const answer = this.convertBasicPhAnswer(rawValue, questionNum, email);
        basicPhAnswers.push(answer);
      }

      const basicPh = this.calculateBasicPhResults(basicPhAnswers);

      // === Personal Resource Processing (columns 136-148, 13 questions) ===
      const personalResourceAnswers: number[] = [];
      for (let i = 0; i < 13; i++) {
        const questionNum = i + 1;
        const rawValue = columns[136 + i];
        const answer = this.convertPersonalResourceAnswer(
          rawValue,
          questionNum,
          email
        );
        personalResourceAnswers.push(answer);
      }

      const personalResource = this.calculatePersonalResourceResults(
        personalResourceAnswers
      );

      // === Ryff Processing (columns 149-232, 84 questions) ===
      const ryffAnswers: number[] = [];
      for (let i = 0; i < 84; i++) {
        const questionNum = i + 1;
        const rawValue = columns[149 + i];
        const answer = this.convertRyffAnswer(rawValue, questionNum, email);
        ryffAnswers.push(answer);
      }

      const ryff = this.calculateRyffResults(ryffAnswers);

      this.respondents.push({
        timestamp,
        email,
        age,
        sanAnswers,
        san,
        shtepaAnswers,
        shtepa,
        basicPhAnswers,
        basicPh,
        personalResourceAnswers,
        personalResource,
        ryffAnswers,
        ryff,
      });
    }

    if (this.respondents.length === 0) {
      this.errorMessage = 'No valid data rows found in CSV';
    }
  }

  // ============================================================================
  // ANSWER CONVERSION METHODS
  // ============================================================================

  /**
   * Convert САН answer text to numeric score (1-7)
   *
   * САН uses a bipolar scale with descriptive text at extremes:
   *   "3 (самопочуття добре)"  →  7 (positive extreme)
   *   "2ㅤ"                     →  6 (note: special Unicode ㅤ character)
   *   "1ㅤ"                     →  5
   *   "0"                      →  4 (center/neutral)
   *   "1"                      →  3
   *   "2"                      →  2
   *   "3 (самопочуття погане)" →  1 (negative extreme)
   *
   * The special character ㅤ (U+3164 Hangul Filler) distinguishes
   * left-side values from right-side values with the same number.
   *
   * For REVERSED questions (isReversed=true), the positive/negative
   * positions are swapped in the original questionnaire.
   */
  convertSanAnswer(
    rawValue: string,
    isReversed: boolean,
    questionNum: number,
    email: string
  ): number {
    const normalized = rawValue.trim();

    // Check for extreme values with descriptive text
    if (normalized.startsWith('3 (') || normalized.startsWith('3(')) {
      const lowerValue = normalized.toLowerCase();

      const positiveKeywords = [
        'добре',
        'сильним',
        'активний',
        'рухливий',
        'веселий',
        'гарний',
        'працездатний',
        'сповнений сил',
        'швидкий',
        'дієвий',
        'щасливий',
        'життєрадісний',
        'розслаблений',
        'здоровий',
        'захоплений',
        'схвильований',
        'сповнений віри',
        'радісний',
        'добре відпочив',
        'свіжий',
        'збуджений',
        'бажаю працювати',
        'спокійний',
        'оптимістичний',
        'витривалий',
        'бадьорий',
        'розмірковувати легко',
        'уважний',
        'сповнений надій',
        'задоволений',
      ];

      const negativeKeywords = [
        'погане',
        'слабким',
        'пасивний',
        'малорухливий',
        'сумний',
        'поганий',
        'малопрацездатний',
        'знесилений',
        'повільний',
        'бездіяльний',
        'нещасний',
        'похмурий',
        'напружений',
        'хворий',
        'безініціативний',
        'байдужий',
        'зневірений',
        'стомлений',
        'виснажений',
        'сонливий',
        'бажаю відпочити',
        'стурбований',
        'песимістичний',
        'маловитривалий',
        'млявий',
        'розмірковувати важко',
        'неуважний',
        'розчарований',
        'незадоволений',
      ];

      const isPositiveExtreme = positiveKeywords.some((kw) =>
        lowerValue.includes(kw)
      );
      const isNegativeExtreme = negativeKeywords.some((kw) =>
        lowerValue.includes(kw)
      );

      if (isPositiveExtreme) {
        return 7;
      } else if (isNegativeExtreme) {
        return 1;
      } else {
        console.error(
          `ERROR [САН]: Unknown value for Q${questionNum} (${email}): "${rawValue}"`
        );
        return 4;
      }
    }

    const cleanValue = normalized.replace(/[^\d]/g, '');
    const hasSpecialChar =
      normalized.length > cleanValue.length && cleanValue.length > 0;

    if (cleanValue === '0') return 4;

    if (cleanValue === '1') {
      return hasSpecialChar ? (isReversed ? 3 : 5) : isReversed ? 5 : 3;
    }

    if (cleanValue === '2') {
      return hasSpecialChar ? (isReversed ? 2 : 6) : isReversed ? 6 : 2;
    }

    if (cleanValue === '3') {
      console.error(
        `ERROR [САН]: Plain "3" for Q${questionNum} (${email}): "${rawValue}"`
      );
      return 4;
    }

    console.error(
      `ERROR [САН]: Unrecognized value for Q${questionNum} (${email}): "${rawValue}"`
    );
    return 4;
  }

  /**
   * Convert Штепа answer to boolean
   * Simple binary: "Так" (+) = true, "Ні" (-) = false
   */
  convertShtepaAnswer(
    rawValue: string,
    questionNum: number,
    email: string
  ): boolean {
    const normalized = rawValue.trim().toLowerCase();

    if (normalized === 'так' || normalized === '+') {
      return true;
    }

    if (normalized === 'ні' || normalized === '-') {
      return false;
    }

    // Log error for debugging - helps identify data issues
    console.error(
      `ERROR [Штепа]: Unrecognized value for Q${questionNum} (${email}): "${rawValue}"`
    );
    console.error(`  Expected: "Так" or "Ні"`);
    return false; // Default to "Ні"
  }

  /**
   * Convert Basic Ph answer to numeric score (0-6)
   *
   * Frequency scale:
   *   0 = "Ніколи не користуюся цим способом, щоб впоратися зі складною ситуацією"
   *   1 = "Рідко користуюся..."
   *   2 = "Іноді користуюся..."
   *   3 = "Періодично користуюся..."
   *   4 = "Часто користуюся..."
   *   5 = "Майже завжди користуюся..."
   *   6 = "Завжди користуюся..."
   *
   * Supports both full text matching and keyword matching for flexibility
   */
  convertBasicPhAnswer(
    rawValue: string,
    questionNum: number,
    email: string
  ): number {
    const normalized = rawValue.trim().toLowerCase();

    // Full text answer mapping
    const answerMap: { [key: string]: number } = {
      'ніколи не користуюся цим способом, щоб впоратися зі складною ситуацією': 0,
      'рідко користуюся цим способом, щоб впоратися зі складною ситуацією': 1,
      'іноді користуюся цим способом, щоб впоратися зі складною ситуацією': 2,
      'періодично користуюся цим способом, щоб впоратися зі складною ситуацією': 3,
      'часто користуюся цим способом, щоб впоратися зі складною ситуацією': 4,
      'майже завжди користуюся цим способом, щоб впоратися зі складною ситуацією': 5,
      'завжди користуюся цим способом, щоб впоратися зі складною ситуацією': 6,
    };

    // Check exact match
    if (answerMap.hasOwnProperty(normalized)) {
      return answerMap[normalized];
    }

    // Try to match by keyword
    if (normalized.includes('ніколи')) return 0;
    if (normalized.includes('рідко')) return 1;
    if (normalized.includes('іноді')) return 2;
    if (normalized.includes('періодично')) return 3;
    if (normalized.includes('часто')) return 4;
    if (normalized.includes('майже завжди')) return 5;
    if (normalized.includes('завжди')) return 6;

    // Try numeric value
    const numValue = parseInt(normalized, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 6) {
      return numValue;
    }

    console.error(
      `ERROR [Basic Ph]: Unrecognized value for Q${questionNum} (${email}): "${rawValue}"`
    );
    console.error(`  Expected: one of the 7 frequency options (0-6)`);
    return 0;
  }

  /**
   * Convert Personal Resources answer to numeric score (1-5)
   *
   * Agreement scale:
   *   1 = "Повністю не погоджуюсь"
   *   2 = "Частково не погоджусь"
   *   3 = "Важко визначитися"
   *   4 = "Частково погоджуюсь"
   *   5 = "Повністю погоджуюсь"
   */
  convertPersonalResourceAnswer(
    rawValue: string,
    questionNum: number,
    email: string
  ): number {
    const normalized = rawValue.trim().toLowerCase();

    // Map text answers to numbers (1-5 scale)
    // Note: handling both "погоджуюсь" and "погоджуюся" spelling variants
    if (
      normalized.includes('повністю не погоджуюсь') ||
      normalized.includes('повністю не погоджуюся') ||
      normalized.includes('майже ніколи')
    ) {
      return 1;
    }
    if (
      normalized.includes('частково не погоджусь') ||
      normalized.includes('частково не погоджуюся') ||
      normalized.includes('рідко')
    ) {
      return 2;
    }
    if (
      normalized.includes('важко визначитися') ||
      normalized.includes('час від часу')
    ) {
      return 3;
    }
    if (
      normalized.includes('частково погоджуюсь') ||
      normalized.includes('частково погоджуюся') ||
      normalized.includes('часто')
    ) {
      return 4;
    }
    if (
      normalized.includes('повністю погоджуюсь') ||
      normalized.includes('повністю погоджуюся') ||
      normalized.includes('майже завжди')
    ) {
      return 5;
    }

    // Try numeric value
    const numValue = parseInt(normalized, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
      return numValue;
    }

    console.error(
      `ERROR [Особистісні ресурси]: Unrecognized value for Q${questionNum} (${email}): "${rawValue}"`
    );
    console.error(`  Expected: one of the 5 agreement options (1-5)`);
    return 3; // Default to middle
  }

  // ============================================================================
  // SCORE CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate Штепа results - 14 categories + total level
   *
   * Scoring: 1 point when answer matches expected value
   * Total levels:
   *   0-56:    не діагностується (gray)
   *   57-69:   низький (red)
   *   70-92:   середній (yellow)
   *   93-106:  високий (green)
   *   107-112: сумнівні дані (purple)
   */
  calculateShtepaResults(answers: boolean[]): ShtepaResult {
    const categories: ShtepaCategory[] = [];
    let totalScore = 0;

    for (const catDef of this.shtepaCategories) {
      let score = 0;
      for (const q of catDef.questions) {
        const answerIndex = q.num - 1; // Convert 1-indexed to 0-indexed
        const actualAnswer = answers[answerIndex];
        if (actualAnswer === q.expected) {
          score++; // Match = 1 point
        }
      }
      categories.push({
        name: catDef.name,
        score,
        maxScore: catDef.questions.length, // Always 8
      });
      totalScore += score;
    }

    // Interpret total score level
    let totalLevel: string;
    let totalLevelClass: string;

    if (totalScore <= 56) {
      totalLevel = 'Психологічна ресурсність не діагностується';
      totalLevelClass = 'not-diagnosed';
    } else if (totalScore <= 69) {
      totalLevel = 'Низький рівень';
      totalLevelClass = 'low';
    } else if (totalScore <= 92) {
      totalLevel = 'Середній рівень';
      totalLevelClass = 'medium';
    } else if (totalScore <= 106) {
      totalLevel = 'Високий рівень';
      totalLevelClass = 'high';
    } else {
      totalLevel = 'Сумнівні дані';
      totalLevelClass = 'doubtful';
    }

    return { categories, totalScore, totalLevel, totalLevelClass };
  }

  calculateBasicPhResults(answers: number[]): BasicPhResult {
    const categories: BasicPhCategory[] = [];
    let totalScore = 0;

    for (const catDef of this.basicPhCategories) {
      let score = 0;
      for (const qNum of catDef.questions) {
        score += answers[qNum - 1]; // Convert to 0-indexed
      }
      categories.push({
        code: catDef.code,
        name: catDef.name,
        score,
        maxScore: 36, // 6 questions * 6 max points
      });
      totalScore += score;
    }

    return { categories, totalScore };
  }

  /**
   * Calculate Personal Resources results
   *
   * Three categories with DIFFERENT level thresholds:
   *
   * Достатність (6 questions, max 30):
   *   <13: низький, 13-21: середній, >21: високий
   *
   * Стратегії подолання (4 questions, max 20):
   *   <13: низький, 13-18: середній, >18: високий
   *
   * Емоційна спустошеність (3 questions, max 15):
   *   <8: низький, 8-12: середній, >12: високий
   *   ⚠️ INVERTED COLORS: low exhaustion = GREEN, high = RED
   *
   * TOTAL FORMULA: Достатність + Стратегії - Спустошеність
   * Total levels: <15: низький, 15-30: середній, >30: високий
   */
  calculatePersonalResourceResults(answers: number[]): PersonalResourceResult {
    // Sum scores for each category
    let sufficiencyScore = 0;
    for (const qNum of this.personalResourceSufficiencyQuestions) {
      sufficiencyScore += answers[qNum - 1];
    }

    let copingScore = 0;
    for (const qNum of this.personalResourceCopingQuestions) {
      copingScore += answers[qNum - 1];
    }

    let exhaustionScore = 0;
    for (const qNum of this.personalResourceExhaustionQuestions) {
      exhaustionScore += answers[qNum - 1];
    }

    // Level interpretation functions - each category has different thresholds!
    const getSufficiencyLevel = (
      score: number
    ): { level: string; class: string } => {
      if (score < 13) return { level: 'Низький', class: 'low' };
      if (score <= 21) return { level: 'Середній', class: 'medium' };
      return { level: 'Високий', class: 'high' };
    };

    const getCopingLevel = (
      score: number
    ): { level: string; class: string } => {
      if (score < 13) return { level: 'Низький', class: 'low' };
      if (score <= 18) return { level: 'Середній', class: 'medium' };
      return { level: 'Високий', class: 'high' };
    };

    const getExhaustionLevel = (
      score: number
    ): { level: string; class: string } => {
      // ⚠️ INVERTED: For exhaustion, LOWER score is BETTER
      // So we flip the CSS classes: low score = 'high' (green), high score = 'low' (red)
      if (score < 8) return { level: 'Низький', class: 'high' }; // Low exhaustion = good = green
      if (score <= 12) return { level: 'Середній', class: 'medium' };
      return { level: 'Високий', class: 'low' }; // High exhaustion = bad = red
    };

    const sufficiencyLevel = getSufficiencyLevel(sufficiencyScore);
    const copingLevel = getCopingLevel(copingScore);
    const exhaustionLevel = getExhaustionLevel(exhaustionScore);

    // Calculate total: Достатність + Стратегії - Емоційна спустошеність
    const totalScore = sufficiencyScore + copingScore - exhaustionScore;

    // Determine total level
    let totalLevel: string;
    let totalLevelClass: string;
    if (totalScore < 15) {
      totalLevel = 'Низький';
      totalLevelClass = 'low';
    } else if (totalScore <= 30) {
      totalLevel = 'Середній';
      totalLevelClass = 'medium';
    } else {
      totalLevel = 'Високий';
      totalLevelClass = 'high';
    }

    return {
      sufficiency: {
        name: 'Достатність',
        score: sufficiencyScore,
        maxScore: 30, // 6 questions * 5 max
        level: sufficiencyLevel.level,
        levelClass: sufficiencyLevel.class,
      },
      copingStrategies: {
        name: 'Стратегії подолання',
        score: copingScore,
        maxScore: 20, // 4 questions * 5 max
        level: copingLevel.level,
        levelClass: copingLevel.class,
      },
      emotionalExhaustion: {
        name: 'Емоційна спустошеність',
        score: exhaustionScore,
        maxScore: 15, // 3 questions * 5 max
        level: exhaustionLevel.level,
        levelClass: exhaustionLevel.class,
      },
      totalScore,
      totalLevel,
      totalLevelClass,
    };
  }

  /**
   * Convert Ryff answer to numeric score (1-6)
   *
   * Agreement scale:
   *   1 = "Повністю не згоден"
   *   2 = "Здебільшого не згоден"
   *   3 = "Де в чому не згоден"
   *   4 = "Де в чому згоден"
   *   5 = "Швидше згоден"
   *   6 = "Повністю згоден"
   *
   * Note: Reversal is handled in calculateRyffResults, not here
   */
  convertRyffAnswer(
    rawValue: string,
    questionNum: number,
    email: string
  ): number {
    const normalized = rawValue.trim().toLowerCase();

    // Map text answers to numbers
    if (normalized.includes('повністю не згоден')) return 1;
    if (normalized.includes('здебільшого не згоден')) return 2;
    if (normalized.includes('де в чому не згоден')) return 3;
    if (normalized.includes('де в чому згоден')) return 4;
    if (normalized.includes('швидше згоден')) return 5;
    if (normalized.includes('повністю згоден')) return 6;

    // Try numeric value
    const numValue = parseInt(normalized, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 6) {
      return numValue;
    }

    console.error(
      `ERROR [Ryff]: Unrecognized value for Q${questionNum} (${email}): "${rawValue}"`
    );
    console.error(`  Expected: one of the 6 agreement options (1-6)`);
    return 3; // Default to middle-ish
  }

  /**
   * Calculate Ryff Psychological Well-being results
   *
   * 6 categories with DIFFERENT level thresholds:
   *   - Відносини:      <53 низький, 53-74 середній, >74 високий
   *   - Автономія:      <48 низький, 48-62 середній, >62 високий
   *   - Середовище:     <51 низький, 51-71 середній, >71 високий
   *   - Зростання:      <53 низький, 53-71 середній, >71 високий
   *   - Цілі:           <54 низький, 54-75 середній, >75 високий
   *   - Самосприйняття: <49 низький, 49-71 середній, >71 високий
   *
   * Total: <315 низький, 315-413 середній, >413 високий
   *
   * REVERSED questions: answer is transformed as 7 - answer
   * (so 1→6, 2→5, 3→4, 4→3, 5→2, 6→1)
   */
  calculateRyffResults(answers: number[]): RyffResult {
    const calculateCategoryScore = (categoryDef: {
      name: string;
      questions: { num: number; isReversed: boolean }[];
      lowThreshold: number;
      highThreshold: number;
    }): RyffCategory => {
      let score = 0;
      for (const q of categoryDef.questions) {
        const rawAnswer = answers[q.num - 1]; // Convert to 0-indexed
        // Apply reversal if needed: 7 - answer (1→6, 2→5, 3→4, 4→3, 5→2, 6→1)
        const finalAnswer = q.isReversed ? 7 - rawAnswer : rawAnswer;
        score += finalAnswer;
      }

      // Determine level based on thresholds
      let level: string;
      let levelClass: string;
      if (score < categoryDef.lowThreshold) {
        level = 'Низький';
        levelClass = 'low';
      } else if (score > categoryDef.highThreshold) {
        level = 'Високий';
        levelClass = 'high';
      } else {
        level = 'Середній';
        levelClass = 'medium';
      }

      return {
        name: categoryDef.name,
        score,
        maxScore: 84, // 14 questions × 6 max
        level,
        levelClass,
      };
    };

    // Calculate each category
    const relationships = calculateCategoryScore(
      this.ryffCategories.relationships
    );
    const autonomy = calculateCategoryScore(this.ryffCategories.autonomy);
    const environment = calculateCategoryScore(this.ryffCategories.environment);
    const growth = calculateCategoryScore(this.ryffCategories.growth);
    const purpose = calculateCategoryScore(this.ryffCategories.purpose);
    const selfAcceptance = calculateCategoryScore(
      this.ryffCategories.selfAcceptance
    );

    // Calculate total
    const totalScore =
      relationships.score +
      autonomy.score +
      environment.score +
      growth.score +
      purpose.score +
      selfAcceptance.score;

    // Determine total level
    let totalLevel: string;
    let totalLevelClass: string;
    if (totalScore < this.ryffTotalLowThreshold) {
      totalLevel = 'Низький';
      totalLevelClass = 'low';
    } else if (totalScore > this.ryffTotalHighThreshold) {
      totalLevel = 'Високий';
      totalLevelClass = 'high';
    } else {
      totalLevel = 'Середній';
      totalLevelClass = 'medium';
    }

    return {
      relationships,
      autonomy,
      environment,
      growth,
      purpose,
      selfAcceptance,
      totalScore,
      totalLevel,
      totalLevelClass,
    };
  }

  calculateAverage(answers: number[], questionNumbers: number[]): number {
    const values = questionNumbers.map((qNum) => answers[qNum - 1]);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }

  parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  }

  clearData(): void {
    this.respondents = [];
    this.fileName = '';
    this.errorMessage = '';
  }

  setActiveTab(
    tab: 'san' | 'shtepa' | 'basicph' | 'personalresource' | 'ryff'
  ): void {
    this.activeTab = tab;
  }

  getSanScaleClass(value: number): string {
    if (value >= 5.5) return 'high';
    if (value >= 4) return 'medium';
    return 'low';
  }

  getShtepaScoreClass(score: number, maxScore: number): string {
    const percentage = score / maxScore;
    if (percentage >= 0.75) return 'high';
    if (percentage >= 0.5) return 'medium';
    return 'low';
  }

  getBasicPhScoreClass(score: number, maxScore: number): string {
    const percentage = score / maxScore;
    if (percentage >= 0.66) return 'high';
    if (percentage >= 0.33) return 'medium';
    return 'low';
  }

  // Calculate overall САН averages
  get overallWellbeing(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce((acc, r) => acc + r.san.wellbeing, 0);
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallActivity(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce((acc, r) => acc + r.san.activity, 0);
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallMood(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce((acc, r) => acc + r.san.mood, 0);
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  // Calculate overall Штепа average
  get overallShtepaScore(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.shtepa.totalScore,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallShtepaLevel(): { level: string; class: string } {
    const score = this.overallShtepaScore;
    if (score <= 56) {
      return {
        level: 'Психологічна ресурсність не діагностується',
        class: 'not-diagnosed',
      };
    } else if (score <= 69) {
      return { level: 'Низький рівень', class: 'low' };
    } else if (score <= 92) {
      return { level: 'Середній рівень', class: 'medium' };
    } else if (score <= 106) {
      return { level: 'Високий рівень', class: 'high' };
    } else {
      return { level: 'Сумнівні дані', class: 'doubtful' };
    }
  }

  // Calculate overall Basic Ph averages by category
  getOverallBasicPhCategory(code: string): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce((acc, r) => {
      const cat = r.basicPh.categories.find((c) => c.code === code);
      return acc + (cat ? cat.score : 0);
    }, 0);
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallBasicPhTotal(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.basicPh.totalScore,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  // Calculate overall Personal Resource averages
  get overallPersonalResourceSufficiency(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.personalResource.sufficiency.score,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallPersonalResourceCoping(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.personalResource.copingStrategies.score,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallPersonalResourceExhaustion(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.personalResource.emotionalExhaustion.score,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallPersonalResourceTotal(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.personalResource.totalScore,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallPersonalResourceLevel(): { level: string; class: string } {
    const score = this.overallPersonalResourceTotal;
    if (score < 15) {
      return { level: 'Низький', class: 'low' };
    } else if (score <= 30) {
      return { level: 'Середній', class: 'medium' };
    } else {
      return { level: 'Високий', class: 'high' };
    }
  }

  // Calculate overall Ryff averages
  get overallRyffRelationships(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.ryff.relationships.score,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallRyffAutonomy(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.ryff.autonomy.score,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallRyffEnvironment(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.ryff.environment.score,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallRyffGrowth(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.ryff.growth.score,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallRyffPurpose(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.ryff.purpose.score,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallRyffSelfAcceptance(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce(
      (acc, r) => acc + r.ryff.selfAcceptance.score,
      0
    );
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallRyffTotal(): number {
    if (this.respondents.length === 0) return 0;
    const sum = this.respondents.reduce((acc, r) => acc + r.ryff.totalScore, 0);
    return Math.round((sum / this.respondents.length) * 100) / 100;
  }

  get overallRyffLevel(): { level: string; class: string } {
    const score = this.overallRyffTotal;
    if (score < this.ryffTotalLowThreshold) {
      return { level: 'Низький', class: 'low' };
    } else if (score > this.ryffTotalHighThreshold) {
      return { level: 'Високий', class: 'high' };
    } else {
      return { level: 'Середній', class: 'medium' };
    }
  }

  // Helper to get level class for individual Ryff categories
  getRyffCategoryLevel(
    score: number,
    lowThreshold: number,
    highThreshold: number
  ): { level: string; class: string } {
    if (score < lowThreshold) {
      return { level: 'Низький', class: 'low' };
    } else if (score > highThreshold) {
      return { level: 'Високий', class: 'high' };
    } else {
      return { level: 'Середній', class: 'medium' };
    }
  }

  // ============================================================================
  // RYFF DETAIL MODAL
  // ============================================================================

  /**
   * Open the Ryff detail modal showing question-by-question breakdown
   */
  openRyffDetail(respondent: Respondent, categoryKey: string): void {
    this.ryffDetailRespondent = respondent;

    // Get category definition
    const categoryDef = (this.ryffCategories as any)[categoryKey];
    if (!categoryDef) {
      console.error(`Unknown Ryff category: ${categoryKey}`);
      return;
    }

    this.ryffDetailCategory = categoryDef.name;

    // Build question details
    this.ryffDetailQuestions = categoryDef.questions.map(
      (q: { num: number; isReversed: boolean }) => {
        const rawAnswer = respondent.ryffAnswers[q.num - 1]; // 0-indexed
        const finalAnswer = q.isReversed ? 7 - rawAnswer : rawAnswer;
        return {
          num: q.num,
          rawAnswer,
          finalAnswer,
          isReversed: q.isReversed,
        };
      }
    );

    this.showRyffDetailModal = true;
  }

  /**
   * Close the Ryff detail modal
   */
  closeRyffDetail(): void {
    this.showRyffDetailModal = false;
    this.ryffDetailRespondent = null;
    this.ryffDetailCategory = '';
    this.ryffDetailQuestions = [];
  }

  /**
   * Get Ryff category total from detail questions
   */
  get ryffDetailTotal(): number {
    return this.ryffDetailQuestions.reduce((sum, q) => sum + q.finalAnswer, 0);
  }
}
