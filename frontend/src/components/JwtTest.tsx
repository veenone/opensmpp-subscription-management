import React from 'react';
import { jwtDecode } from 'jwt-decode';

const JwtTest: React.FC = () => {
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJmaXJzdE5hbWUiOiJBZG1pbiIsImxhc3ROYW1lIjoiVXNlciIsImFjdGl2ZSI6dHJ1ZSwiaWF0IjoxNzU2Njg3NTkxLCJleHAiOjE3NTY2OTExOTF9.VRJ77tcDnmbqlGyyDTiYKZ_Klo3XzNwfX5UewPviV20';

  const testJwtParsing = () => {
    try {
      console.log('Testing JWT parsing...');
      console.log('Token:', testToken);
      
      const decoded = jwtDecode(testToken) as any;
      console.log('✅ JWT parsing successful!');
      console.log('Decoded payload:', decoded);
      
      // Test expiration check
      const exp = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const isExpired = exp <= now;
      
      console.log(`Token expiry: ${new Date(exp)}`);
      console.log(`Current time: ${new Date(now)}`);
      console.log(`Is expired: ${isExpired}`);
      
      return {
        success: true,
        decoded,
        isExpired
      };
    } catch (error) {
      console.error('❌ JWT parsing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  React.useEffect(() => {
    const result = testJwtParsing();
    console.log('JWT Test Result:', result);
  }, []);

  const handleTestClick = () => {
    const result = testJwtParsing();
    alert(JSON.stringify(result, null, 2));
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>JWT Test Component</h3>
      <p>This component tests JWT token parsing using jwt-decode library.</p>
      <button 
        onClick={handleTestClick}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test JWT Parsing
      </button>
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Check the browser console for detailed output.
      </div>
    </div>
  );
};

export default JwtTest;