const fs = require('fs');
let content = fs.readFileSync('src/components/history/HistoryDrawer.tsx', 'utf-8');

const oldHandleDelete = `  const handleDeleteSession = async (sessionId: string) => {
    if (deletingId) return; // Prevent double-click
    setDeletingId(sessionId);
    
    if (user) {
      try {
        await deleteConversation(sessionId);
        // Remove from local state immediately
        deleteSession(sessionId);
        // Refresh from Supabase to guarantee sync
        const res = await getConversations();
        if (res && res.conversations) {
          const cloudSessions = res.conversations.map((c: any) => ({
            id: c.session_id,
            title: c.title,
            preview: c.preview || '',
            isPinned: c.is_pinned || false,
            messages: [],
            isLoaded: false,
            createdAt: c.created_at ? new Date(c.created_at).getTime() : Date.now(),
            updatedAt: c.updated_at ? new Date(c.updated_at).getTime() : Date.now()
          }));
          setSessions(cloudSessions);
        }
      } catch (err) {
        console.error("Failed to delete conversation:", err);
        alert("Couldn't delete this conversation.");
        // Don't remove from UI if backend failed
      }
    } else {
      // Guest: just remove locally
      deleteSession(sessionId);
    }
    setDeletingId(null);
  };`;

const newHandleDelete = `  const handleDeleteSession = (sessionId: string) => {
    // 1. Optimistic UI Deletion: Instantly remove the session from the frontend store
    deleteSession(sessionId);
    
    // 2. Background Sync
    if (user) {
      deleteConversation(sessionId)
        .then(async () => {
          // Optionally, silently sync the full list in the background to ensure cursor health
          // But we don't block the UI for this.
          const res = await getConversations();
          if (res && res.conversations) {
            const cloudSessions = res.conversations.map((c: any) => ({
              id: c.session_id,
              title: c.title,
              preview: c.preview || '',
              isPinned: c.is_pinned || false,
              messages: [],
              isLoaded: false,
              createdAt: c.created_at ? new Date(c.created_at).getTime() : Date.now(),
              updatedAt: c.updated_at ? new Date(c.updated_at).getTime() : Date.now()
            }));
            // Only update if drawer is still open to prevent race conditions jumping the list
            if (isDrawerOpen) {
               setSessions(cloudSessions);
            }
          }
        })
        .catch(err => {
          console.error("Failed to delete conversation from server:", err);
        });
    }
  };`;

content = content.replace(oldHandleDelete, newHandleDelete);
fs.writeFileSync('src/components/history/HistoryDrawer.tsx', content);
console.log("Updated delete logic to be instantly optimistic.");
