"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../provider';
import { ListsIcon, PlusIcon, UsersIcon, TrashIcon, EditIcon } from '@/components/icons';

export default function ListsPage() {
  const router = useRouter();
  const { lists, contacts, handleCreateList, handleDeleteList } = useAppContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListColor, setNewListColor] = useState('#3b82f6');

  const handleCreate = () => {
    if (newListName.trim()) {
      handleCreateList({
        name: newListName.trim(),
        description: newListDescription.trim() || undefined,
        contactIds: [],
        color: newListColor
      });
      setNewListName('');
      setNewListDescription('');
      setNewListColor('#3b82f6');
      setShowCreateModal(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the list "${name}"?`)) {
      handleDeleteList(id);
    }
  };

  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] pt-16">
      <div className="px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-6">Lists</h1>
        {/* Create Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-[rgb(var(--color-primary))] text-white rounded-xl hover:opacity-90 transition-opacity"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="font-semibold">Create New List</span>
        </button>

        {/* Lists */}
        {lists.length === 0 ? (
          <div className="text-center py-12">
            <ListsIcon className="h-16 w-16 mx-auto mb-4 text-[rgb(var(--color-text-tertiary))]" />
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">No lists yet</h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">Create lists to organize your contacts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map(list => {
              const contactCount = list.contactIds.length;
              return (
                <div
                  key={list.id}
                  className="bg-[rgb(var(--color-bg-secondary))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden"
                >
                  <div
                    onClick={() => router.push(`/lists/${list.id}`)}
                    className="p-4 cursor-pointer hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: list.color || '#3b82f6' }}
                        >
                          <ListsIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[rgb(var(--color-text-primary))]">{list.name}</h3>
                          {list.description && (
                            <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">{list.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(list.id, list.name);
                        }}
                        className="p-2 hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-5 w-5 text-[rgb(var(--color-text-tertiary))]" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                      <UsersIcon className="h-4 w-4" />
                      <span>{contactCount} {contactCount === 1 ? 'contact' : 'contacts'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-2xl p-6 max-w-md w-full border border-[rgb(var(--color-border))]">
            <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4">Create New List</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  List Name *
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list name"
                  className="w-full px-4 py-2 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  Description
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                  rows={3}
                  className="w-full px-4 py-2 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewListColor(color)}
                      className={`w-10 h-10 rounded-full border-2 ${newListColor === color ? 'border-[rgb(var(--color-text-primary))]' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewListName('');
                  setNewListDescription('');
                  setNewListColor('#3b82f6');
                }}
                className="flex-1 px-4 py-2 bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] rounded-lg hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newListName.trim()}
                className="flex-1 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
