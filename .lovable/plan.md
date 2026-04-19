

## Verify Colorful Questionnaires on Mobile & Desktop

The VIA, Schein, and Motivation questionnaires have been updated with the gamified color palette (coral → sunny → sky → success). To verify they render correctly across devices:

**Plan:**
1. Navigate to the application at `/#/app` to access the questionnaire hub
2. Test **VIA Questionnaire**:
   - Check the StarRating sunny/gold star colors
   - Verify gradient progress bar (coral → sunny → success)
   - Confirm on mobile (390×844) and desktop (1366×768)
3. Test **Schein Questionnaire**:
   - Check 1-7 scale buttons with color progression (coral at 1-2, sunny at 3-4, sky at 5, success at 6-7)
   - Verify glow shadows on selected buttons
4. Test **Motivation Questionnaire**:
   - Check Part A (clusters) and Part B (intentions) color-coded 1-5 scales
   - Verify gradient progress bar updates correctly across both parts
5. Document any contrast, sizing, or layout issues found

**Technical approach:**
- Use `browser--navigate_to_sandbox` with viewport sizing
- Use `browser--screenshot` for visual verification at each breakpoint
- Check StarRating, SCALE_COLORS buttons, and progress bars specifically

