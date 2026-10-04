/**
 * Skill tags are stored as typed ("Node.js") and matched by key ("node.js"),
 * so "React", "react" and " REACT " are the same skill.
 * Keep in sync with the backfill pipeline in services/database.service.js.
 */
export const toSkillKey = (tag) => String(tag ?? '').trim().toLowerCase();

export const toSkillKeys = (tags = []) => [...new Set(tags.map(toSkillKey).filter(Boolean))];
