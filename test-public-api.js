const url = 'https://supersite-b48c.onrender.com/api/save-feedback';

const feedback = {
    name: "Test User",
    feedback: "This is a test feedback from the debugger script.",
    rating: 5
};

console.log('Testing Public API (Save Feedback)...');
console.log(`URL: ${url}`);

const runTest = async () => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedback)
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log('Raw Response:', text);

        try {
            const data = JSON.parse(text);
            console.log('Parsed Data:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Response is not JSON');
        }
    } catch (error) {
        console.error('❌ Connection Error:', error.message);
    }
};

runTest();
