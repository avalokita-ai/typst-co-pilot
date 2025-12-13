import { useCallback } from 'react';
import { usePDFContext } from '@/contexts/PDFContext';

export function useDocumentChat() {
  const { documentMetadata, addMessage, setIsTyping } = usePDFContext();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addMessage({ role: 'user', content });
    setIsTyping(true);

    try {
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/documents/${documentMetadata?.id}/chat`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: content }),
      // });
      // 
      // const reader = response.body?.getReader();
      // // Handle streaming response...

      // Mock AI response based on question type
      let aiResponse = '';
      
      if (content.toLowerCase().includes('summarize')) {
        aiResponse = `Based on my analysis of the document "${documentMetadata?.filename || 'this document'}":

**Summary:**
This document contains important information organized across ${documentMetadata?.pageCount || 'multiple'} pages. The main topics covered include:

1. **Introduction** - Overview of the subject matter
2. **Key Findings** - Critical data and analysis
3. **Recommendations** - Suggested actions and next steps
4. **Conclusion** - Final thoughts and future considerations

Would you like me to elaborate on any specific section?`;
      } else if (content.toLowerCase().includes('key terms')) {
        aiResponse = `Here are the key terms I identified in this document:

• **Term 1** - Definition and context
• **Term 2** - Definition and context  
• **Term 3** - Definition and context
• **Term 4** - Definition and context

These terms are fundamental to understanding the document's content.`;
      } else if (content.toLowerCase().includes('risk')) {
        aiResponse = `I've identified the following potential risks mentioned in the document:

⚠️ **Risk Category 1**
- Likelihood: Medium
- Impact: High
- Mitigation strategies discussed on page 5

⚠️ **Risk Category 2**
- Likelihood: Low
- Impact: Medium
- Monitoring recommendations provided

Would you like more details on any specific risk?`;
      } else {
        aiResponse = `I've analyzed your question about "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}".

Based on the document content, here's what I found:

The document addresses this topic in several sections. Key points include:

1. Relevant information from the introduction
2. Supporting data from the main body
3. Conclusions that relate to your question

Is there anything specific you'd like me to clarify?`;
      }

      addMessage({ role: 'assistant', content: aiResponse });
    } catch (error) {
      addMessage({ 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your question. Please try again.' 
      });
    } finally {
      setIsTyping(false);
    }
  }, [documentMetadata, addMessage, setIsTyping]);

  return { sendMessage };
}
