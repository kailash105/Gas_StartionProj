const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createStaffUser = onCall(
    { region: "us-central1" },
    async (request) => {
        try {
            const context = request.auth;
            const data = request.data;

            // 🔐 Auth check
            if (!context) {
                throw new HttpsError("unauthenticated", "Login required");
            }

            const adminUid = context.uid;

            // 🔎 Verify admin role
            const adminSnap = await admin
                .firestore()
                .doc(`users/${adminUid}`)
                .get();

            if (!adminSnap.exists || adminSnap.data().role !== "admin") {
                throw new HttpsError(
                    "permission-denied",
                    "Only admin can create staff"
                );
            }

            const { email, password, name } = data;

            // 🛡️ Validate input
            if (!email || !password || !name) {
                throw new HttpsError(
                    "invalid-argument",
                    "Email, password and name are required"
                );
            }

            // 🔐 Create Auth user
            const userRecord = await admin.auth().createUser({
                email,
                password,
                displayName: name,
            });

            // 🧾 Create Firestore profile
            await admin.firestore().doc(`users/${userRecord.uid}`).set({
                email,
                name,
                role: "staff", // staff = no login in UI
                createdBy: adminUid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            return { success: true, uid: userRecord.uid };
        } catch (error) {
            console.error("createStaffUser failed:", error);

            // Convert unknown errors to Firebase-safe error
            if (error instanceof HttpsError) {
                throw error;
            }

            throw new HttpsError("internal", error.message);
        }
    }
);
