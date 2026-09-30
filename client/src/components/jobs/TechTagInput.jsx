import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

const TechTagInput = ({ tags = [], onChange, placeholder = 'Add a technology', maxTags = 15, id }) => {
  const [input, setInput] = useState('');
  const atLimit = tags.length >= maxTags;

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onChange([...tags, trimmed]);
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
          className="input flex-1"
        />
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
