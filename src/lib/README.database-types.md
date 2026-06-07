# Types TypeScript Supabase

## Régénérer les types complets

```bash
npx supabase gen types typescript --project-id llxgyomevketvypusafl --schema public > src/lib/database.types.ts
```

Ou via le MCP Supabase dans Claude Code/Cursor :
- Appeler `mcp__supabase__generate_typescript_types` avec `project_id="llxgyomevketvypusafl"`

## Utilisation dans le code React

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Maintenant typé automatiquement
const { data: leads } = await supabase
  .from('leads')
  .select('id, full_name, email, status, score')
  .eq('owner_id', userId)
```
