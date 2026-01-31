
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xpfouncmrrnblyakjzhi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4TpeeqNbH6KUWgTTr33VpQ_cifsGNjk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
