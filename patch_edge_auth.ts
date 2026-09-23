import * as fs from 'fs';

let content = fs.readFileSync('supabase/functions/lexi-chat/index.ts', 'utf8');

const oldAuthCheck = `      let authenticatedUser = null;
      if (authHeader) {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (user && !error) {
          authenticatedUser = user;
        }
      }`;

const newAuthCheck = `      let authenticatedUser = null;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '').trim();
        const { data: { user }, error } = await supabaseClient.auth.getUser(token);
        
        console.log("EDGE AUTH DEBUG:", {
          hasAuthorizationHeader: !!authHeader,
          authenticated: !!user,
          userId: user ? user.id : null,
          error: error ? error.message : null
        });

        if (user && !error) {
          authenticatedUser = user;
        }
      } else {
        console.log("EDGE AUTH DEBUG:", {
          hasAuthorizationHeader: false,
          authenticated: false,
          userId: null
        });
      }`;

content = content.replace(oldAuthCheck, newAuthCheck);

const oldPersistUserMessage = `        // Save the new incoming user message to the database
        if (conversationId) {
          await supabaseClient.from('messages').insert({
            conversation_id: conversationId,
            role: 'user',
            content: message,
            dictionary_data: null,
            events: null
          });
        }`;

const newPersistUserMessage = `        // Save the new incoming user message to the database
        if (conversationId) {
          const { error: msgError } = await supabaseClient.from('messages').insert({
            conversation_id: conversationId,
            role: 'user',
            content: message,
            dictionary_data: null,
            events: null
          });
          console.log("MESSAGE DEBUG [USER]:", { userMessageSaved: !msgError, databaseErrorCode: msgError?.code || null });
        }`;

content = content.replace(oldPersistUserMessage, newPersistUserMessage);

const oldPersistAssistantMessage = `      // Persist assistant response
      if (authenticatedUser && conversationId) {
        await supabaseClient.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: finalResponse,
          dictionary_data: dictionaryData,
          events: events.length > 0 ? events : null
        });
        
        // Touch updated_at (or let Postgres trigger handle it, but we can do a manual update just in case)
        await supabaseClient.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
      }`;

const newPersistAssistantMessage = `      // Persist assistant response
      if (authenticatedUser && conversationId) {
        const { error: asstMsgError } = await supabaseClient.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: finalResponse,
          dictionary_data: dictionaryData,
          events: events.length > 0 ? events : null
        });
        console.log("MESSAGE DEBUG [ASSISTANT]:", { assistantMessageSaved: !asstMsgError, databaseErrorCode: asstMsgError?.code || null });
        
        // Touch updated_at (or let Postgres trigger handle it, but we can do a manual update just in case)
        await supabaseClient.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
      }`;

content = content.replace(oldPersistAssistantMessage, newPersistAssistantMessage);

// Also add CONVERSATION DEBUG
const oldConvInsert = `        if (convData) {
          conversationId = convData.id;`;

const newConvInsert = `        if (convData) {
          conversationId = convData.id;
          console.log("CONVERSATION DEBUG:", { lookupSuccess: true, conversationCreated: false, conversationId, databaseErrorCode: null });`;

content = content.replace(oldConvInsert, newConvInsert);

const oldConvInsertErr = `          if (insertError) {
            console.error("Failed to create conversation:", insertError);
            return new Response(JSON.stringify({ success: false, error: "Database error" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          
          conversationId = newConv?.id;
        }`;

const newConvInsertErr = `          if (insertError) {
            console.error("Failed to create conversation:", insertError);
            console.log("CONVERSATION DEBUG:", { lookupSuccess: false, conversationCreated: false, conversationId: null, databaseErrorCode: insertError.code });
            return new Response(JSON.stringify({ success: false, error: "Database error" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          
          conversationId = newConv?.id;
          console.log("CONVERSATION DEBUG:", { lookupSuccess: false, conversationCreated: true, conversationId, databaseErrorCode: null });
        }`;

content = content.replace(oldConvInsertErr, newConvInsertErr);

fs.writeFileSync('supabase/functions/lexi-chat/index.ts', content);
