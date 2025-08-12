"use client";

import { useEffect, useState } from 'react';
import {
    Trophy, Crown, Medal, Award, Wallet
} from 'lucide-react';

interface LeaderboardUser {
    id: string;
    username: string;
    walletAddress: string;
    debateId: number | null;
    team: number | null;
    joinedAt: string | null;
    rank: number;
}

function getRankIcon(rank: number) {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <Trophy className="w-5 h-5 text-indigo-400" />;
}

function getRankColor(rank: number) {
    if (rank === 1) return 'from-yellow-400 to-orange-500';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-500 to-orange-600';
    return 'from-indigo-500 to-purple-500';
}

function formatWalletAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function LeaderboardCompact() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const response = await fetch("https://argumint-3y9b.onrender.com/globalLeaderboard");
                const data = await response.json();

                // Map API data to LeaderboardUser type and add rank
                const mapped: LeaderboardUser[] = data.map((user: LeaderboardUser, idx: number) => ({
                    id: user.id,
                    username: user.username,
                    walletAddress: user.walletAddress,
                    debateId: user.debateId,
                    team: user.team,
                    joinedAt: user.joinedAt,
                    rank: idx + 1,
                }));

                setUsers(mapped);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
            setLoading(false);
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-lg">
                <div className="text-white text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-80 space-y-4">
            {/* Top 3 Mini Podium */}
            {users.length >= 3 && (
                <div className="flex items-end justify-center gap-2">
                    {[1, 0, 2].map((i, idx) => {
                        const user = users[i];
                        if (!user) return null;

                        return (
                            <div key={user.id} className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(user.rank)} rounded-xl blur opacity-50 group-hover:opacity-80 transition-opacity`}></div>
                                <div className={`relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-xl p-3 text-center shadow-lg border border-white/10 ${idx === 1 ? 'min-h-[120px] transform scale-105' : 'min-h-[100px]'} flex flex-col justify-between transition-all duration-300`}>
                                    <div>
                                        <div className={`w-8 h-8 bg-gradient-to-r ${getRankColor(user.rank)} rounded-lg flex items-center justify-center text-white text-sm font-bold mx-auto mb-2 shadow-lg`}>
                                            {user.username[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="mb-1 flex justify-center scale-75">{getRankIcon(user.rank)}</div>
                                        <h3 className="text-white font-bold text-xs mb-1 truncate">{user.username}</h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Compact Leaderboard List */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl blur opacity-30 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-white/10">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-center gap-2 tracking-wide" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Leaderboard</span>
                    </h2>

                    {users.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-sm">No participants yet</div>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
                            {users.slice(0, 10).map((user: LeaderboardUser) => (
                                <div key={user.id} className="group relative">
                                    <div className="relative flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all duration-300">
                                        {/* Rank */}
                                        <div className={`w-8 h-8 bg-gradient-to-r ${getRankColor(user.rank)} rounded-lg flex items-center justify-center shadow-lg transition-all duration-300`}>
                                            {user.rank <= 3 ? (
                                                <div className="scale-75">{getRankIcon(user.rank)}</div>
                                            ) : (
                                                <span className="text-white font-bold text-xs">{user.rank}</span>
                                            )}
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg border border-white/10">
                                            {user.username[0]?.toUpperCase() || 'U'}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-bold text-sm truncate" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>{user.username}</span>
                                                {user.rank === 1 && <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                                                <Wallet className="w-3 h-3 flex-shrink-0 text-indigo-400" />
                                                <span className="font-mono font-medium">{formatWalletAddress(user.walletAddress)}</span>
                                            </div>
                                            <div className="text-gray-500 text-xs flex items-center gap-2 font-medium">
                                                {user.debateId && (
                                                    <span>
                                                        <span className="text-indigo-400 font-bold">#{user.debateId}</span>
                                                        {user.team && <span className="ml-1 text-purple-400">T{user.team}</span>}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Rank Badge */}
                                        <div className="text-right">
                                            <div className="text-white font-bold text-lg" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>#{user.rank}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .scrollbar-hide {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
