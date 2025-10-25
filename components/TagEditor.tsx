"use client";
import React, { useState, useMemo } from 'react';
import { XIcon } from './icons';

interface TagEditorProps {
    tags: string[];
    setTags: (tags: string[]) => void;
    allTags: string[];
}

const TagEditor: React.FC<TagEditorProps> = ({ tags, setTags, allTags }) => {
    const [inputValue, setInputValue] = useState('');

    const suggestions = useMemo(() => {
        if (!inputValue) return [];
        return allTags.filter(
            (tag) =>
                tag.toLowerCase().includes(inputValue.toLowerCase()) &&
                !tags.includes(tag)
        );
    }, [inputValue, allTags, tags]);

    const addTag = (tag: string) => {
        const newTag = tag.trim();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="relative">
            <div className="flex flex-wrap gap-1 mb-2">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-secondary))] rounded-full">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-primary))]">
                            <XIcon className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag..."
                    className="flex-grow w-full bg-[rgb(var(--color-bg-tertiary))] p-2 rounded focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))]"
                />
                <button type="button" onClick={() => addTag(inputValue)} className="px-3 py-2 font-semibold bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-text))] rounded hover:bg-[rgb(var(--color-primary-hover))]">Add</button>
            </div>
            {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] rounded-md shadow-lg">
                    <ul className="max-h-40 overflow-auto">
                        {suggestions.map(suggestion => (
                            <li key={suggestion} 
                                className="px-3 py-2 cursor-pointer hover:bg-[rgb(var(--color-bg-tertiary))]"
                                onMouseDown={(e) => { e.preventDefault(); addTag(suggestion); }}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TagEditor;
