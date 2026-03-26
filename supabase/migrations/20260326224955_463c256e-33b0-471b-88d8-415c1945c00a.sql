-- Retroactively set completed_at for tokens where response_data shows
-- the user reached the 'advisor' or 'results' step AND completed 3+ questionnaire sections
UPDATE public.questionnaire_tokens qt
SET completed_at = COALESCE(qt.completed_at, qr.updated_at)
FROM public.questionnaire_responses qr
WHERE qr.token_id = qt.id
  AND qt.completed_at IS NULL
  AND (
    qr.response_data->>'step' IN ('advisor', 'results')
  )
  AND (
    (CASE WHEN qr.response_data->'skillsAssignments' IS NOT NULL AND qr.response_data->>'skillsAssignments' != '{}' THEN 1 ELSE 0 END)
    + (CASE WHEN (qr.response_data->>'scheinBonusApplied')::boolean = true THEN 1 ELSE 0 END)
    + (CASE WHEN qr.response_data->'considerationsData' IS NOT NULL AND qr.response_data->>'considerationsData' != '{}' THEN 1 ELSE 0 END)
    + (CASE WHEN qr.response_data->'hollandAnswers' IS NOT NULL AND qr.response_data->>'hollandAnswers' != '{}' THEN 1 ELSE 0 END)
    + (CASE WHEN (qr.response_data->>'viaBonusApplied')::boolean = true THEN 1 ELSE 0 END)
    + (CASE WHEN qr.response_data->'preferencesData' IS NOT NULL AND qr.response_data->>'preferencesData' != '{}' AND qr.response_data->'personalitySliders' IS NOT NULL AND qr.response_data->>'personalitySliders' != '{}' THEN 1 ELSE 0 END)
    + (CASE WHEN qr.response_data->'motivationData' IS NOT NULL AND qr.response_data->>'motivationData' != '{}' THEN 1 ELSE 0 END)
  ) >= 3;