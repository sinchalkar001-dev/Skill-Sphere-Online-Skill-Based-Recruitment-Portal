import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

const TechTagInput = ({ tags = [], onChange, placeholder = 'Add technology...', maxTags = 15 }) => {
  const [input, setInput] = useState('');

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
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/15 text-primary-400 text-sm rounded-lg border border-primary-500/20"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:text-red-400 transition-colors"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length >= maxTags ? 'Max tags reached' : placeholder}
          disabled={tags.length >= maxTags}
          className="input flex-1"
        />
        <button
          type="button"
          onClick={() => addTag(input)}
          disabled={!input.trim() || tags.length >= maxTags}
          className="btn-secondary px-3"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-surface-500 mt-1">
        Press Enter or comma to add. {tags.length}/{maxTags}
      </p>
    </div>
  );
};

export default TechTagInput;
