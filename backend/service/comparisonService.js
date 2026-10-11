// Deliberately deterministic. Replace or extend this service when AI is added.
const skills = {
  JavaScript: ['javascript'], TypeScript: ['typescript'], React: ['react', 'reactjs', 'react.js'],
  HTML: ['html', 'html5'], CSS: ['css', 'css3'], Git: ['git'], 'REST APIs': ['rest', 'restful'],
  'Node.js': ['node.js', 'nodejs', 'node js'], Express: ['express', 'express.js'], MongoDB: ['mongodb', 'mongo db'],
  Python: ['python'], Java: ['java'], SQL: ['sql'], PostgreSQL: ['postgresql', 'postgres'],
  Docker: ['docker'], Kubernetes: ['kubernetes', 'k8s'], AWS: ['aws', 'amazon web services'],
  'CI/CD': ['ci/cd', 'continuous integration', 'continuous delivery'],
  'Automated testing': ['automated testing', 'unit testing', 'jest', 'vitest', 'pytest'],
  Angular: ['angular'], Vue: ['vue', 'vue.js'], 'C++': ['c++'], 'C#': ['c#'], Figma: ['figma'],
  'Problem solving': ['problem solving', 'problem-solving'], Communication: ['communication']
};
function includesSkill(text, aliases) {
  return aliases.some(alias => {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i').test(text);
  });
}
export function compareSkills(resumeText, jobDescription) {
  const requiredSkills = Object.keys(skills).filter(skill => includesSkill(jobDescription, skills[skill]));
  const presentSkills = requiredSkills.filter(skill => includesSkill(resumeText, skills[skill]));
  const missingSkills = requiredSkills.filter(skill => !presentSkills.includes(skill));
  return { requiredSkills, presentSkills, missingSkills, score: requiredSkills.length ? Math.round(presentSkills.length / requiredSkills.length * 100) : null, method: 'keyword-match' };
}
