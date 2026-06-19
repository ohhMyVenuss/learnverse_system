import React, { useState, useEffect } from 'react';
import { FiAward } from 'react-icons/fi';
import RoleBadge from './RoleBadge';
import postApi from '../../api/postApi';
import { mapUserToUi } from '../../utils/blogMappers';

/**
 * Sidebar hiển thị stats, trending topics và top contributors
 */
const SidebarStats = () => {
  const [stats, setStats] = useState({ postsCount: 0, commentsCount: 0 });
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        setIsLoading(true);
        const [statsData, topicsData, contributorsData] = await Promise.all([
          postApi.getBlogStats(),
          postApi.getTrendingTopics(3),
          postApi.getTopContributors(3),
        ]);
        
        setStats(statsData);
        setTrendingTopics(topicsData);
        setTopContributors(contributorsData);
      } catch (error) {
        console.error('Failed to load sidebar data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSidebarData();
  }, []);
  return (
    <aside className="space-y-6">
      {/* This Week Stats */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#111c32] to-[#0b1324] p-6 text-white shadow-xl shadow-gray-900/40">
        <p className="text-sm font-semibold uppercase tracking-wide text-white/70">This week</p>
        <div className="mt-4 flex items-center gap-10">
          <div>
            <p className="text-4xl font-semibold leading-none">
              {isLoading ? '...' : stats.postsCount || 0}
            </p>
            <p className="mt-1 text-sm text-white/70">Posts</p>
          </div>
          <div>
            <p className="text-4xl font-semibold leading-none">
              {isLoading ? '...' : stats.commentsCount || 0}
            </p>
            <p className="mt-1 text-sm text-white/70">Comments</p>
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="rounded-3xl bg-gray-900 p-6 text-white shadow-xl shadow-gray-300/50">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-300">
            Trending topics
          </p>
          <FiAward className="text-2xl text-amber-300" />
        </div>
        <div className="mt-5 space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-4">Loading...</div>
          ) : trendingTopics.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No trending topics yet</div>
          ) : (
            trendingTopics.map((topic) => (
              <div key={topic.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-semibold">{topic.title}</p>
                <p className="text-sm text-gray-300">{topic.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="rounded-3xl bg-white p-6 shadow-xl shadow-gray-200/50">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Top contributors
          </p>
          <FiAward className="text-xl text-amber-400" />
        </div>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-400 py-4">Loading...</div>
          ) : topContributors.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No contributors yet</div>
          ) : (
            topContributors.map((contributor, idx) => {
              const user = mapUserToUi(
                contributor.userId,
                contributor.userFullName,
                contributor.userAvatarUrl,
                contributor.userRole
              );
              return (
                <div
                  key={contributor.userId}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {idx + 1}. {user.name}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <RoleBadge role={user.role} />
                        <span className="ml-3 text-gray-400">
                          {contributor.contributions} contributions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Community Tips */}
      <div className="rounded-3xl bg-gray-900 p-6 text-white shadow-xl shadow-gray-200/50">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          Community tips
        </p>
        <h3 className="mt-3 text-2xl font-semibold leading-tight">
          Craft clear prompts
          <br />
          & celebrate best answers weekly.
        </h3>
        <p className="mt-4 text-sm text-gray-300">
          Every time you mark a best answer, both author and responder earn trust points and
          visibility.
        </p>
        <button className="mt-6 inline-flex items-center rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">
          View guidelines
        </button>
      </div>
    </aside>
  );
};

export default SidebarStats;

