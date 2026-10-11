export async function readAnalysisResponse(response) {
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch {
    const messages = {
      413: 'This PDF is too large for the deployed API. Choose a PDF smaller than 4 MB.',
      401: 'The API is protected. Check the Vercel deployment access settings.',
      403: 'Access to the API was denied. Check the Vercel deployment access settings.',
      404: 'The analysis API was not found. Check the Vercel /api routing.',
      504: 'The server timed out. Please try again or check the Vercel function logs.'
    };
    throw new Error(messages[response.status] || `The API returned an unexpected response (HTTP ${response.status}). Check the backend Vercel function logs.`);
  }
  if (!response.ok) throw new Error(typeof data?.message === 'string' ? data.message : `Analysis failed (HTTP ${response.status}).`);
  if (!data || typeof data.score !== 'number' || !Number.isFinite(data.score) || data.score < 0 || data.score > 100 ||
      !Array.isArray(data.presentSkills) || !Array.isArray(data.missingSkills) ||
      ![...data.presentSkills, ...data.missingSkills].every(skill => typeof skill === 'string') || typeof data.summary !== 'string') {
    throw new Error('The API returned an invalid analysis. Check the backend deployment.');
  }
  return data;
}
