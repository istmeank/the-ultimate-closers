-- Migration 1: Étendre l'enum app_role uniquement
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'closer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';