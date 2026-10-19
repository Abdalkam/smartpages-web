// src/database/trainerDB.ts
//
// Patched. Changes vs. original:
//   - `normalizeRole` helper lowercases role strings and validates against
//     the same set the SQL CHECK constraint allows ('admin','trainer','trainee').
//   - `getTrainers` filters by the normalized lowercase role so a row saved
//     with `role: "Trainer"` (capitalized) is no longer hidden.
//   - `addTrainer` / `updateTrainer` normalize role before persisting so
//     the local DB never stores a mixed-case role in the first place.
import { db } from "./db";
import type { User } from "../types";

const ALLOWED_ROLES = new Set(["admin", "trainer", "trainee"]);

function normalizeRole(role: unknown): string | undefined {
  if (typeof role !== "string") return undefined;
  const r = role.trim().toLowerCase();
  return ALLOWED_ROLES.has(r) ? r : undefined;
}

// Helper: tenant match that tolerates camelCase (local writes) and
// snake_case (rows mirrored straight from Supabase by the sync hooks).
function sameTenant(u: any, tenantId?: string): boolean {
    if (!tenantId) return true;
    return u?.tenantId === tenantId || u?.tenant_id === tenantId;
}

// =============================
// GET ALL TRAINERS
// Pass tenantId to scope to one institution (recommended — the local DB can
// hold users from more than one tenant after multi-tenant logins).
// =============================
export async function getTrainers(tenantId?: string): Promise<User[]> {
    const all = await db.users
        .filter(user => normalizeRole(user.role) === "trainer")
        .toArray();
    return all.filter(u => sameTenant(u, tenantId));
}

// =============================
// GET TRAINER BY ID
// =============================
export async function getTrainer(id: string): Promise<User | undefined> {
    return await db.users.get(id);
}

// =============================
// CREATE TRAINER
// =============================
export async function addTrainer(trainer: User): Promise<void> {
    // Normalize role before persisting so the local DB never stores a
    // mixed-case role that the lowercase `role === "trainer"` filter would
    // miss downstream.
    const normalized = normalizeRole((trainer as any).role) ?? "trainee";
    const record: User = { ...trainer, role: normalized as any };

    // Usernames are CASE-SENSITIVE at login, but two users differing only by
    // capitalization would be a support trap — block them within the tenant,
    // mirroring createUserApi's duplicate guard.
    const uname = (record.username || "").trim().toLowerCase();
    if (uname) {
        const existing = await db.users
            .filter(u =>
                (u.username || "").trim().toLowerCase() === uname &&
                sameTenant(u, (record as any).tenantId || (record as any).tenant_id)
            )
            .first();
        if (existing) {
            throw new Error("A user with this username already exists in this institution (names that differ only by capitalization are not allowed).");
        }
    }

    // put (not add): idempotent when the sync hooks rewrite the same row;
    // add() throws a raw ConstraintError on a repeated id.
    await db.users.put(record);
}

// =============================
// UPDATE TRAINER
// =============================
export async function updateTrainer(trainer: User): Promise<void> {
    // Normalize role on update too — keeps the local row consistent with
    // the lowercase filter used by getTrainers().
    const normalized = normalizeRole((trainer as any).role) ?? "trainee";
    const record: User = { ...trainer, role: normalized as any };

    // Block renaming into a collision with another user in the same tenant.
    if (record.username) {
        const uname = record.username.trim().toLowerCase();
        const clash = await db.users
            .filter(u =>
                u.id !== record.id &&
                (u.username || "").trim().toLowerCase() === uname &&
                sameTenant(u, (record as any).tenantId || (record as any).tenant_id)
            )
            .first();
        if (clash) {
            throw new Error("That username is already taken by another user in this institution.");
        }
    }

    await db.users.put(record);
}

// =============================
// DELETE TRAINER
// =============================
export async function deleteTrainer(id: string): Promise<void> {
    await db.users.delete(id);
}
