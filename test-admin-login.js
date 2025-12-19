// Remove node-fetch requirement as we'll use native fetch (Node 18+)
// or dynamic import if needed. But let's try native first.

const url = 'http://localhost:3003/api/admin/login';
const credentials = {
    username: 'OMARADMIN',
    password: 'OMAR0091bh%'
};

console.log('Testing Admin Login...');
console.log(`URL: ${url}`);

const runTest = async () => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log('Result:', JSON.stringify({ status: response.status, data }, null, 2));

        if (response.status === 200 && data.success) {
            console.log('✅ Login SUCCESS');
        } else {
            console.log('❌ Login FAILED');
        }
    } catch (error) {
        console.error('❌ Connection Error:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    }
};

runTest();
