/**
 * Parses a course code to extract level and semester.
 *
 * Rules:
 *  - Extract all digits from the code
 *  - First digit × 100 = level
 *  - Last digit odd  → "First" semester
 *  - Last digit even → "Second" semester
 *
 * Examples:
 *  COSC403 → { level: 400, semester: "First" }
 *  COSC316 → { level: 300, semester: "Second" }
 *  CSC101  → { level: 100, semester: "First" }
 */
export const parseCourseCode = (code) => {
  if (!code || typeof code !== 'string') return null

  const digits = code.replace(/\D/g, '') // extract only digits
  if (digits.length === 0) return null

  const firstDigit = parseInt(digits[0], 10)
  const lastDigit  = parseInt(digits[digits.length - 1], 10)

  const level    = firstDigit * 100
  const semester = lastDigit % 2 !== 0 ? 'First' : 'Second'

  // Validate level is within allowed range
  if (![100, 200, 300, 400, 500].includes(level)) return null

  return { level, semester }
}

/**
 * Checks if a student can take a course based on their level.
 * Student can take current level or any lower level (carryover).
 * Student cannot take courses above their level.
 *
 * @param {number} studentLevel - e.g. 400
 * @param {number} courseLevel  - e.g. 300
 * @returns {boolean}
 */
export const canTakeCourse = (studentLevel, courseLevel) => {
  return courseLevel <= studentLevel
}
