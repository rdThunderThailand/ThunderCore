import { SupabaseClient } from '@supabase/supabase-js';

export class BaseRepository {
    constructor(protected supabase: SupabaseClient) { }
}
