const firebaseApp = require("../config/database_config");  // Ensure this file correctly initializes Firebase
const { getDatabase, ref, get, update } = require("firebase/database");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const cron = require("node-cron");
const sendNotification = require("../controller/notification_controller");

// Initialize the databases
const db = getDatabase(firebaseApp);
const firestoreDb = getFirestore(firebaseApp);


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Function to check medicine intake times and update the database
const checkMedicineIntake = async () => {  // Make the function async
    console.log("Checking medicine schedules...");
    const now = new Date();
    const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const usersRef = ref(db, 'users');
    get(usersRef).then(snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(async (userSnapshot) => {  // Use async inside forEach
                const userId = userSnapshot.key;
                const userMedicines = userSnapshot.child('medicines').val();

                Object.entries(userMedicines).forEach(async ([medicineId, medicineDetails]) => { 
                    
                    console.log(dayOfWeek);
                    console.log(currentTime)// Use async inside forEach
                    if (medicineDetails.remainderDays.includes(dayOfWeek) && medicineDetails.remainderTime === currentTime) {
                        const todayIndex = new Date().getDay();
                        const intakePath = `users/${userId}/medicines/${medicineId}/isIntake/${todayIndex}`;
                        try {
                            await update(ref(db), { [intakePath]: true });
                            console.log(`Intake updated for ${medicineDetails.name} of user ${userId}`);

                            const querySnapshot = await getDocs(collection(firestoreDb, "User"));  // Use await here
                            querySnapshot.forEach((doc) => {
                                if (doc.id == userId) {
                                    const userData = doc.data(); // Get all data of the document
                                    const token = userData.notificationToken;
                                    console.log(`User ID: ${doc.id} => Email: ${token}`);
                                    sendNotification("It's Time To Take Medicine 💊💊 ", `Take ${medicineDetails.name} in time`, token)
                                    

                                }
                                
                            });
                            await delay(7000);
                            await update(ref(db), { [intakePath]: false });

                        } catch (error) {
                            console.error("Failed to update intake:", error);
                        }
                    }
                });
            });
        } else {
            console.log("No user data available.");
        }
    }).catch(error => {
        console.error("Error fetching user data:", error);
    });
};

// Schedule the cron job to run every minute
cron.schedule("* * * * *", checkMedicineIntake);

// Optionally export the function if needed elsewhere
module.exports = checkMedicineIntake;
