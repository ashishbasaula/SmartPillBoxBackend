const axios = require('axios');


// OneSignal API keys (Store them securely in environment variables)
const ONE_SIGNAL_APP_ID = 'e04b857e-a5a0-42ae-9039-b70b18a53722';
const ONE_SIGNAL_REST_API_KEY = 'os_v2_app_4bfyk7vfubbk5ebzw4frrjjxelw6nlo7h45e3lmsfumwxqclb6s74txg677i5ynim6nech3ueo3ffju7fruk7yqgryihizbqpc6u62q';

// Function to send notification via OneSignal
const sendNotification = (title, message, tokens) => {
    console.log(tokens);
    const url = 'https://api.onesignal.com/notifications';

    const headers = {
        "Authorization": `Key ${ONE_SIGNAL_REST_API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      };

      const data = {
        app_id: ONE_SIGNAL_APP_ID,
        target_channel: "push",
        contents: { "en": message },
        headings: { "en": title },
        include_player_ids: [tokens]
      };

    axios.post(url, data, { headers })
        .then((response) => {
            console.log('Notification sent successfully:', response.data);
           
        })
        .catch((error) => {
            console.error('Error sending notification:', error.message);
           
        });
};



module.exports = sendNotification