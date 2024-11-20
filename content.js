chrome.storage.local.get('config', (result) => {
    const config = result.config || {};
  
    const telegramToken = config.telegramToken;
    const telegramChatId = config.telegramChatId;
    const addresses = config.addresses || [];
  
    if (!telegramToken || !telegramChatId || addresses.length === 0) {
      console.warn('%cSolana MEME Patrol: Configuration is incomplete.', 'background: red; font-size: 20px; padding: 5px; border-radius: 5px;');
      return;
    }
  
    console.log('%cMEME patrol script loaded on solscan.io', 'background: green; color: white; font-size: 20px; padding: 5px; border-radius: 5px;');
    console.log('Loaded Configuration:');
    console.log('Telegram Token:', telegramToken);
    console.log('Telegram Chat ID:', telegramChatId);
    console.log('Addresses:', addresses);
  

    async function notify(message) {
        return new Promise(async (resolve) => {
        try {
            const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: telegramChatId,
                    text: message,
                    parse_mode: "HTML"
                }),
            });
            
            if (response.ok) {
                console.log(`Message sent to Telegram: ${message}`);
            } else {
                console.error(`Failed to send message to Telegram: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Error sending message to Telegram:', error);
        } finally {
            setInterval(resolve, 500)
        }
        })
    }
  
    function generateRandomString() {
        let e = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789==--"
        , t = Array(16).join().split(",").map(function() {
            return e.charAt(Math.floor(Math.random() * e.length))
        }).join("")
        , r = Array(16).join().split(",").map(function() {
            return e.charAt(Math.floor(Math.random() * e.length))
        }).join("")
        , n = Math.floor(31 * Math.random())
        , i = "".concat(t).concat(r)
        , o = [i.slice(0, n), "B9dls0fK", i.slice(n)].join("");
        return o
    }
    
    async function fetchTokens(address) {
        if (!address) return;
        console.log(new Date(), address)
    
        let data
        let silent = false
        try {
            const res = await fetch(`https://api-v2.solscan.io/v2/account/tokenaccounts?address=${address}&page=1&page_size=480&type=token&hide_zero=true`, {
                "headers": {
                "sol-aut": generateRandomString()
                },
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            });
            data = await res.json();
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error fetching tokens for ${address}:`, error);
            //   notify(`🟥 Error fetching tokens for ${address}`)
        }
    
        const tokenCache = JSON.parse(localStorage.getItem('tokenCache')) || {};
        const tokenAccounts = data.data.tokenAccounts;
        
        if (!tokenCache[address]) {
            tokenCache[address] = []; 
            silent = true
        }

        for (const account of tokenAccounts) {
            if (!tokenCache[address].includes(account.tokenAddress)) {
 
                tokenCache[address].push(account.tokenAddress);
                if (!silent) {
                    const message = `🟩 ${account.tokenName} $${account.value} 
    ${address}     
    ---
    <a href="https://dexscreener.com/solana/${account.tokenAddress}?maker=${address}">dexscreener</a> 
    <a href="https://pump.fun/coin/${account.tokenAddress}">pump.fun</a> `;
                    await notify(message);  
                }
            }
        }
    
        localStorage.setItem('tokenCache', JSON.stringify(tokenCache));
    }
    
    async function trackTokens() {
        for (const address of addresses) {
            await fetchTokens(address);
        }
    }
    
    setInterval(trackTokens, 30000);
    trackTokens()
});
  