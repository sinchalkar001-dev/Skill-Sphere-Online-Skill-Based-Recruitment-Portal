import { useState, useEffect, useId } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import skillsApi from '../../api/skillsApi';
import { useDebounce } from '../../hooks/useDebounce';

const sameSkill = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

const TechTagInput = ({ tags = [], onChange, placeholder = 'Add a technology', maxTags = 15, id }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const listId = useId();
  const debouncedInput = useDebounce(input, 200);
  const atLimit = tags.length >= maxTags;

  // Suggest skills already used on the platform, so tags share one spelling
  useEffect(() => {
    const query = debouncedInput.trim();
    if (!query) {
      setSuggestions([]);
      return undefined;
    }
    let cancelled = false;
    skillsApi
      .suggest(query)
      .then(({ data }) => {
        if (!cancelled) setSuggestions(data.data.skills.map((skill) => skill.name));
      })
      .catch(() => {
        // Suggestions are optional; typing a new tag still works
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedInput]);

  const addTag = (tag) => {
    const trimmed = tag.trim();
    // "react" becomes "React" when the catalogue already knows the skill
    const name = suggestions.find((suggestion) => sameSkill(suggestion, trimmed)) || trimmed;
    if (name && !tags.some((existing) => sameSkill(existing, name)) && tags.length < maxTags) {
      onChange([...tags, name]);
    }
    setInput('');
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div>
      {tags.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary-soft py-0.5 pl-2.5 pr-0.5 text-sm font-medium text-primary-soft-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="rounded p-1 transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Remove ${tag}`}
              >
                <XMarkIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={atLimit ? 'Maximum reached' : placeholder}
          disabled={atLimit}
          aria-describedby={id ? `${id}-hint` : undefined}
          list={listId}
          autoComplete="off"
          className="input flex-1"
        />
        <datalist id={listId}>
          {suggestions
            .filter((name) => !tags.some((existing) => sameSkill(existing, name)))
            .map((name) => (
              <option key={name} value={name} />
            ))}
        </datalist>
        <button
          type="button"
          onClick={() => addTag(input)}
          disabled={!input.trim() || atLimit}
          className="btn-secondary flex-shrink-0 px-4"
        >
          <PlusIcon aria-hidden="true" className="h-4 w-4" />
          Add
        </button>
      </div>
      <p id={id ? `${id}-hint` : undefined} className="hint">
        Press Enter or comma to add. {tags.length} of {maxTags} used.
      </p>
    </div>
  );
};

export default TechTagInput;
