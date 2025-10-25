"use client";

import React, { useMemo } from 'react';
import { useAppContext } from '../provider';
import { ChartBarIcon, UsersIcon, CalendarIcon, CompanyIcon, StarIcon, MapPinIcon, ClockIcon, TagIcon } from '@/components/icons';

export default function AnalyticsPage() {
  const { contacts, events, companies, lists } = useAppContext();

  const analytics = useMemo(() => {
    const visibleContacts = contacts.filter(c => !c.hidden);
    const visibleEvents = events.filter(e => !e.hidden);
    const visibleCompanies = companies.filter(c => !c.hidden);

    const favoriteContacts = visibleContacts.filter(c => c.isFavorite).length;
    const featuredContacts = visibleContacts.filter(c => c.featured).length;

    const contactsByType: Record<string, number> = {};
    visibleContacts.forEach(c => {
      if (c.contactType) {
        contactsByType[c.contactType] = (contactsByType[c.contactType] || 0) + 1;
      }
    });
    const topContactTypes = Object.entries(contactsByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const contactsByState: Record<string, number> = {};
    visibleContacts.forEach(c => {
      if (c.locationState) {
        contactsByState[c.locationState] = (contactsByState[c.locationState] || 0) + 1;
      }
    });
    const topLocations = Object.entries(contactsByState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const allTags = Array.from(new Set(visibleContacts.flatMap(c => c.tags || [])));
    const tagCounts: Record<string, number> = {};
    visibleContacts.forEach(c => {
      c.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const now = new Date();
    const recentContacts = visibleContacts
      .filter(c => c.id.startsWith('contact_'))
      .slice(0, 5);

    const upcomingFollowUps = visibleContacts
      .filter(c => c.follow_up_date && new Date(c.follow_up_date) > now)
      .sort((a, b) => new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime())
      .slice(0, 5);

    const upcomingEvents = visibleEvents
      .filter(e => e.date && new Date(e.date) > now)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .slice(0, 5);

    const contactsWithEvents = visibleContacts.filter(c => c.eventLinks && c.eventLinks.length > 0).length;
    const contactsWithCompanies = visibleContacts.filter(c => c.companyId).length;

    return {
      totalContacts: visibleContacts.length,
      totalEvents: visibleEvents.length,
      totalCompanies: visibleCompanies.length,
      totalLists: lists.length,
      favoriteContacts,
      featuredContacts,
      topContactTypes,
      topLocations,
      topTags,
      allTags: allTags.length,
      recentContacts,
      upcomingFollowUps,
      upcomingEvents,
      contactsWithEvents,
      contactsWithCompanies,
    };
  }, [contacts, events, companies, lists]);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] pt-16">
      <div className="px-4 py-6 pb-24 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-6">Analytics</h1>
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-xl border border-[rgb(var(--color-border))]">
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon className="h-5 w-5 text-[rgb(var(--color-primary))]" />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Contacts</span>
            </div>
            <div className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{analytics.totalContacts}</div>
          </div>

          <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-xl border border-[rgb(var(--color-border))]">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-5 w-5 text-[rgb(var(--color-primary))]" />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Events</span>
            </div>
            <div className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{analytics.totalEvents}</div>
          </div>

          <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-xl border border-[rgb(var(--color-border))]">
            <div className="flex items-center gap-2 mb-2">
              <CompanyIcon className="h-5 w-5 text-[rgb(var(--color-primary))]" />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Companies</span>
            </div>
            <div className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{analytics.totalCompanies}</div>
          </div>

          <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-xl border border-[rgb(var(--color-border))]">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="h-5 w-5 text-[rgb(var(--color-primary))]" />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Lists</span>
            </div>
            <div className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{analytics.totalLists}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-[rgb(var(--color-bg-secondary))] p-6 rounded-xl border border-[rgb(var(--color-border))]">
            <div className="flex items-center gap-2 mb-4">
              <StarIcon className="h-5 w-5 text-[rgb(var(--color-primary))]" />
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Contact Stats</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Favorites</span>
                <span className="font-semibold text-[rgb(var(--color-text-primary))]">{analytics.favoriteContacts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Featured</span>
                <span className="font-semibold text-[rgb(var(--color-text-primary))]">{analytics.featuredContacts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">With Events</span>
                <span className="font-semibold text-[rgb(var(--color-text-primary))]">{analytics.contactsWithEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">With Companies</span>
                <span className="font-semibold text-[rgb(var(--color-text-primary))]">{analytics.contactsWithCompanies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Total Tags</span>
                <span className="font-semibold text-[rgb(var(--color-text-primary))]">{analytics.allTags}</span>
              </div>
            </div>
          </div>

          <div className="bg-[rgb(var(--color-bg-secondary))] p-6 rounded-xl border border-[rgb(var(--color-border))]">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="h-5 w-5 text-[rgb(var(--color-primary))]" />
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Upcoming Follow-ups</h3>
            </div>
            {analytics.upcomingFollowUps.length > 0 ? (
              <div className="space-y-2">
                {analytics.upcomingFollowUps.map(contact => (
                  <div key={contact.id} className="flex justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))] truncate flex-1">{contact.name}</span>
                    <span className="text-sm text-[rgb(var(--color-text-tertiary))] ml-2">
                      {new Date(contact.follow_up_date!).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[rgb(var(--color-text-secondary))]">No upcoming follow-ups</p>
            )}
          </div>
        </div>

        {/* Top Contact Types */}
        <div className="bg-[rgb(var(--color-bg-secondary))] p-6 rounded-xl border border-[rgb(var(--color-border))] mb-4">
          <div className="flex items-center gap-2 mb-4">
            <UsersIcon className="h-5 w-5 text-[rgb(var(--color-primary))]" />
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Top Contact Types</h3>
          </div>
          {analytics.topContactTypes.length > 0 ? (
            <div className="space-y-3">
              {analytics.topContactTypes.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-[rgb(var(--color-text-secondary))]">{type}</span>
                      <span className="font-semibold text-[rgb(var(--color-text-primary))]">{count}</span>
                    </div>
                    <div className="w-full bg-[rgb(var(--color-bg-primary))] rounded-full h-2">
                      <div
                        className="bg-[rgb(var(--color-primary))] h-2 rounded-full"
                        style={{ width: `${(count / analytics.totalContacts) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[rgb(var(--color-text-secondary))]">No contact types yet</p>
          )}
        </div>

        {/* Top Locations */}
        <div className="bg-[rgb(var(--color-bg-secondary))] p-6 rounded-xl border border-[rgb(var(--color-border))] mb-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPinIcon className="h-5 w-5 text-[rgb(var(--color-primary))]" />
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Top Locations</h3>
          </div>
          {analytics.topLocations.length > 0 ? (
            <div className="space-y-3">
              {analytics.topLocations.map(([location, count]) => (
                <div key={location} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-[rgb(var(--color-text-secondary))]">{location}</span>
                      <span className="font-semibold text-[rgb(var(--color-text-primary))]">{count}</span>
                    </div>
                    <div className="w-full bg-[rgb(var(--color-bg-primary))] rounded-full h-2">
                      <div
                        className="bg-[rgb(var(--color-primary))] h-2 rounded-full"
                        style={{ width: `${(count / analytics.totalContacts) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[rgb(var(--color-text-secondary))]">No location data yet</p>
          )}
        </div>

        {/* Top Tags */}
        <div className="bg-[rgb(var(--color-bg-secondary))] p-6 rounded-xl border border-[rgb(var(--color-border))] mb-4">
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="h-5 w-5 text-[rgb(var(--color-primary))]" />
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Most Used Tags</h3>
          </div>
          {analytics.topTags.length > 0 ? (
            <div className="space-y-3">
              {analytics.topTags.map(([tag, count]) => (
                <div key={tag} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-[rgb(var(--color-text-secondary))]">{tag}</span>
                      <span className="font-semibold text-[rgb(var(--color-text-primary))]">{count}</span>
                    </div>
                    <div className="w-full bg-[rgb(var(--color-bg-primary))] rounded-full h-2">
                      <div
                        className="bg-[rgb(var(--color-primary))] h-2 rounded-full"
                        style={{ width: `${(count / analytics.totalContacts) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[rgb(var(--color-text-secondary))]">No tags yet</p>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-[rgb(var(--color-bg-secondary))] p-6 rounded-xl border border-[rgb(var(--color-border))]">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="h-5 w-5 text-[rgb(var(--color-primary))]" />
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Upcoming Events</h3>
          </div>
          {analytics.upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {analytics.upcomingEvents.map(event => (
                <div key={event.id} className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))] truncate flex-1">{event.name}</span>
                  <span className="text-sm text-[rgb(var(--color-text-tertiary))] ml-2">
                    {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[rgb(var(--color-text-secondary))]">No upcoming events</p>
          )}
        </div>
      </div>
    </div>
  );
}
