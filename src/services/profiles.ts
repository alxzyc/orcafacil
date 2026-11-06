import { BaseService, type ServiceResult } from './base';
import { supabase } from '../infrastructure/supabaseClient';

// Database row types
interface ProfileRow {
  id: string;
  company_name: string;
  created_at: string;
}

interface ProfileInsert {
  id: string; // Same as auth.users.id
  company_name: string;
}

interface ProfileUpdate {
  company_name?: string;
}

class ProfileService extends BaseService<ProfileRow, ProfileInsert> {
  protected tableName = 'profiles';

  // Get current user's profile
  async getCurrentProfile(): Promise<ServiceResult<ProfileRow>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated'), success: false };
    }

    return this.getById(user.id);
  }

  // Get profile by user ID
  async getByUserId(userId: string): Promise<ServiceResult<ProfileRow>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { data: null, error, success: false };
    }

    return { data: data as ProfileRow, error: null, success: true };
  }

  // Create profile for new user (called after signup)
  async createForUser(userId: string, companyName: string): Promise<ServiceResult<ProfileRow>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .insert({ id: userId, company_name: companyName })
      .select()
      .single();

    if (error) {
      return { data: null, error, success: false };
    }

    return { data: data as ProfileRow, error: null, success: true };
  }

  // Update profile
  async updateCompanyName(userId: string, companyName: string): Promise<ServiceResult<ProfileRow>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update({ company_name: companyName })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error, success: false };
    }

    return { data: data as ProfileRow, error: null, success: true };
  }

  // Check if profile exists for user
  async existsForUser(userId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('id')
      .eq('id', userId)
      .single();

    return !error && !!data;
  }
}

export const profileService = new ProfileService();
export type { ProfileRow, ProfileInsert, ProfileUpdate };



