async function createHashPasscode(textToHash) {
    try {
        const response = await fetch("http://localhost:3000/hash/md5/hex?value=" + encodeURIComponent(textToHash), {
            method: 'GET',
        });
        const data = await response.json();
        console.log('Hashed value:', data.hash);
        return data.hash;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function randomString(length) {
    const charOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    const charLength = charOptions.length;
    for (let i = 0; i < length; i++) {
        res += charOptions.charAt(Math.floor(Math.random() * charLength));
    }
    return res;
}
