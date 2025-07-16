const WEBHOOK_URL = 'https://disnotsham.app.n8n.cloud/webhook/upload';

export const uploadFile = async (
  file: File,
  id: string,
  dispatch: React.Dispatch<any>
): Promise<void> => {
  try {
    // Update status to uploading
    dispatch({ type: 'UPDATE_FILE_STATUS', payload: { id, status: 'uploading' } });

    // Create FormData with the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    formData.append('fileId', id);

    console.log('Uploading file:', file.name, 'with ID:', id);

    // Send file to webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', response.headers);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read response as text first
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    // Check if it's the "File Uploaded" confirmation (case insensitive)
    if (responseText.trim().toLowerCase() === 'file uploaded') {
      console.log('File uploaded confirmation received');
      dispatch({ type: 'UPDATE_FILE_STATUS', payload: { id, status: 'uploaded' } });
      dispatch({ type: 'UPDATE_FILE_STATUS', payload: { id, status: 'processing' } });
      
      // Start polling for the summary
      pollForSummary(id, dispatch);
      return;
    }

    // If it's not the upload confirmation, try to parse as summary
    await handleSummaryResponse(responseText, id, dispatch);

  } catch (error) {
    console.error('Upload failed:', error);
    dispatch({ 
      type: 'UPDATE_FILE_STATUS', 
      payload: { 
        id, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Upload failed' 
      } 
    });
  }
};

const pollForSummary = async (
  id: string, 
  dispatch: React.Dispatch<any>,
  maxAttempts: number = 30,
  interval: number = 2000
): Promise<void> => {
  let attempts = 0;
  
  const poll = async () => {
    try {
      attempts++;
      console.log(`Polling for summary (attempt ${attempts}/${maxAttempts}) for file ID: ${id}`);
      
      // Create a simple request to check for summary
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_summary',
          fileId: id
        })
      });

      if (response.ok) {
        const responseText = await response.text();
        console.log(`Poll response for ${id}:`, responseText);
        
        // Try to parse as JSON summary
        if (responseText.trim() !== 'File Uploaded' && responseText.trim() !== '') {
          await handleSummaryResponse(responseText, id, dispatch);
          return; // Success, stop polling
        }
      }

      // Continue polling if we haven't reached max attempts
      if (attempts < maxAttempts) {
        setTimeout(poll, interval);
      } else {
        console.error(`Max polling attempts reached for file ${id}`);
        dispatch({ 
          type: 'UPDATE_FILE_STATUS', 
          payload: { 
            id, 
            status: 'error', 
            error: 'Summary generation timed out' 
          } 
        });
      }
    } catch (error) {
      console.error(`Polling error for file ${id}:`, error);
      if (attempts < maxAttempts) {
        setTimeout(poll, interval);
      } else {
        dispatch({ 
          type: 'UPDATE_FILE_STATUS', 
          payload: { 
            id, 
            status: 'error', 
            error: 'Failed to retrieve summary' 
          } 
        });
      }
    }
  };

  // Start polling after a short delay
  setTimeout(poll, interval);
};

const handleSummaryResponse = async (
  responseText: string,
  id: string,
  dispatch: React.Dispatch<any>
): Promise<void> => {
  try {
    // Try to parse as JSON
    const jsonResponse = JSON.parse(responseText);
    console.log('Parsed JSON response:', jsonResponse);
    
    let summaryText = '';
    
    // Handle array format: [{"text": "..."}]
    if (Array.isArray(jsonResponse) && jsonResponse.length > 0 && jsonResponse[0].text) {
      summaryText = jsonResponse[0].text;
    }
    // Handle direct object format: {"text": "..."}
    else if (jsonResponse.text) {
      summaryText = jsonResponse.text;
    }
    // Handle other possible formats
    else if (typeof jsonResponse === 'string') {
      summaryText = jsonResponse;
    }
    else {
      console.warn('Unexpected JSON format:', jsonResponse);
      summaryText = JSON.stringify(jsonResponse, null, 2);
    }

    if (summaryText) {
      console.log('Summary extracted:', summaryText.substring(0, 100) + '...');
      dispatch({ type: 'SET_FILE_SUMMARY', payload: { id, summary: summaryText } });
    } else {
      throw new Error('No summary text found in response');
    }

  } catch (parseError) {
    // If it's not JSON, treat as plain text summary
    console.log('Response is not JSON, treating as plain text summary');
    if (responseText.trim() && responseText.trim().toLowerCase() !== 'file uploaded') {
      dispatch({ type: 'SET_FILE_SUMMARY', payload: { id, summary: responseText } });
    } else {
      throw new Error('Empty or invalid summary response');
    }
  }
};