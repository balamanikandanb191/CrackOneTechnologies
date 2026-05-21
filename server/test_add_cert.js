async function addTestCertificate() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/certificates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                certificateId: 'CRACKONE-2026-001',
                name: 'Balamanikandan S',
                course: 'Full Stack Development',
                issueDate: '2026-05-21'
            })
        });
        const data = await response.json();
        console.log("Certificate Updated:", data);
    } catch (err) {
        console.error("Error:", err);
    }
}

addTestCertificate();
