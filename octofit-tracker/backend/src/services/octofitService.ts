import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') throw httpError(400, 'Invalid activity input');
  const body = input as Record<string, unknown>;
  const userId = body.userId;
  const teamId = body.teamId;
  const type = body.type;
  const minutes = body.minutes;

  if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) throw httpError(400, 'Invalid userId');
  if (typeof teamId !== 'string' || !mongoose.isValidObjectId(teamId)) throw httpError(400, 'Invalid teamId');
  if (typeof type !== 'string' || !type.trim()) throw httpError(400, 'Activity type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) throw httpError(400, 'Minutes must be positive');

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user) throw httpError(404, 'User not found');
  if (!team) throw httpError(404, 'Team not found');

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') throw httpError(400, 'Invalid team input');
  const body = input as Record<string, unknown>;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const mascot = typeof body.mascot === 'string' ? body.mascot.trim() : '';
  if (!name) throw httpError(400, 'Team name is required');

  const rawMembers = Array.isArray(body.members) ? body.members : [];
  if (rawMembers.some((member) => typeof member !== 'string' || !mongoose.isValidObjectId(member))) {
    throw httpError(400, 'Invalid team member id');
  }
  const memberIds = rawMembers as string[];
  return Team.create({ name, mascot, members: memberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1 } },
  ]);

  const ranked: Array<{ teamName: string; totalPoints: number; rank: number }> = [];
  for (const [index, total] of totals.entries()) {
    const team = await Team.findById(total._id).lean();
    if (team) ranked.push({ teamName: team.name, totalPoints: total.totalPoints, rank: index + 1 });
  }
  return ranked;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.toLowerCase() }).lean();
  if (!user) throw httpError(404, 'User not found');

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const focusCandidates = [user.fitnessGoal?.toLowerCase(), recentActivity?.type?.toLowerCase()].filter(Boolean) as string[];
  const workouts = await Workout.find().lean();
  const selected = workouts.find((workout) => focusCandidates.includes(workout.focus.toLowerCase()))
    ?? workouts.find((workout) => workout.focus.toLowerCase() === user.fitnessGoal?.toLowerCase())
    ?? workouts[0];
  if (!selected) return [];

  const reason = recentActivity
    ? `Matches your recent ${recentActivity.type} activity and ${user.fitnessGoal} goal`
    : `Matches your ${user.fitnessGoal} fitness goal`;
  return [{ ...selected, reason }];
}

export { User };
