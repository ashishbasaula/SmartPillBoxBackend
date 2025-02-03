const firebaseApp = require("../config/database_config");  // Ensure this file correctly initializes Firebase
const { getDatabase, ref, get, update } = require("firebase/database");
const { getFirestore, collection, getDocs, addDoc, setDoc, doc } = require("firebase/firestore");
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
                        const updatePath = `users/${userId}/medicines/${medicineId}`;

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
                            await update(ref(db,`${updatePath}`), {
                                "dose":medicineDetails.dose-1
                            } );

                            await logMedicineIntake(medicineId, userId);
                            await addData(`User/${userId}/history/`, {
                                medicineId: medicineId,
                                dose: medicineDetails.dose,
                                name: medicineDetails.name,
                                remainderTime: medicineDetails.remainderTime,
                                remainderDays: medicineDetails.remainderDays,
                                amount: medicineDetails.amount,
                                type: medicineDetails.type,
                                date: new Date().toISOString()
                            });

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

// for updating the intake 
async function logMedicineIntake(medicineId, userId) {
    const medicineRef = ref(db, `users/${userId}/medicines/${medicineId}/intakeLog`);
    const todayDate = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD

    try {
        await update(medicineRef, {
            [todayDate]: true
        });
        console.log(`Medicine intake logged for ${todayDate}`);
    } catch (e) {
        console.error(`Error logging intake: ${e}`);
    }
}

async function addData(collectionPath, data, id) {
    try {
        if (id) {
            await setDoc(doc(firestoreDb, collectionPath, id), data, { merge: true });
            console.log('Data successfully merged with the existing document.');
        } else {
            await addDoc(collection(firestoreDb, collectionPath), data);
            console.log('New document added successfully.');
        }
    } catch (e) {
        console.error('Error adding data:', e);
    }
}

// Schedule the cron job to run every minute
cron.schedule("* * * * *", checkMedicineIntake);

// Optionally export the function if needed elsewhere
module.exports = checkMedicineIntake;
